"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Moon, BookOpen, Loader2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Message, MoodType, ThemeType, UserProfile, Poem } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { exportAsPDF } from "@/lib/exportUtils";
import ChatMessage from "@/components/ChatMessage";
import LoadingScreen from "@/components/LoadingScreen";
import ShareModal from "@/components/ShareModal";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);

  const [currentMood, setCurrentMood] = useState<MoodType>("melancholic");
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("default");

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUser(userData);
        setCurrentMood(userData.preferences?.mood || "melancholic");
        setCurrentTheme(userData.preferences?.theme || "default");

        const welcomeMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: `Welcome back by the typewriter, ${userData.penName}.\nThe paper is blank. The night is young. What shall we write?`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Scroll a bit above the absolute bottom to leave breathing room for the bottom dock overlap
    if (messagesEndRef.current) {
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages, streamingMessage]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input.trim(),
          mood: currentMood,
          penName: user?.penName,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate response");
      }

      const botMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString(),
      };

      setStreamingMessage(botMessage);

      setTimeout(() => {
        setMessages((prev: Message[]) => [...prev, botMessage]);
        setStreamingMessage(null);
      }, data.content.length * 50 + 500);

    } catch (error) {
      console.error("Generation error:", error);
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "The ink has stalled. Let us pause and try once more...",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev: Message[]) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const toggleMood = () => {
    const moods: MoodType[] = ["melancholic", "romantic", "rebellious", "dreamy"];
    const currentIndex = moods.indexOf(currentMood);
    const nextMood = moods[(currentIndex + 1) % moods.length];
    setCurrentMood(nextMood);

    const moodMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: `*Atmosphere shifts to ${nextMood}...*`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev: Message[]) => [...prev, moodMsg]);
  };

  const handleSavePoem = async (content: string) => {
    if (!user) return;

    try {
      const poem: Omit<Poem, "id"> = {
        userId: user.uid,
        title: `Entry no. ${Math.floor(Math.random() * 1000)}`,
        content,
        prompt: messages[messages.length - 2]?.content || "",
        mood: currentMood,
        theme: currentTheme,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      await addDoc(collection(db, "poems"), poem);

      const successMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "*Archived to your private gallery.*",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev: Message[]) => [...prev, successMsg]);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleExportPoem = async (content: string) => {
    const poem: Poem = {
      id: generateId(),
      userId: user?.uid || "",
      title: `Archive - ${new Date().toLocaleDateString()}`,
      content,
      prompt: messages[messages.length - 2]?.content || "",
      mood: currentMood,
      theme: currentTheme,
      createdAt: new Date().toISOString(),
    };

    try {
      await exportAsPDF(poem);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleShareClick = (content: string) => {
    setShareContent(content);
    setShareModalOpen(true);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center bg-[#F5F5DC] overflow-hidden relative">
      <div className="w-full max-w-2xl h-full flex flex-col relative z-10">

        {/* Minimal Header */}
        <motion.header
          className="flex-shrink-0 px-6 pt-12 pb-4 flex justify-between items-center z-20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
        >
          <div className="flex flex-col">
            <h1 className="font-playfair text-xl text-[#1A1A1A] font-medium tracking-wide">
              Scrapo
            </h1>
            <p className="font-courier text-[10px] text-[#9C6A6A] tracking-[0.2em] uppercase mt-1">
              {user?.penName || "Unknown"}
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={toggleMood}
              className="group p-2 flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#9C6A6A] transition-colors"
              whileTap={{ scale: 0.92 }}
              title={`Mood: ${currentMood}`}
            >
              <Moon className="w-5 h-5 stroke-[1.5px] group-hover:fill-[#9C6A6A]/10" />
            </motion.button>

            <motion.button
              onClick={() => router.push("/history")}
              className="p-2 flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#9C6A6A] transition-colors"
              whileTap={{ scale: 0.92 }}
              title="Archive"
            >
              <BookOpen className="w-5 h-5 stroke-[1.5px]" />
            </motion.button>
          </div>
        </motion.header>

        {/* scrollable messages area */}
        <div id="chat-container" className="flex-1 overflow-y-auto px-6 pt-4 pb-40 scrollbar-hide space-y-10">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onSave={msg.role === "assistant" ? handleSavePoem : undefined}
                onExport={msg.role === "assistant" ? handleExportPoem : undefined}
                onShare={msg.role === "assistant" ? handleShareClick : undefined}
              />
            ))}

            {streamingMessage && (
              <ChatMessage
                key="streaming"
                message={streamingMessage}
                isStreaming
              />
            )}

            {isGenerating && !streamingMessage && (
              <motion.div
                className="flex justify-start opacity-60 ml-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A]/5 rounded-2xl">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-[#9C6A6A] rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Floating Dock Input area mapping the thumb zone perfectly */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 w-full z-40 pb-safe pointer-events-none"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
        >
          {/* Subtle gradient to wash out the text behind the dock */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5DC] via-[#F5F5DC]/90 to-transparent -z-10 h-32 -top-8 pointer-events-none" />

          <div className="px-5 pb-6 pt-2 pointer-events-auto">
            <div className="flex items-end gap-3 bg-white/40 backdrop-blur-xl border border-[#1A1A1A]/10 p-2 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)]">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Whisper a prompt..."
                disabled={isGenerating}
                className="flex-1 px-4 py-3 bg-transparent font-courier text-[15px] leading-relaxed text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none resize-none min-h-[48px] max-h-[120px] disabled:opacity-50 !scrollbar-hide"
                rows={1}
              />

              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="mb-1 mr-1 relative p-3.5 bg-[#1A1A1A] text-[#F5F5DC] rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin stroke-[2px]" />
                ) : (
                  <Send className="w-5 h-5 stroke-[2px] translate-x-[1px] translate-y-[1px]" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          content={shareContent}
          penName={user?.penName}
        />
      </div>
    </div>
  );
}