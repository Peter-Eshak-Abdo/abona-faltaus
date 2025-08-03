/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase" // Use your existing Firebase config
import type { Quiz, Group, GameState, QuizResponse } from "@/types/quiz"

// Quiz operations
export const createQuiz = async (quiz: Omit<Quiz, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quiz,
      createdAt: serverTimestamp(),
      isActive: false,
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating quiz:", error)
    throw error
  }
}

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    const docRef = doc(db, "quizzes", quizId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Quiz
    }
    return null
  } catch (error) {
    console.error("Error getting quiz:", error)
    throw error
  }
}

export const getUserQuizzes = async (userId: string) => {
  try {
    console.log("Fetching quizzes for user:", userId)

    // First try with ordering by createdAt (requires index)
    try {
      const q = query(collection(db, "quizzes"), where("createdBy", "==", userId), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      console.log("Found", querySnapshot.docs.length, "quizzes with ordering")

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        }
      }) as Quiz[]
    } catch (indexError: any) {
      console.warn("Index not available, falling back to simple query:", indexError.message)

      // Fallback: Simple query without ordering (doesn't require index)
      const simpleQuery = query(collection(db, "quizzes"), where("createdBy", "==", userId))
      const querySnapshot = await getDocs(simpleQuery)
      console.log("Found", querySnapshot.docs.length, "quizzes without ordering")

      const quizzes = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        }
      }) as Quiz[]

      // Sort client-side by createdAt
      return quizzes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }
  } catch (error: any) {
    console.error("Error getting user quizzes:", error)

    // Handle specific Firestore errors
    if (error.code === "permission-denied") {
      console.error("Permission denied. Check Firestore security rules.")
      throw new Error("Permission denied. Please check your authentication and try again.")
    } else if (error.code === "failed-precondition" || error.message.includes("index")) {
      console.error("Firestore index may be missing for this query.")

      // Extract the index creation URL if available
      const indexMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
      const indexUrl = indexMatch ? indexMatch[0] : null

      throw new Error(
        indexUrl
          ? `Database index required. Click here to create it: ${indexUrl}`
          : "Database configuration error. Please create the required Firestore index.",
      )
    }

    throw error
  }
}

// Group operations
export const joinQuizAsGroup = async (quizId: string, groupData: Omit<Group, "id" | "joinedAt" | "score">) => {
  try {
    // Check if group name already exists
    const groupsRef = collection(db, "quizzes", quizId, "groups")
    const q = query(groupsRef, where("groupName", "==", groupData.groupName))
    const existingGroups = await getDocs(q)

    if (!existingGroups.empty) {
      throw new Error("Group name already exists")
    }

    // Check for duplicate member names across all groups
    const allGroupsSnapshot = await getDocs(groupsRef)
    const existingMembers = new Set<string>()

    allGroupsSnapshot.docs.forEach((doc) => {
      const group = doc.data() as Group
      group.members.forEach((member) => existingMembers.add(member.toLowerCase()))
    })

    const duplicateMembers = groupData.members.filter((member) => existingMembers.has(member.toLowerCase()))

    if (duplicateMembers.length > 0) {
      throw new Error(`Member names already exist: ${duplicateMembers.join(", ")}`)
    }

    const docRef = await addDoc(groupsRef, {
      ...groupData,
      joinedAt: serverTimestamp(),
      score: 0,
    })

    return docRef.id
  } catch (error) {
    console.error("Error joining quiz:", error)
    throw error
  }
}

export const getQuizGroups = (quizId: string, callback: (groups: Group[]) => void) => {
  const groupsRef = collection(db, "quizzes", quizId, "groups")

  // Try with ordering first, fallback to simple query
  const q = query(groupsRef, orderBy("joinedAt", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const groups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate() || new Date(),
      })) as Group[]
      callback(groups)
    },
    (error) => {
      console.error("Error listening to groups:", error)

      // Fallback to simple query without ordering
      if (error.code === "failed-precondition") {
        console.warn("Falling back to simple groups query")
        const simpleQuery = query(groupsRef)

        return onSnapshot(simpleQuery, (snapshot) => {
          const groups = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            joinedAt: doc.data().joinedAt?.toDate() || new Date(),
          })) as Group[]

          // Sort client-side
          groups.sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())
          callback(groups)
        })
      }
    },
  )
}

