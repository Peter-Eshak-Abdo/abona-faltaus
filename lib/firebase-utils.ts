/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Quiz, Group, QuizResponse, GameState } from "@/types/quiz";

// Quiz operations
export const createQuiz = async (quiz: Omit<Quiz, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quiz,
      createdAt: serverTimestamp(),
      isActive: false,
      shuffleQuestions: quiz.shuffleQuestions || false,
      shuffleChoices: quiz.shuffleChoices || false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    if (!quizId || typeof quizId !== "string" || quizId.length < 10) {
      throw new Error("Invalid quiz ID");
    }

    const docRef = doc(db, "quizzes", quizId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Quiz retrieved successfully:", quizId);
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Quiz;
    }
    console.log("Quiz not found:", quizId);
    return null;
  } catch (error) {
    console.error("Error getting quiz:", error);
    throw error;
  }
};

export const updateQuiz = async (
  quizId: string,
  updates: Partial<Omit<Quiz, "id" | "createdAt">>
) => {
  try {
    const quizRef = doc(db, "quizzes", quizId);
    await setDoc(quizRef, updates, { merge: true });
    console.log("Quiz updated successfully");
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    const quizDoc = await getDoc(doc(db, "quizzes", quizId));
    if (!quizDoc.exists()) {
      throw new Error("Quiz not found");
    }

    const quizData = quizDoc.data();

    await addDoc(collection(db, "trashedQuizzes"), {
      ...quizData,
      originalId: quizId,
      deletedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await deleteDoc(doc(db, "quizzes", quizId));
    console.log("Quiz moved to trash successfully");
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
};

export const getUserQuizzes = async (userId: string) => {
  try {
    console.log("Fetching quizzes for user:", userId);

    try {
      const q = query(
        collection(db, "quizzes"),
        where("createdBy", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      console.log("Found", querySnapshot.docs.length, "quizzes with ordering");

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Date
              ? data.createdAt
              : data.createdAt?.toDate() || new Date(),
        };
      }) as Quiz[];
    } catch (indexError: any) {
      console.warn(
        "Index not available, falling back to simple query:",
        indexError.message
      );

      const simpleQuery = query(
        collection(db, "quizzes"),
        where("createdBy", "==", userId)
      );
      const querySnapshot = await getDocs(simpleQuery);
      console.log(
        "Found",
        querySnapshot.docs.length,
        "quizzes without ordering"
      );

      const quizzes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Date
              ? data.createdAt
              : data.createdAt?.toDate() || new Date(),
        };
      }) as Quiz[];

      return quizzes.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
  } catch (error: any) {
    console.error("Error getting user quizzes:", error);

    if (error.code === "permission-denied") {
      console.error("Permission denied. Check Firestore security rules.");
      throw new Error(
        "تم رفض الإذن. يرجى التحقق من المصادقة والمحاولة مرة أخرى."
      );
    } else if (
      error.code === "failed-precondition" ||
      error.message.includes("index")
    ) {
      console.error("Firestore index may be missing for this query.");

      const indexMatch = error.message.match(
        /https:\/\/console\.firebase\.google\.com[^\s]+/
      );
      const indexUrl = indexMatch ? indexMatch[0] : null;

      throw new Error(
        indexUrl
          ? `مطلوب فهرس قاعدة البيانات. انقر هنا لإنشائه: ${indexUrl}`
          : "خطأ في إعداد قاعدة البيانات. يرجى إنشاء الفهرس المطلوب."
      );
    }

    throw error;
  }
};

export const joinQuizAsGroup = async (
  quizId: string,
  groupData: Omit<Group, "id" | "joinedAt" | "score" | "lastActivity">,
  creatorUid?: string
) => {
  try {
    if (!quizId || typeof quizId !== "string" || quizId.length < 10) {
      throw new Error("Invalid quiz ID");
    }

    const groupsRef = collection(db, "quizzes", quizId, "groups");
    // await cleanupOldGroups(quizId);
    // await checkAndResetQuizIfNeeded(quizId);

    const q = query(groupsRef, where("groupName", "==", groupData.groupName));
    const existingGroups = await getDocs(q);

    if (!existingGroups.empty) {
      throw new Error("اسم المجموعة موجود بالفعل");
    }

    const allGroupsSnapshot = await getDocs(groupsRef);
    const existingMembers = new Set<string>();

    allGroupsSnapshot.docs.forEach((doc) => {
      const group = doc.data() as Group;
      group.members.forEach((member) =>
        existingMembers.add(member.toLowerCase())
      );
    });

    const duplicateMembers = groupData.members.filter((member) =>
      existingMembers.has(member.toLowerCase())
    );

    if (duplicateMembers.length > 0) {
      throw new Error(
        `أسماء الأعضاء موجودة بالفعل: ${duplicateMembers.join(", ")}`
      );
    }

    const docRef = await addDoc(groupsRef, {
      ...groupData,
      joinedAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      score: 0,
      ...(creatorUid ? { ownerUid: creatorUid } : {}),
    });

    console.log("Group joined successfully:", docRef.id, "for quiz:", quizId);
    return docRef.id;
  } catch (error) {
    console.error("Error joining quiz:", error);
    throw error;
  }
};

