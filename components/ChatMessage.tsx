"use client";

import { motion } from "framer-motion";
import { Message } from "@/lib/types";
import { Copy, Download, Heart, Share2 } from "lucide-react";
import TypewriterText from "./Typewriter";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onSave?: (content: string) => void;
  onExport?: (content: string) => void;
  onShare?: (content: string) => void;
}

export default function ChatMessage({
  message,
  isStreaming = false,
  onSave,
  onExport,
  onShare,
}: ChatMessageProps) {
  const isBot = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`relative max-w-[85%] md:max-w-[80%] py-4 px-5 rounded-2xl ${isBot
          ? "bg-transparent text-[#F5F5F5]"
          : "bg-white/5 backdrop-blur-md border border-white/10 text-[#F5F5F5] shadow-lg ml-auto"
          }`}
      >
        {/* Decorative dot for bot messages to anchor them like an author's mark */}
        {isBot && (
          <div className="absolute -left-1 top-6 w-1 h-3 rounded-full bg-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        )}

        {/* Message Content */}
        <div className="font-playfair text-[17px] leading-[1.8] tracking-wide whitespace-pre-wrap">
          {isBot && isStreaming ? (
            <TypewriterText text={message.content} />
          ) : (
            message.content
          )}
        </div>

        {/* Timestamp & Actions */}
        <div className={`flex items-center justify-between mt-4 gap-4 min-h-[24px] ${isBot ? "border-t border-white/5 pt-3" : ""}`}>
          <span className="font-courier text-[9px] text-[#F5F5F5]/40 uppercase tracking-widest">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Action Buttons */}
          {isBot && !isStreaming && (
            <div className="flex gap-2">
              {onShare && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onShare(message.content)}
                  className="p-1.5 text-[#F5F5F5]/40 hover:text-[#F5F5F5] hover:bg-white/10 rounded-lg transition-colors"
                  title="Share Archive Card"
                >
                  <Share2 className="w-4 h-4 stroke-[1.5px]" />
                </motion.button>
              )}

              {onSave && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onSave(message.content)}
                  className="p-1.5 text-[#F5F5F5]/40 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                  title="Archive"
                >
                  <Heart className="w-4 h-4 stroke-[1.5px]" />
                </motion.button>
              )}
              {onExport && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onExport(message.content)}
                  className="p-1.5 text-[#F5F5F5]/40 hover:text-[#F5F5F5] hover:bg-white/10 rounded-lg transition-colors"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4 stroke-[1.5px]" />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => navigator.clipboard.writeText(message.content)}
                className="p-1.5 text-[#F5F5F5]/40 hover:text-[#F5F5F5] hover:bg-white/10 rounded-lg transition-colors"
                title="Copy"
              >
                <Copy className="w-4 h-4 stroke-[1.5px]" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}