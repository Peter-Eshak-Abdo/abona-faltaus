"use client";

import React from "react";
import { ORTHODOX_SUB_BOTS, SubBotPersona } from "@/lib/orthodox-subbots";
import {
  BookOpen,
  Flame,
  Shield,
  Swords,
  History,
  Sparkles,
  Music,
  GraduationCap,
  Cross,
  ChevronDown,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  Cross: <Cross size={18} />,
  BookOpen: <BookOpen size={18} />,
  Flame: <Flame size={18} />,
  Shield: <Shield size={18} />,
  Swords: <Swords size={18} />,
  History: <History size={18} />,
  Sparkles: <Sparkles size={18} />,
  Music: <Music size={18} />,
  GraduationCap: <GraduationCap size={18} />
};

interface PersonaSelectorProps {
  selectedBotId: string;
  onSelectBot: (bot: SubBotPersona) => void;
  compact?: boolean;
}

export default function PersonaSelector({
  selectedBotId,
  onSelectBot,
  compact = false
}: PersonaSelectorProps) {
  const currentBot = ORTHODOX_SUB_BOTS.find((b) => b.id === selectedBotId) || ORTHODOX_SUB_BOTS[0];

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-0.5 px-0.5 py-0.5 rounded-full border transition-all cursor-pointer select-none text-right",
            "bg-white/90 dark:bg-zinc-900/90 hover:bg-amber-50 dark:hover:bg-zinc-800 border-amber-300/40 shadow-xs group"
          )}
          title="اختر تخصص أو شخصية المساعد الذكي"
        >
          <span className="p-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
            {ICON_MAP[currentBot.iconName] || <Sparkles size={16} />}
          </span>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-0.5">
              <span className="text-xs md:text-sm font-bold text-stone-900 dark:text-stone-100">
                {currentBot.name}
              </span>
              <ChevronDown size={14} className="text-stone-400 group-hover:text-amber-700 transition-transform duration-200" />
            </div>
            {!compact && (
              <span className="text-[10px] text-stone-500 line-clamp-1 max-w-[140px] md:max-w-[200px]">
                {currentBot.title}
              </span>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-18 md:w-20 max-h-[75vh] overflow-y-auto p-0.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border-amber-200/50 shadow-xl"
      >
        <div className="px-0.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 border-b border-amber-100 dark:border-zinc-800 mb-1 flex items-center justify-between">
          <span>شخصيات وتخصصات الذكاء الاصطناعي الأرثوذكسي</span>
          <span className="text-[10px] text-stone-400">8 تخصصات + العام</span>
        </div>

        {ORTHODOX_SUB_BOTS.map((bot) => {
          const isSelected = bot.id === selectedBotId;
          return (
            <DropdownMenuItem
              key={bot.id}
              onClick={() => onSelectBot(bot)}
              className={cn(
                "flex items-start gap-0.5 p-0.5 rounded-xl cursor-pointer transition-colors text-right mb-1",
                isSelected
                  ? "bg-amber-50 dark:bg-amber-950/60 border border-amber-300/40"
                  : "hover:bg-stone-100 dark:hover:bg-zinc-800"
              )}
            >
              <div
                className={cn(
                  "p-0.5 rounded-xl shrink-0 mt-0.5",
                  bot.badgeBg
                )}
              >
                {ICON_MAP[bot.iconName] || <Sparkles size={16} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs md:text-sm font-bold text-stone-900 dark:text-stone-100">
                    {bot.name}
                  </h4>
                  {isSelected && <Check size={15} className="text-amber-700 dark:text-amber-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400 font-medium">
                  {bot.title}
                </p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2 leading-tight">
                  {bot.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