export const deleteGroup = async (quizId: string, groupId: string) => {
  try {
    console.log("Deleting group:", groupId, "from quiz:", quizId);
    const groupRef = doc(db, "quizzes", quizId, "groups", groupId);
    await deleteDoc(groupRef);
    console.log("Group deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error("فشل في حذف المجموعة");
  }
};

export const cleanupOldGroups = async (quizId: string) => {
  try {
    const groupsRef = collection(db, "quizzes", quizId, "groups");
    const snapshot = await getDocs(groupsRef);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const batch = writeBatch(db);
    let deletedCount = 0;

    snapshot.docs.forEach((doc) => {
      const group = doc.data() as Group;
      const lastActivity: Date | undefined =
        (group.lastActivity instanceof Date
          ? group.lastActivity
          : (group.lastActivity as any)?.toDate()) ||
        (group.joinedAt instanceof Date
          ? group.joinedAt
          : (group.joinedAt as any)?.toDate());

      if (lastActivity && lastActivity < oneHourAgo) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      console.log(`Cleaned up ${deletedCount} old groups`);
    }

    return deletedCount;
  } catch (error) {
    console.error("Error cleaning up old groups:", error);
    throw error;
  }
};

export const checkAndResetQuizIfNeeded = async (quizId: string) => {
  // try {
  //   const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
  //   const gameStateDoc = await getDoc(gameStateRef);

  //   if (gameStateDoc.exists()) {
  //     const gameState = gameStateDoc.data();
  //     const startedAt = gameState.startedAt?.toDate();

  //     if (startedAt) {
  //       const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  //       if (startedAt < threeHoursAgo) {
  //         console.log("Quiz is older than 3 hours, resetting...");

  //         await setDoc(
  //           gameStateRef,
  //           {
  //             currentQuestionIndex: 0,
  //             isActive: false,
  //             startedAt: null,
  //             questionStartTime: null,
  //             showResults: false,
  //             showQuestionOnly: false,
  //             currentQuestionTimeLimit: 30,
  //             shuffledQuestions: null,
  //           },
  //           { merge: true }
  //         );

  //         const responsesRef = collection(db, "quizzes", quizId, "responses");
  //         const responsesSnapshot = await getDocs(responsesRef);
  //         const batch = writeBatch(db);
  //         responsesSnapshot.docs.forEach((doc) => {
  //           batch.delete(doc.ref);
  //         });

  //         const groupsRef = collection(db, "quizzes", quizId, "groups");
  //         const groupsSnapshot = await getDocs(groupsRef);
  //         groupsSnapshot.docs.forEach((doc) => {
  //           batch.set(doc.ref, { score: 0 }, { merge: true });
  //         });

  //         await batch.commit();
  //         console.log("Quiz reset successfully");
  //       }
  //     }
  //   }
  // } catch (error) {
  //   console.error("Error checking and resetting quiz:", error);
  // }
  // تم تعطيل المسح التلقائي بناءً على الوقت لضمان استقرار المسابقة
  console.log("Auto-reset disabled to maintain quiz persistence.");
  return;
};

export const getQuizGroups = (
  quizId: string,
  callback: (groups: Group[]) => void
) => {
  const groupsRef = collection(db, "quizzes", quizId, "groups");
  const q = query(groupsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const groups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        joinedAt:
          doc.data().joinedAt instanceof Date
            ? doc.data().joinedAt
            : doc.data().joinedAt?.toDate() || new Date(),
        lastActivity:
          doc.data().lastActivity instanceof Date
            ? doc.data().lastActivity
            : doc.data().lastActivity?.toDate() || new Date(),
      })) as Group[];

      groups.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
      callback(groups);
    },
    (error) => {
      console.error("Error listening to groups:", error);
      callback([]);
    }
  );
};
export const startQuiz = async (quizId: string) => {
  const batch = writeBatch(db);
  const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
  // 1. تصفير الـ Game State
  await setDoc(
    gameStateRef,
    {
      isActive: true,
      currentQuestionIndex: 0,
      questionStartTime: serverTimestamp(),
      showResults: false,
      showQuestionOnly: true,
      startedAt: serverTimestamp(),
    },
    { merge: true },
  );

  // 2. تصفير سكور المجموعات عند البدء الفعلي
  const groupsRef = collection(db, "quizzes", quizId, "groups");
  const groupsSnapshot = await getDocs(groupsRef);
  groupsSnapshot.docs.forEach((doc) => {batch.update(doc.ref, { score: 0 })});

  // 3. مسح أي إجابات قديمة من محاولات سابقة
  const responsesRef = collection(db, "quizzes", quizId, "responses");
  const responsesSnapshot = await getDocs(responsesRef);
  responsesSnapshot.docs.forEach((doc) => {batch.delete(doc.ref)});

  await batch.commit();
};;

