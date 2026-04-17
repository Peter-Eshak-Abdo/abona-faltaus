"use client"
import { motion, AnimatePresence } from "framer-motion"
import type { Group } from "@/types/quiz"

interface GroupsSectionProps {
  groups: Group[]
  handleDeleteGroup: (groupId: string, groupName: string) => void
}

export function GroupsSection({ groups, handleDeleteGroup }: GroupsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-1">
      <AnimatePresence>
        {groups.map((group) => (
          <motion.div
            layout
            key={group.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, filter: "blur(5px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative group bg-slate-800/80 border border-white/10 rounded-xl p-0.5 flex flex-col items-center gap-1 shadow-lg hover:bg-slate-700 transition-colors"
          >
            {/* زر الحذف الفردي */}
            <button
              onClick={() => handleDeleteGroup(group.id, group.group_name)}
              className="w-3 h-3 absolute top-1 left-1 p-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
              title="حذف الفريق"
            >
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 5 30">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* صورة الفريق */}
            <div className="w-7 h-10 rounded-full overflow-hidden border-2 border-slate-600">
              {group.saint_image ? (
                <img src={group.saint_image} alt={group.group_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xs">👤</div>
              )}
            </div>

            {/* بيانات الفريق */}
            <div className="text-center w-full">
              <h3 className="text-2xl font-bold text-white truncate">{group.group_name}</h3>
              <p className="text-xm text-green-400 font-medium m-0.5">{group.members?.length || 0} أعضاء</p>

              {/* قائمة الأعضاء */}
              <div className="flex flex-wrap gap-0.5 justify-center bg-black/20 rounded-lg p-0.5 overflow-y-auto custom-scrollbar">
                {group.members?.map((name: string, index: number) => (
                  <span key={index} className="bg-white/10 p-0.5 rounded text-xm text-slate-300">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
