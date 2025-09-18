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
    const docRef = doc(db, "quizzes", quizId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Quiz;
    }
    return null;
  } catch (error) {
    console.error("Error getting quiz:", error);
    throw error;
  }
};

export const updateQuiz = async (quizId: string, updates: Partial<Omit<Quiz, "id" | "createdAt">>) => {
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
    const quizRef = doc(db, "quizzes", quizId);
    await deleteDoc(quizRef);
    console.log("Quiz deleted successfully");
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
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate() || new Date(),
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
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate() || new Date(),
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

// Group operations - محسن مع تنظيف تلقائي
export const joinQuizAsGroup = async (
  quizId: string,
  groupData: Omit<Group, "id" | "joinedAt" | "score" | "lastActivity">
) => {
  try {
    const groupsRef = collection(db, "quizzes", quizId, "groups");

    // تنظيف المجموعات القديمة أولاً (أكثر من ساعة)
    await cleanupOldGroups(quizId);

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
        (group.lastActivity instanceof Date ? group.lastActivity : (group.lastActivity as any)?.toDate()) || (group.joinedAt instanceof Date ? group.joinedAt : (group.joinedAt as any)?.toDate());

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
        joinedAt: doc.data().joinedAt instanceof Date ? doc.data().joinedAt : doc.data().joinedAt?.toDate() || new Date(),
        lastActivity: doc.data().lastActivity instanceof Date ? doc.data().lastActivity : doc.data().lastActivity?.toDate() || new Date(),
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
        questionStartTime: null, // سيتم تعيينه بعد 5 ثوان
        showResults: false,
        showQuestionOnly: true, // إظهار السؤال فقط لمدة 5 ثوان
        currentQuestionTimeLimit: questions[0]?.timeLimit || 30,
        shuffledQuestions: questions,
      },
      { merge: true }
    );

    // بعد 5 ثوان، إظهار الاختيارات وبدء المؤقت
    setTimeout(async () => {
      await setDoc(
        gameStateRef,
        {
          showQuestionOnly: false,
          questionStartTime: serverTimestamp(),
        },
        { merge: true }
      );
    }, 5000);

    console.log("Quiz started successfully");
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
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current");

    // إظهار السؤال فقط لمدة 5 ثوان
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

    // بعد 5 ثوان، إظهار الاختيارات وبدء المؤقت
    setTimeout(async () => {
      await setDoc(
        gameStateRef,
        {
          showQuestionOnly: false,
          questionStartTime: serverTimestamp(),
        },
        { merge: true }
      );
    }, 5000);

    console.log("Moved to question", questionIndex);
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
    const responsesRef = collection(db, "quizzes", quizId, "responses");
    await addDoc(responsesRef, {
      ...response,
      timestamp: serverTimestamp(),
    });
    console.log("Response submitted successfully");
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
          startedAt: data.startedAt instanceof Date ? data.startedAt : data.startedAt?.toDate() || null,
          questionStartTime: data.questionStartTime?.toDate() || null,
          showResults: data.showResults || false,
          showQuestionOnly: data.showQuestionOnly || false,
          currentQuestionTimeLimit: data.currentQuestionTimeLimit || 30,
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
    const batch = writeBatch(db);

    scores.forEach(({ groupId, score }) => {
      const groupRef = doc(db, "quizzes", quizId, "groups", groupId);
      batch.update(groupRef, { score });
    });

    await batch.commit();
    console.log("Group scores updated successfully");
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
