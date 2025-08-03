"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getQuiz, joinQuizAsGroup, subscribeToGameState } from "@/lib/firebase-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Minus } from "lucide-react"
import { Play } from "lucide-react" // Import Play component
import type { Quiz, GameState } from "@/types/quiz"
import { motion } from "framer-motion"

export default function JoinQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [groupName, setGroupName] = useState("")
  const [memberCount, setMemberCount] = useState(2)
  const [memberNames, setMemberNames] = useState<string[]>(["", ""])
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const quizId = params.quizId as string

  useEffect(() => {
    if (quizId) {
      loadQuiz()

      // Subscribe to game state
      const unsubscribe = subscribeToGameState(quizId, (state) => {
        setGameState(state)
        if (state?.isActive && hasJoined) {
          router.push(`/exam/quiz/quiz/${quizId}/play`)
        }
      })

      return unsubscribe
    }
  }, [quizId, hasJoined])

  useEffect(() => {
    // Update member names array when count changes
    const newNames = [...memberNames]
    if (memberCount > memberNames.length) {
      // Add empty strings for new members
      for (let i = memberNames.length; i < memberCount; i++) {
        newNames.push("")
      }
    } else if (memberCount < memberNames.length) {
      // Remove excess names
      newNames.splice(memberCount)
    }
    setMemberNames(newNames)
  }, [memberCount])

  const loadQuiz = async () => {
    try {
      const quizData = await getQuiz(quizId)
      if (!quizData) {
        setError("Quiz not found")
        return
      }
      setQuiz(quizData)
    } catch (error) {
      console.error("Error loading quiz:", error)
      setError("Failed to load quiz")
    }
  }

  const updateMemberName = (index: number, name: string) => {
    const newNames = [...memberNames]
    newNames[index] = name
    setMemberNames(newNames)
  }

  const handleJoin = async () => {
    if (!groupName.trim()) {
      setError("Please enter a group name")
      return
    }

    const validNames = memberNames.filter((name) => name.trim())
    if (validNames.length !== memberCount) {
      setError("Please fill in all member names")
      return
    }

    // Check for duplicate names within the group
    const uniqueNames = new Set(validNames.map((name) => name.trim().toLowerCase()))
    if (uniqueNames.size !== validNames.length) {
      setError("All member names must be unique within your group")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      const groupId = await joinQuizAsGroup(quizId, {
        groupName: groupName.trim(),
        members: validNames.map((name) => name.trim()),
      })

      // Store group info in localStorage for the play page
      localStorage.setItem(
        "currentGroup",
        JSON.stringify({
          id: groupId,
          groupName: groupName.trim(),
          members: validNames.map((name) => name.trim()),
        }),
      )

      setHasJoined(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Failed to join quiz")
      } else {
        setError("Failed to join quiz")
      }
    } finally {
      setIsJoining(false)
    }
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (gameState?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Quiz Already Started</h2>
            <p className="text-gray-600 mb-4">This quiz has already begun. You cannot join at this time.</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Successfully Joined!</h2>
              <p className="text-gray-600 mb-4">
                Group &quot;{groupName}&quot; has joined the quiz. Waiting for the host to start...
              </p>
              <div className="animate-pulse">
                <div className="h-2 bg-blue-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Join as Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter your group name..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Number of Members</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                  variant="outline"
                  size="sm"
                  disabled={memberCount <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center">{memberCount}</span>
                <Button
                  onClick={() => setMemberCount(Math.min(10, memberCount + 1))}
                  variant="outline"
                  size="sm"
                  disabled={memberCount >= 10}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Member Names</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {memberNames.map((name, index) => (
                  <Input
                    key={index}
                    value={name}
                    onChange={(e) => updateMemberName(index, e.target.value)}
                    placeholder={`Member ${index + 1} name`}
                  />
                ))}
              </div>
            </div>

            <Button onClick={handleJoin} disabled={isJoining} className="w-full" size="lg">
              {isJoining ? "Joining..." : "Join Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
