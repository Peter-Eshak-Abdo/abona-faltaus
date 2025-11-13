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
    // تحقق من الأمان: quizId يجب أن يكون string صالح
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
    // First get the quiz data
    const quizDoc = await getDoc(doc(db, "quizzes", quizId));
    if (!quizDoc.exists()) {
      throw new Error("Quiz not found");
    }

    const quizData = quizDoc.data();

    // Move to trash collection
    await addDoc(collection(db, "trashedQuizzes"), {
      ...quizData,
      originalId: quizId,
      deletedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Delete from main collection
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

// Group operations - محسن مع تنظيف تلقائي وإعادة تعيين المسابقة
export const joinQuizAsGroup = async (
  quizId: string,
  groupData: Omit<Group, "id" | "joinedAt" | "score" | "lastActivity">
) => {
  try {
    // تحقق من الأمان: quizId يجب أن يكون string صالح
    if (!quizId || typeof quizId !== "string" || quizId.length < 10) {
      throw new Error("Invalid quiz ID");
    }

    const groupsRef = collection(db, "quizzes", quizId, "groups");

    // تنظيف المجموعات القديمة أولاً (أكثر من ساعة)
    await cleanupOldGroups(quizId);

    // التحقق من حالة المسابقة وإعادة تعيينها إذا لزم الأمر
    await checkAndResetQuizIfNeeded(quizId);

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
    });

    console.log("Group joined successfully:", docRef.id, "for quiz:", quizId);
    return docRef.id;
  } catch (error) {
    console.error("Error joining quiz:", error);
    throw error;
  }
};

// حذف مجموعة - محسن
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

// تنظيف المجموعات القديمة (أكثر من ساعة)
export const cleanupOldGroups = async (quizId: string) => {
  try {
    const groupsRef = collection(db, "quizzes", quizId, "groups");
    const snapshot = await getDocs(groupsRef);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // ساعة واحدة

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

// التحقق من حالة المسابقة وإعادة تعيينها إذا لزم الأمر (أكثر من 3 ساعات)
export const checkAndResetQuizIfNeeded = async (quizId: string) => {
  try {
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
    const gameStateDoc = await getDoc(gameStateRef);

    if (gameStateDoc.exists()) {
      const gameState = gameStateDoc.data();
      const startedAt = gameState.startedAt?.toDate();

      if (startedAt) {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 ساعات
        if (startedAt < threeHoursAgo) {
          console.log("Quiz is older than 3 hours, resetting...");

          // إعادة تعيين حالة المسابقة
          await setDoc(
            gameStateRef,
            {
              currentQuestionIndex: 0,
              isActive: false,
              startedAt: null,
              questionStartTime: null,
              showResults: false,
              showQuestionOnly: false,
              currentQuestionTimeLimit: 30,
              shuffledQuestions: null,
            },
            { merge: true }
          );

          // حذف جميع الردود
          const responsesRef = collection(db, "quizzes", quizId, "responses");
          const responsesSnapshot = await getDocs(responsesRef);
          const batch = writeBatch(db);
          responsesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });

          // إعادة تعيين نقاط المجموعات
          const groupsRef = collection(db, "quizzes", quizId, "groups");
          const groupsSnapshot = await getDocs(groupsRef);
          groupsSnapshot.docs.forEach((doc) => {
            batch.set(doc.ref, { score: 0 }, { merge: true });
          });

          await batch.commit();
          console.log("Quiz reset successfully");
        }
      }
    }
  } catch (error) {
    console.error("Error checking and resetting quiz:", error);
    // لا نرمي خطأ هنا لأن هذا ليس خطأ حرج
  }
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

// Game state operations - محسن مع مؤقت مخصص
export const startQuiz = async (quizId: string, quiz: Quiz) => {
  try {
    console.log("Starting quiz:", quizId);

    // تحقق من الأمان: quizId يجب أن يكون string صالح
    if (!quizId || typeof quizId !== "string" || quizId.length < 10) {
      throw new Error("Invalid quiz ID");
    }

    // خلط الأسئلة إذا كان مطلوباً
    let questions = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      questions = shuffleArray(questions);
    }

    // خلط الاختيارات إذا كان مطلوباً
    if (quiz.shuffleChoices) {
      questions = questions.map((question) => {
        if (question.type === "multiple-choice") {
          const shuffledChoices = shuffleArrayWithCorrectAnswer(
            question.choices,
            question.correctAnswer
          );
          return {
            ...question,
            choices: shuffledChoices.choices,
            correctAnswer: shuffledChoices.correctAnswer,
          };
        }
        return question;
      });
    }

    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");

    await setDoc(
      gameStateRef,
      {
        currentQuestionIndex: 0,
        isActive: true,
        startedAt: serverTimestamp(),
        questionStartTime: null, // سيتم تعيينه بعد 3 ثوان
        showResults: false,
        showQuestionOnly: true, // إظهار السؤال فقط لمدة 3 ثوان
        currentQuestionTimeLimit: questions[0]?.timeLimit || 30,
        shuffledQuestions: questions,
      },
      { merge: true }
    );

    // بعد 3 ثوان، إظهار الاختيارات وبدء المؤقت
    setTimeout(async () => {
      await setDoc(
        gameStateRef,
        {
          showQuestionOnly: false,
          questionStartTime: serverTimestamp(),
        },
        { merge: true }
      );
    }, 3000);

    console.log("Quiz started successfully with 3s question-only timer");
  } catch (error: any) {
    console.error("Error starting quiz:", error);
    throw new Error(`فشل في بدء الامتحان: ${error.message}`);
  }
};