export const nextQuestion = async (quizId: string, newIndex: number) => {
  const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
  await setDoc(gameStateRef, {
    currentQuestionIndex: newIndex,
    questionStartTime: serverTimestamp(),
    showResults: false,
  }, { merge: true });
};

export const showQuestionResults = async (quizId: string) => {
  const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
  await setDoc(gameStateRef, { showResults: true }, { merge: true });
};

export const endQuiz = async (quizId: string) => {
  const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
  await setDoc(gameStateRef, { isActive: false, showResults: true }, { merge: true });
};

export const subscribeToGameState = (quizId: string, callback: (gameState: GameState) => void) => {
  const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
  return onSnapshot(gameStateRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as GameState);
    }
  });
};

export const submitResponse = async (quizId: string, groupId: string, questionIndex: number, choiceIndex: number, isCorrect: boolean, timeTaken: number) => {
  const responseRef = collection(db, "quizzes", quizId, "responses");
  await addDoc(responseRef, {
    groupId,
    questionIndex,
    choiceIndex,
    isCorrect,
    timeTaken,
    timestamp: serverTimestamp(),
  });
};

export const getQuestionResponses = async (quizId: string, questionIndex: number) => {
  const responsesRef = collection(db, "quizzes", quizId, "responses");
  const q = query(responsesRef, where("questionIndex", "==", questionIndex));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as QuizResponse);
};

export const updateGroupScores = async (quizId: string, scores: Record<string, number>) => {
  const batch = writeBatch(db);
  // for (const groupId in scores) {
  //   const groupRef = doc(db, "quizzes", quizId, "groups", groupId);
  //   batch.update(groupRef, { score: scores[groupId] });
  // }
  Object.entries(scores).forEach(([groupId, score]) => {
    const groupRef = doc(db, "quizzes", quizId, "groups", groupId);
    batch.update(groupRef, { score });
  });
  await batch.commit();
};

export const getTrashedQuizzes = async (userId: string) => {
    const q = query(
      collection(db, "trashedQuizzes"),
        where("createdBy", "==", userId),
        orderBy("deletedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deletedAt: (doc.data().deletedAt as Timestamp)?.toDate(),
        expiresAt: (doc.data().expiresAt as Timestamp)?.toDate(),
    })) as (Quiz & { originalId: string; deletedAt: Date; expiresAt: Date })[];
};

export const restoreQuiz = async (trashId: string) => {
  const trashDocRef = doc(db, "trashedQuizzes", trashId);
  const trashDoc = await getDoc(trashDocRef);

  if (!trashDoc.exists()) throw new Error("Trashed quiz not found");

  const { originalId, deletedAt, expiresAt, ...quizData } = trashDoc.data();
  // const { originalId, ...rest } = quizData;

  // نرجعها لمجموعة quizzes
  await addDoc(collection(db, "quizzes"), quizData);
  // نمسحها من السلة
  await deleteDoc(doc(db, "trashedQuizzes", trashId));
};;

export const permanentlyDeleteQuiz = async (trashId: string) => {
    const trashDocRef = doc(db, "trashedQuizzes", trashId);
    await deleteDoc(trashDocRef);
};

export const cleanupExpiredTrash = async (userId: string) => {
  const now = new Date();
  const q = query(
    collection(db, "trashedQuizzes"),
    where("createdBy", "==", userId), // إضافة هذا السطر هو السر
    where("expiresAt", "<=", now),
  );

  try {
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Cleanup failed:", error);
    // لا نعطل المستخدم إذا فشل التنظيف التلقائي
  }
};
