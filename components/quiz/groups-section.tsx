import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Group } from "@/types/quiz"

interface GroupsSectionProps {
  groups: Group[]
  isCleaningUp: boolean
  handleCleanupOldGroups: () => void
  handleDeleteGroup: (groupId: string, groupName: string) => void
  deletingGroupId: string | null
}

export function GroupsSection({
  groups,
  isCleaningUp,
  handleCleanupOldGroups,
  handleDeleteGroup,
  deletingGroupId,
}: GroupsSectionProps) {
  const getGroupActivityStatus = (group: Group) => {
    const now = new Date()
    const lastActivity = group.lastActivity || group.joinedAt
    const minutesAgo = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60))

    if (minutesAgo > 60) {
      return { status: "inactive", text: `منذ ${minutesAgo} دقيقة`, color: "text-red-600" }
    } else if (minutesAgo > 15) {
      return { status: "idle", text: `منذ ${minutesAgo} دقيقة`, color: "text-yellow-600" }
    } else {
      return { status: "active", text: "نشط", color: "text-green-600" }
    }
  }

  return (
    <Card className="shadow-2xl overflow-hidden p-0">
      <CardHeader className="bg-linear-to-r from-green-500 to-emerald-600 text-white p-0.5 rounded-4xl shadow-2xl">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-2xl font-bold">
            <svg className="w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            الفرق ({groups.length})
          </CardTitle>
          <Button
            onClick={handleCleanupOldGroups}
            disabled={isCleaningUp}
            size="normal"
            className="bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-xl transition-colors flex items-center bg-warning text-black"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
              <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
            </svg>
            تنظيف
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-1">
        {groups.length === 0 ? (
          <div className="text-center p-1 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <p className="text-xl mb-1 font-medium">لم ينضم أي فريق بعد</p>
            <p className="text-lg">شارك الكود للبدء</p>
          </div>
        ) : (
          <div className="grid grid-col-2 md:grid-cols-4 lg:grid-col-4 gap-1 max-h-96 overflow-y-auto">
            {groups.map((group, index) => {
              const activity = getGroupActivityStatus(group)
              const isDeleting = deletingGroupId === group.id

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-0.5 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-0.5 mb-1">
                        <div className="w-3 h-3 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-2xl text-gray-900">
                            {group.groupName}
                          </h3>
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 p-1 rounded-full text-xl font-medium">
                              {group.members.length} عضو
                            </div>
                            <div className={`p-1 rounded-full text-sm font-medium ${activity.status === 'active' ? 'bg-green-100 text-green-800' :
                              activity.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                              {activity.text}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-1 border border-gray-200">
                        <p className="text-gray-700 font-medium">{group.members.join(" || ")}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleDeleteGroup(group.id, group.groupName)}
                      disabled={isDeleting}
                      className="mx-1 h-1 w-1 p-1 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded transition-all duration-200 shadow-sm hover:shadow bg-danger"
                      type="button"
                      size="normal"
                    >
                      {isDeleting ? (
                        <div className="animate-spin rounded-full h-1 w-1 border-b-2 border-red-600" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                        </svg>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
