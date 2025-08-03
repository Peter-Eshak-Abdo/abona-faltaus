/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { getQuiz, getQuizGroups, startQuiz, subscribeToGameState } from "@/lib/firebase-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Play, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { Quiz, Group, GameState } from "@/types/quiz"
import { motion } from "framer-motion"
import { QuizHostGame } from "@/components/quiz/quiz-host-game"

export default function HostQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [user, loading] = useAuthState(auth)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const quizId = params.quizId as string

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && quizId) {
      loadQuiz()
    }
  }, [user, loading, quizId])

  useEffect(() => {
    if (!quizId) return

    // Subscribe to groups
    const unsubscribeGroups = getQuizGroups(quizId, setGroups)

    // Subscribe to game state
    const unsubscribeGameState = subscribeToGameState(quizId, setGameState)

    return () => {
      unsubscribeGroups()
      unsubscribeGameState()
    }
  }, [quizId])

  const loadQuiz = async () => {
    try {
      const quizData = await getQuiz(quizId)
      if (!quizData) {
        router.push("/exam/quiz/dashboard")
        return
      }

      if (quizData.createdBy !== user?.uid) {
        router.push("/exam/quiz/dashboard")
        return
      }

      setQuiz(quizData)
    } catch (error) {
      console.error("Error loading quiz:", error)
      router.push("/exam/quiz/dashboard")
    }
  }

  const handleStartQuiz = async () => {
    if (groups.length === 0) return

    setIsStarting(true)
    try {
      await startQuiz(quizId)
    } catch (error) {
      console.error("Error starting quiz:", error)
    } finally {
      setIsStarting(false)
    }
  }

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If game is active, show the game interface
  if (gameState?.isActive) {
    return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />
  }

  const joinUrl = `${window.location.origin}/exam/quiz/quiz/${quizId}/join`

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code and Join Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Join Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <QRCodeSVG value={joinUrl} size={200} />
              </div>
              <p className="text-sm text-gray-600 mb-2">Scan QR code or visit:</p>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{joinUrl}</p>
            </CardContent>
          </Card>

          {/* Groups List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Joined Groups ({groups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No groups have joined yet</p>
                  <p className="text-sm">Share the QR code to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group, index) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{group.groupName}</h4>
                        <p className="text-sm text-gray-600">{group.members.join(", ")}</p>
                      </div>
                      <Badge variant="secondary">{group.members.length} members</Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quiz Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{groups.length}</div>
                <div className="text-sm text-gray-600">Groups Joined</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {groups.reduce((total, group) => total + group.members.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Players</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Quiz Button */}
        <div className="mt-8 text-center">
          <Button onClick={handleStartQuiz} disabled={groups.length === 0 || isStarting} size="lg" className="px-8">
            <Play className="w-5 h-5 mr-2" />
            {isStarting ? "Starting..." : "Start Quiz"}
          </Button>
          {groups.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">At least one group must join before starting</p>
          )}
        </div>
      </div>
    </div>
  )
}
