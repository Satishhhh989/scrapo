"use client";

import { motion } from "framer-motion";
import { Heart, Download, Trash2 } from "lucide-react";
import { Poem } from "@/lib/types";
import { formatVintageDate } from "@/lib/utils";

interface VinylCardProps {
  poem: Poem;
  onSelect: (poem: Poem) => void;
  onToggleFavorite: (poemId: string) => void;
  onDelete: (poemId: string) => void;
  onExport: (poem: Poem) => void;
}

/**
 * VinylCard - Displays poems as vintage vinyl record sleeves
 * Hover reveals actions (slide-out effect)
 */
export default function VinylCard({
  poem,
  onSelect,
  onToggleFavorite,
  onDelete,
  onExport,
}: VinylCardProps) {
  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(poem)}
    >
      {/* Glass Slate */}
      <div className="relative aspect-square bg-[#111216] rounded-xl border border-white/10 shadow-lg overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative h-full p-6 flex flex-col justify-between z-10">
          {/* Title */}
          <div>
            <h3 className="font-playfair text-xl md:text-2xl font-semibold text-white/90 line-clamp-2 mb-3 tracking-wide">
              {poem.title}
            </h3>
            <p className="font-playfair text-sm text-white/50 line-clamp-3 leading-relaxed italic">
              {poem.content.substring(0, 100)}...
            </p>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between mt-4">
            <span className="font-courier text-[10px] text-white/30 tracking-widest uppercase">
              {formatVintageDate(poem.createdAt)}
            </span>
            {poem.isFavorite && (
              <Heart className="w-4 h-4 fill-amber-500/80 text-amber-500/80 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            )}
          </div>
        </div>

        {/* Hover Actions */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
          initial={false}
        >
          <motion.button
            className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(poem.id);
            }}
          >
            <Heart
              className={`w-5 h-5 stroke-[1.5px] ${poem.isFavorite
                  ? "fill-amber-500/80 text-amber-500/80 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  : "text-white/70"
                }`}
            />
          </motion.button>

          <motion.button
            className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onExport(poem);
            }}
          >
            <Download className="w-5 h-5 text-white/70 stroke-[1.5px]" />
          </motion.button>

          <motion.button
            className="p-3 bg-white/5 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors shadow-lg group/delete"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(poem.id);
            }}
          >
            <Trash2 className="w-5 h-5 text-red-400/70 stroke-[1.5px] group-hover/delete:text-red-400 group-hover/delete:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
          </motion.button>
        </motion.div>
      </div>

      {/* Mood Badge */}
      <div className="absolute top-3 right-3 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full z-30 shadow-sm pointer-events-none">
        <span className="font-courier text-[9px] text-white/80 uppercase tracking-widest font-bold drop-shadow-md">
          {poem.mood}
        </span>
      </div>
    </motion.div>
  );
}