// دوال مساعدة للخلط
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const shuffleArrayWithCorrectAnswer = (
  choices: string[],
  correctAnswer: number
) => {
  const choicesWithIndex = choices.map((choice, index) => ({
    choice,
    originalIndex: index,
  }));
  const shuffled = shuffleArray(choicesWithIndex);

  const newChoices = shuffled.map((item) => item.choice);
  const newCorrectAnswer = shuffled.findIndex(
    (item) => item.originalIndex === correctAnswer
  );

  return { choices: newChoices, correctAnswer: newCorrectAnswer };
};

export const nextQuestion = async (quizId: string, questionIndex: number) => {
  try {
    console.log("Moving to next question:", questionIndex);

    // تحقق من الأمان: quizId يجب أن يكون string صالح
    if (!quizId || typeof quizId !== "string" || quizId.length < 10) {
      throw new Error("Invalid quiz ID");
    }

    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");

    // إظهار السؤال فقط لمدة 3 ثوان
    await setDoc(
      gameStateRef,
      {
        currentQuestionIndex: questionIndex,
        questionStartTime: null,
        showResults: false,
        showQuestionOnly: true,
      },
      { merge: true }
    );

    // بعد 3 ثوان، إظهار الاختيارات وبدء المؤقت
    setTimeout(async () => {
      await setDoc(
        gameStateRef,
        {
          showQuestionOnly: false,
          questionStartTime: serverTimestamp(),
        },
        { merge: true }
      );
    }, 3000);

    console.log(
      "Moved to question",
      questionIndex,
      "with 3s question-only timer"
    );
  } catch (error) {
    console.error("Error moving to next question:", error);
    throw error;
  }
};

export const showQuestionResults = async (quizId: string) => {
  try {
    console.log("Showing question results for quiz:", quizId);
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");

    await setDoc(
      gameStateRef,
      {
        showResults: true,
      },
      { merge: true }
    );

    console.log("Question results shown");
  } catch (error) {
    console.error("Error showing results:", error);
    throw error;
  }
};

export const endQuiz = async (quizId: string) => {
  try {
    console.log("Ending quiz:", quizId);
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");

    await setDoc(
      gameStateRef,
      {
        isActive: false,
      },
      { merge: true }
    );

    console.log("Quiz ended");
  } catch (error) {
    console.error("Error ending quiz:", error);
    throw error;
  }
};

// Response operations
export const submitResponse = async (
  quizId: string,
  response: Omit<QuizResponse, "id" | "timestamp">
) => {
  try {
    // تحقق من الأمان: quizId و groupId يجب أن يكونا صالحين
    if (!quizId || typeof quizId !== "string" || quizId.length < 10) {
      throw new Error("Invalid quiz ID");
    }
    if (
      !response.groupId ||
      typeof response.groupId !== "string" ||
      response.groupId.length < 10
    ) {
      throw new Error("Invalid group ID");
    }

    // التحقق من حالة المسابقة لمنع الإجابات المتأخرة
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");
    const gameStateDoc = await getDoc(gameStateRef);
    if (gameStateDoc.exists()) {
      const gameState = gameStateDoc.data();
      if (gameState.showResults) {
        console.warn(
          "Late response rejected: results are already shown for question",
          response.questionIndex
        );
        return; // لا نرمي خطأ، فقط نتجاهل
      }
    }

    const responsesRef = collection(db, "quizzes", quizId, "responses");
    await addDoc(responsesRef, {
      ...response,
      timestamp: serverTimestamp(),
    });
    console.log(
      "Response submitted successfully for group",
      response.groupId,
      "question",
      response.questionIndex
    );
  } catch (error) {
    console.error("Error submitting response:", error);
    throw error;
  }
};

export const getQuestionResponses = (
  quizId: string,
  questionIndex: number,
  callback: (responses: QuizResponse[]) => void
) => {
  console.log("Setting up responses listener for question:", questionIndex);
  const responsesRef = collection(db, "quizzes", quizId, "responses");
  const simpleQuery = query(
    responsesRef,
    where("questionIndex", "==", questionIndex)
  );

  return onSnapshot(
    simpleQuery,
    (snapshot) => {
      console.log(
        "Responses update received:",
        snapshot.docs.length,
        "responses"
      );

      const responses = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      }) as QuizResponse[];

      responses.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      console.log("Processed responses:", responses.length);
      callback(responses);
    },
    (error) => {
      console.error("Error listening to responses:", error);
      callback([]);

      if (
        error.code === "failed-precondition" ||
        error.message.includes("index")
      ) {
        console.warn(
          "Index required for responses query. Using fallback method."
        );
      }
    }
  );
};

