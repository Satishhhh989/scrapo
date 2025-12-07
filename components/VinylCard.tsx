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
      {/* Vinyl Sleeve */}
      <div className="relative aspect-square bg-gradient-to-br from-old-paper to-aged-paper rounded-sm border-2 border-faded-gold shadow-vinyl overflow-hidden">
        {/* Film Grain Overlay */}
        <div className="absolute inset-0 bg-film-grain opacity-20 pointer-events-none" />

        {/* Content */}
        <div className="relative h-full p-4 flex flex-col justify-between">
          {/* Title */}
          <div>
            <h3 className="font-playfair text-lg font-bold text-ink-black line-clamp-2 mb-2">
              {poem.title}
            </h3>
            <p className="font-courier text-xs text-melancholy-blue line-clamp-3">
              {poem.content.substring(0, 100)}...
            </p>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs text-vintage-red italic">
              {formatVintageDate(poem.createdAt)}
            </span>
            {poem.isFavorite && (
              <Heart className="w-4 h-4 fill-cherry-red text-cherry-red" />
            )}
          </div>
        </div>

        {/* Hover Actions */}
        <motion.div
          className="absolute inset-0 bg-sepia-dark/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        >
          <motion.button
            className="p-3 bg-vintage-paper rounded-full hover:bg-rose-quartz transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(poem.id);
            }}
          >
            <Heart
              className={`w-5 h-5 stroke-[1.5px] ${
                poem.isFavorite
                  ? "fill-cherry-red text-cherry-red"
                  : "text-cherry-red"
              }`}
            />
          </motion.button>

          <motion.button
            className="p-3 bg-vintage-paper rounded-full hover:bg-rose-quartz transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onExport(poem);
            }}
          >
            <Download className="w-5 h-5 text-faded-gold stroke-[1.5px]" />
          </motion.button>

          <motion.button
            className="p-3 bg-vintage-paper rounded-full hover:bg-rose-quartz transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(poem.id);
            }}
          >
            <Trash2 className="w-5 h-5 text-vintage-red stroke-[1.5px]" />
          </motion.button>
        </motion.div>
      </div>

      {/* Mood Badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-cherry-red/80 backdrop-blur-sm rounded-sm">
        <span className="font-sans text-xs text-vintage-paper uppercase tracking-wide">
          {poem.mood}
        </span>
      </div>
    </motion.div>
  );
}