// Game state operations
export const startQuiz = async (quizId: string) => {
  try {
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current")

    // Try to update first, if it doesn't exist, it will create it
    await updateDoc(gameStateRef, {
      currentQuestionIndex: 0,
      isActive: true,
      startedAt: serverTimestamp(),
      questionStartTime: serverTimestamp(),
      showResults: false,
    })
  } catch (error: any) {
    // If document doesn't exist, create it
    if (error.code === "not-found") {
      const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current")
      await addDoc(collection(db, "quizzes", quizId, "gameState"), {
        currentQuestionIndex: 0,
        isActive: true,
        startedAt: serverTimestamp(),
        questionStartTime: serverTimestamp(),
        showResults: false,
      })
    } else {
      console.error("Error starting quiz:", error)
      throw error
    }
  }
}

export const nextQuestion = async (quizId: string, questionIndex: number) => {
  try {
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current")
    await updateDoc(gameStateRef, {
      currentQuestionIndex: questionIndex,
      questionStartTime: serverTimestamp(),
      showResults: false,
    })
  } catch (error) {
    console.error("Error moving to next question:", error)
    throw error
  }
}

export const showQuestionResults = async (quizId: string) => {
  try {
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current")
    await updateDoc(gameStateRef, {
      showResults: true,
    })
  } catch (error) {
    console.error("Error showing results:", error)
    throw error
  }
}

export const endQuiz = async (quizId: string) => {
  try {
    const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current")
    await updateDoc(gameStateRef, {
      isActive: false,
    })
  } catch (error) {
    console.error("Error ending quiz:", error)
    throw error
  }
}

// Response operations
export const submitResponse = async (quizId: string, response: Omit<QuizResponse, "id" | "timestamp">) => {
  try {
    const responsesRef = collection(db, "quizzes", quizId, "responses")
    await addDoc(responsesRef, {
      ...response,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error submitting response:", error)
    throw error
  }
}

export const getQuestionResponses = (
  quizId: string,
  questionIndex: number,
  callback: (responses: QuizResponse[]) => void,
) => {
  const responsesRef = collection(db, "quizzes", quizId, "responses")

  // Try with ordering first
  const q = query(responsesRef, where("questionIndex", "==", questionIndex), orderBy("timestamp", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const responses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as QuizResponse[]
      callback(responses)
    },
    (error) => {
      console.error("Error listening to responses:", error)

      // Fallback to simple query
      if (error.code === "failed-precondition") {
        const simpleQuery = query(responsesRef, where("questionIndex", "==", questionIndex))

        return onSnapshot(simpleQuery, (snapshot) => {
          const responses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as QuizResponse[]

          // Sort client-side
          responses.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          callback(responses)
        })
      }
    },
  )
}

// Game state listener
export const subscribeToGameState = (quizId: string, callback: (gameState: GameState | null) => void) => {
  const gameStateRef = doc(db, "quizzes", quizId, "gameState", "current")

  return onSnapshot(
    gameStateRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        const gameState: GameState = {
          quizId,
          currentQuestionIndex: data.currentQuestionIndex || 0,
          isActive: data.isActive || false,
          startedAt: data.startedAt?.toDate() || null,
          questionStartTime: data.questionStartTime?.toDate() || null,
          showResults: data.showResults || false,
        }
        callback(gameState)
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error("Error listening to game state:", error)
      callback(null)
    },
  )
}

// Update group scores (called after each question)
export const updateGroupScores = async (quizId: string, scores: { groupId: string; score: number }[]) => {
  try {
    const batch = writeBatch(db)

    scores.forEach(({ groupId, score }) => {
      const groupRef = doc(db, "quizzes", quizId, "groups", groupId)
      batch.update(groupRef, { score })
    })

    await batch.commit()
  } catch (error) {
    console.error("Error updating group scores:", error)
    throw error
  }
}
