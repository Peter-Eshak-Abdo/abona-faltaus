"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconStyleType, StyleDefinition } from "@/lib/orthodox-prompts";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconStyleCardProps {
  styleDef: StyleDefinition;
  isSelected: boolean;
  onSelect: (id: IconStyleType) => void;
}

export default function IconStyleCard({ styleDef, isSelected, onSelect }: IconStyleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(styleDef.id)}
      className={cn(
        "relative rounded-2xl p-1 md:p-1 cursor-pointer transition-all duration-300 border backdrop-blur-md flex flex-col justify-between overflow-hidden",
        isSelected
          ? "border-amber-400 bg-amber-950/40 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.25)] ring-2 ring-amber-400/50"
          : "border-stone-700/50 bg-stone-900/40 text-stone-300 hover:border-amber-500/40 hover:bg-stone-800/40"
      )}
    >
      {/* Dynamic Background Glow */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-20 pointer-events-none transition-opacity duration-500",
          styleDef.previewGradient,
          isSelected && "opacity-40"
        )}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[11px] font-bold px-0.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Sparkles size={11} />
            {styleDef.badge}
          </span>

          <div
            className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center transition-all",
              isSelected
                ? "bg-amber-400 text-stone-950 font-bold shadow-md scale-110"
                : "border border-stone-600 bg-stone-800/60"
            )}
          >
            {isSelected && <Check size={13} strokeWidth={3} />}
          </div>
        </div>

        <h3 className="font-bold text-base md:text-lg text-amber-100 mb-0.5">{styleDef.title}</h3>
        <p className="text-xs text-amber-200/70 font-medium mb-0.5">{styleDef.subtitle}</p>
        <p className="text-xs text-stone-300/80 leading-relaxed line-clamp-3">{styleDef.description}</p>
      </div>

      <div className="mt-0.5 pt-0.5 border-t border-white/5 relative z-10 flex items-center justify-between text-[11px] text-amber-300/60">
        <span>نمط أرثوذكسي معتمد</span>
        <span>{isSelected ? "محدد الآن" : "اختر النمط"}</span>
      </div>
    </motion.div>
  );
}
