"use client"

import { useState, useEffect } from "react"
import { nextQuestion, showQuestionResults, endQuiz, getQuestionResponses } from "@/lib/firebase-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Users, ArrowRight } from "lucide-react"
import type { Quiz, Group, GameState, QuizResponse, LeaderboardEntry } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"

interface QuizHostGameProps {
  quiz: Quiz
  groups: Group[]
  gameState: GameState
}

export function QuizHostGame({ quiz, groups, gameState }: QuizHostGameProps) {
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [timeLeft, setTimeLeft] = useState(5)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showingResults, setShowingResults] = useState(false)

  const currentQuestion = quiz.questions[gameState.currentQuestionIndex]
  const isLastQuestion = gameState.currentQuestionIndex >= quiz.questions.length - 1

  useEffect(() => {
    if (!gameState.questionStartTime || gameState.showResults) return

    const startTime = gameState.questionStartTime.getTime()
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, 5 - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        handleTimeUp()
      }
    }, 100)

    return () => clearInterval(timer)
  }, [gameState.questionStartTime, gameState.showResults])

  useEffect(() => {
    if (!gameState.isActive) return

    const unsubscribe = getQuestionResponses(gameState.quizId, gameState.currentQuestionIndex, setResponses)

    return unsubscribe
  }, [gameState.quizId, gameState.currentQuestionIndex, gameState.isActive])

  useEffect(() => {
    if (gameState.showResults) {
      calculateLeaderboard()
      setShowingResults(true)
    } else {
      setShowingResults(false)
    }
  }, [gameState.showResults, responses])

  const handleTimeUp = async () => {
    if (gameState.showResults) return

    try {
      await showQuestionResults(gameState.quizId)
    } catch (error) {
      console.error("Error showing results:", error)
    }
  }

  const calculateLeaderboard = () => {
    const groupScores = new Map<string, number>()

    // Initialize scores
    groups.forEach((group) => {
      groupScores.set(group.id, group.score || 0)
    })

    // Calculate scores for current question
    const correctResponses = responses.filter((r) => r.isCorrect).sort((a, b) => a.responseTime - b.responseTime)

    correctResponses.forEach((response, index) => {
      const points = Math.max(100 - index * 10, 10) // 100, 90, 80, etc., minimum 10
      const currentScore = groupScores.get(response.groupId) || 0
      groupScores.set(response.groupId, currentScore + points)
    })

    // Create leaderboard
    const leaderboardEntries: LeaderboardEntry[] = groups
      .map((group) => ({
        groupId: group.id,
        groupName: group.groupName,
        members: group.members,
        score: groupScores.get(group.id) || 0,
      }))
      .sort((a, b) => b.score - a.score)

    setLeaderboard(leaderboardEntries)
  }

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      await endQuiz(gameState.quizId)
      return
    }

    try {
      await nextQuestion(gameState.quizId, gameState.currentQuestionIndex + 1)
      setResponses([])
      setTimeLeft(5)
    } catch (error) {
      console.error("Error moving to next question:", error)
    }
  }

  const getChoiceColor = (index: number) => {
    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"]
    return colors[index] || "bg-gray-500"
  }

  const getResponseStats = () => {
    const stats = currentQuestion.choices.map((_, index) => ({
      choice: index,
      count: responses.filter((r) => r.answer === index).length,
    }))
    return stats
  }

  if (!gameState.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl text-center">
          <CardContent className="pt-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <div className="space-y-4">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <motion.div
                  key={entry.groupId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`p-4 rounded-lg ${
                    index === 0
                      ? "bg-yellow-100 border-2 border-yellow-400"
                      : index === 1
                        ? "bg-gray-100 border-2 border-gray-400"
                        : "bg-orange-100 border-2 border-orange-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        #{index + 1} {entry.groupName}
                      </h3>
                      <p className="text-sm text-gray-600">{entry.members.join(", ")}</p>
                    </div>
                    <div className="text-2xl font-bold">{entry.score} pts</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Question {gameState.currentQuestionIndex + 1} of {quiz.questions.length}
            </h1>
            <p className="text-gray-600">{quiz.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              {groups.length} groups
            </Badge>
            {!gameState.showResults && (
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                {Math.ceil(timeLeft)}s
              </Badge>
            )}
          </div>
        </div>

        {/* Progress */}
        <Progress value={(gameState.currentQuestionIndex / quiz.questions.length) * 100} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Display */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.choices.map((choice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      gameState.showResults && index === currentQuestion.correctAnswer
                        ? "ring-2 ring-green-500 bg-green-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${getChoiceColor(index)}`} />
                    <span className="font-medium">{choice}</span>
                    {gameState.showResults && index === currentQuestion.correctAnswer && (
                      <Badge className="ml-auto bg-green-500">Correct</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Stats or Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>{showingResults ? "Current Leaderboard" : "Live Responses"}</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {showingResults ? (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.groupId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          index === 0
                            ? "bg-yellow-100"
                            : index === 1
                              ? "bg-gray-100"
                              : index === 2
                                ? "bg-orange-100"
                                : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{entry.groupName}</div>
                            <div className="text-sm text-gray-600">{entry.members.join(", ")}</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold">{entry.score} pts</div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="responses"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-3"
                  >
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold">
                        {responses.length} / {groups.length}
                      </div>
                      <div className="text-sm text-gray-600">responses received</div>
                    </div>

                    {getResponseStats().map((stat, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getChoiceColor(index)}`} />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span>{currentQuestion.choices[index]}</span>
                            <span>{stat.count}</span>
                          </div>
                          <Progress
                            value={responses.length > 0 ? (stat.count / responses.length) * 100 : 0}
                            className="h-2 mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        {gameState.showResults && (
          <div className="mt-6 text-center">
            <Button onClick={handleNextQuestion} size="lg" className="px-8">
              {isLastQuestion ? (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  End Quiz
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Next Question
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
