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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`relative max-w-[85%] md:max-w-[80%] p-4 rounded-sm shadow-vintage ${
          isBot
            ? "bg-vintage-paper border-l-2 border-l-faded-gold text-ink-black"
            : "bg-rose-quartz/20 border-r-2 border-r-vintage-red text-ink-black"
        }`}
      >
        {/* Decorative dot for bot messages */}
        {isBot && (
          <div className="absolute -left-2 top-4 w-4 h-4 rounded-full bg-faded-gold/20 blur-[2px]" />
        )}

        {/* Message Content */}
        <div className="font-courier text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {isBot && isStreaming ? (
            <TypewriterText text={message.content} />
          ) : (
            message.content
          )}
        </div>

        {/* Timestamp & Actions */}
        <div className="flex items-center justify-between mt-3 gap-4 min-h-[24px]">
          <span className="font-sans text-[10px] text-vintage-red/60 italic">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Action Buttons - ALWAYS VISIBLE NOW */}
          {isBot && !isStreaming && (
            <div className="flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
              {/* NEW SHARE BUTTON */}
              {onShare && (
                <button
                  onClick={() => onShare(message.content)}
                  className="p-1 text-faded-gold hover:text-sepia-dark hover:bg-faded-gold/10 rounded transition-all"
                  title="Share Lyric Card"
                >
                  <Share2 className="w-4 h-4 stroke-[1.5px]" />
                </button>
              )}
              
              {onSave && (
                <button
                  onClick={() => onSave(message.content)}
                  className="p-1 text-vintage-red hover:text-cherry-red hover:bg-rose-quartz/20 rounded transition-all"
                  title="Save to Collection"
                >
                  <Heart className="w-4 h-4 stroke-[1.5px]" />
                </button>
              )}
              {onExport && (
                <button
                  onClick={() => onExport(message.content)}
                  className="p-1 text-melancholy-blue hover:text-ink-black hover:bg-melancholy-blue/10 rounded transition-all"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4 stroke-[1.5px]" />
                </button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(message.content)}
                className="p-1 text-melancholy-blue hover:text-ink-black hover:bg-melancholy-blue/10 rounded transition-all"
                title="Copy"
              >
                <Copy className="w-4 h-4 stroke-[1.5px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}