// Game state listener - محسن
export const subscribeToGameState = (
  quizId: string,
  callback: (gameState: GameState | null) => void
) => {
  console.log("Subscribing to game state for quiz:", quizId);
  const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");

  return onSnapshot(
    gameStateRef,
    (doc) => {
      console.log("Game state update received:", doc.exists(), doc.data());

      if (doc.exists()) {
        const data = doc.data();
        const gameState: GameState = {
          quizId,
          currentQuestionIndex: data.currentQuestionIndex || 0,
          isActive: data.isActive ?? false,
          startedAt:
            data.startedAt instanceof Date
              ? data.startedAt
              : data.startedAt?.toDate() || null,
          questionStartTime: data.questionStartTime?.toDate() || null,
          showResults: data.showResults || false,
          showQuestionOnly: data.showQuestionOnly || false,
          currentQuestionTimeLimit: data.currentQuestionTimeLimit || 30,
          shuffledQuestions: data.shuffledQuestions,
        };
        console.log("Parsed game state:", gameState);
        callback(gameState);
      } else {
        console.log("Game state document does not exist");
        callback(null);
      }
    },
    (error) => {
      console.error("Error listening to game state:", error);
      callback(null);
    }
  );
};

// Update group scores - محسن مع نظام النقاط الجديد
export const updateGroupScores = async (
  quizId: string,
  scores: { groupId: string; score: number }[]
) => {
  try {
    // تحقق من الأمان: quizId يجب أن يكون string صالح
    if (!quizId || typeof quizId !== "string" || quizId.length < 10) {
      throw new Error("Invalid quiz ID");
    }

    const batch = writeBatch(db);

    scores.forEach(({ groupId, score }) => {
      if (!groupId || typeof groupId !== "string" || groupId.length < 10) {
        console.warn("Invalid groupId in updateGroupScores:", groupId);
        return;
      }
      const groupRef = doc(db, "quizzes", quizId, "groups", groupId);
      batch.set(groupRef, { score }, { merge: true });
    });

    await batch.commit();
    console.log(
      "Group scores updated successfully for",
      scores.length,
      "groups in quiz:",
      quizId
    );
  } catch (error) {
    console.error("Error updating group scores:", error);
    throw error;
  }
};

// دالة مساعدة للحصول على الردود بطريقة بديلة
export const getQuestionResponsesOnce = async (
  quizId: string,
  questionIndex: number
): Promise<QuizResponse[]> => {
  try {
    const responsesRef = collection(db, "quizzes", quizId, "responses");
    const q = query(responsesRef, where("questionIndex", "==", questionIndex));

    const snapshot = await getDocs(q);
    const responses = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    }) as QuizResponse[];

    responses.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return responses;
  } catch (error) {
    console.error("Error getting responses once:", error);
    return [];
  }
};

// Trash operations
export const getTrashedQuizzes = async (userId: string) => {
  try {
    const q = query(
      collection(db, "trashedQuizzes"),
      where("createdBy", "==", userId),
      orderBy("deletedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        deletedAt: data.deletedAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    }) as (Quiz & { originalId: string; deletedAt: Date; expiresAt: Date })[];
  } catch (error) {
    console.error("Error getting trashed quizzes:", error);
    return [];
  }
};

export const restoreQuiz = async (trashId: string) => {
  try {
    // Get trashed quiz data
    const trashDoc = await getDoc(doc(db, "trashedQuizzes", trashId));
    if (!trashDoc.exists()) {
      throw new Error("Trashed quiz not found");
    }

    const quizData = trashDoc.data();
    const { originalId, deletedAt, expiresAt, ...cleanData } = quizData;

    // Restore to main collection
    await setDoc(doc(db, "quizzes", originalId), cleanData);

    // Remove from trash
    await deleteDoc(doc(db, "trashedQuizzes", trashId));

    console.log("Quiz restored successfully");
  } catch (error) {
    console.error("Error restoring quiz:", error);
    throw error;
  }
};

export const permanentlyDeleteQuiz = async (trashId: string) => {
  try {
    await deleteDoc(doc(db, "trashedQuizzes", trashId));
    console.log("Quiz permanently deleted");
  } catch (error) {
    console.error("Error permanently deleting quiz:", error);
    throw error;
  }
};

export const cleanupExpiredTrash = async (userId: string) => {
  try {
    const trashedQuizzes = await getTrashedQuizzes(userId);
    const now = new Date();

    const expiredQuizzes = trashedQuizzes.filter(
      (quiz) => quiz.expiresAt < now
    );

    if (expiredQuizzes.length > 0) {
      const batch = writeBatch(db);
      expiredQuizzes.forEach((quiz) => {
        batch.delete(doc(db, "trashedQuizzes", quiz.id));
      });
      await batch.commit();
      console.log(
        `Cleaned up ${expiredQuizzes.length} expired trashed quizzes`
      );
    }

    return expiredQuizzes.length;
  } catch (error) {
    console.error("Error cleaning up expired trash:", error);
    return 0;
  }
};
