"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Moon, Palette, BookOpen, Download, Loader2, Share2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Message, MoodType, ThemeType, MOODS, UserProfile, Poem } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { exportAsPDF } from "@/lib/exportUtils";
import ChatMessage from "@/components/ChatMessage";
import LoadingScreen from "@/components/LoadingScreen";
import ShareModal from "@/components/ShareModal";

export default function HomePage() {
  const router = useRouter();
  
  // Auth state
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  
  // Settings
  const [currentMood, setCurrentMood] = useState<MoodType>("melancholic");
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("default");
  
  // Share Modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUser(userData);
        setCurrentMood(userData.preferences?.mood || "melancholic");
        setCurrentTheme(userData.preferences?.theme || "default");
        
        // Add welcome message
        const welcomeMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: `My old man said "Stay away from JavaScript"\nBut I was listening to Python in my headphones\nSinging "Video Games" in binary code\n\nWelcome back, ${userData.penName} ✨`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  // Handle sending message
  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
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

      // Create streaming message
      const botMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString(),
      };

      setStreamingMessage(botMessage);
      
      // After streaming completes, add to messages
      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setStreamingMessage(null);
      }, data.content.length * 50 + 500);

    } catch (error) {
      console.error("Generation error:", error);
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "I'm sorry, I couldn't write that poem. The muse has left me temporarily...",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Toggle mood
  const toggleMood = () => {
    const moods: MoodType[] = ["melancholic", "romantic", "rebellious", "dreamy"];
    const currentIndex = moods.indexOf(currentMood);
    const nextMood = moods[(currentIndex + 1) % moods.length];
    setCurrentMood(nextMood);

    // Visual feedback
    const moodMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: `*Mood shifted to ${nextMood}...*`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, moodMsg]);
  };

  // Save poem to Firestore
  const handleSavePoem = async (content: string) => {
    if (!user) return;

    try {
      const poem: Omit<Poem, "id"> = {
        userId: user.uid,
        title: `Poem ${new Date().toLocaleDateString()}`,
        content,
        prompt: messages[messages.length - 2]?.content || "",
        mood: currentMood,
        theme: currentTheme,
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      await addDoc(collection(db, "poems"), poem);
      
      // Show success message
      const successMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "*Poem saved to your gallery* 📚",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, successMsg]);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Export poem as PDF
  const handleExportPoem = async (content: string) => {
    const poem: Poem = {
      id: generateId(),
      userId: user?.uid || "",
      title: `Poem ${new Date().toLocaleDateString()}`,
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

  // Handle share click
  const handleShareClick = (content: string) => {
    setShareContent(content);
    setShareModalOpen(true);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex items-center justify-center p-0 md:p-8">
      {/* Mobile: Full screen | Desktop: Polaroid container */}
      <motion.div
        className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:border-2 md:border-dusty-rose md:shadow-polaroid md:rounded-sm overflow-hidden bg-old-paper/95 backdrop-blur-sm flex flex-col"
        initial={{ opacity: 0, scale: 0.95, rotate: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: window.innerWidth >= 768 ? -1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          transformOrigin: "center",
        }}
      >
        {/* Film grain overlay */}
        <div className="absolute inset-0 bg-film-grain opacity-10 pointer-events-none" />

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <motion.header
            className="flex-shrink-0 px-4 md:px-6 py-4 bg-gradient-to-r from-vintage-paper/90 via-rose-quartz/70 to-vintage-paper/90 border-b-2 border-vintage-red backdrop-blur-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-sepia-dark tracking-wide">
                  SCRAPO
                </h1>
                <p className="font-sans text-xs md:text-sm text-vintage-red italic mt-0.5">
                  Your own poet • {user?.penName}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <motion.button
                  onClick={toggleMood}
                  className="p-2 md:p-2.5 bg-vintage-paper border-2 border-faded-gold rounded-full hover:bg-rose-quartz transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={`Mood: ${currentMood}`}
                >
                  <Moon className="w-4 h-4 md:w-5 md:h-5 text-melancholy-blue stroke-[1.5px]" />
                </motion.button>

                <motion.button
                  onClick={() => router.push("/history")}
                  className="p-2 md:p-2.5 bg-vintage-paper border-2 border-faded-gold rounded-full hover:bg-rose-quartz transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="View gallery"
                >
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-faded-gold stroke-[1.5px]" />
                </motion.button>
              </div>
            </div>
          </motion.header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 scrollbar-vintage min-h-0">
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

              {/* Streaming message */}
              {streamingMessage && (
                <ChatMessage
                  key="streaming"
                  message={streamingMessage}
                  isStreaming
                />
              )}

              {/* Typing indicator */}
              {isGenerating && !streamingMessage && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-vintage-paper border-2 border-dusty-rose rounded-full">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-vintage-red rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <span className="font-sans text-sm text-vintage-red italic">
                      writing poetry...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Share Modal */}
          <ShareModal 
            isOpen={shareModalOpen} 
            onClose={() => setShareModalOpen(false)} 
            content={shareContent}
            penName={user?.penName}
          />

          {/* Input Area */}
          <motion.div
            className="flex-shrink-0 p-3 md:p-4 bg-gradient-to-b from-vintage-paper to-old-paper border-t-2 border-dusty-rose backdrop-blur-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-2 md:gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your poetry prompt..."
                disabled={isGenerating}
                className="flex-1 px-4 py-3 bg-vintage-paper/80 border border-dusty-rose/50 rounded-lg font-courier text-base text-ink-black placeholder:text-melancholy-blue/40 focus:outline-none focus:ring-1 focus:ring-vintage-red focus:border-transparent transition-all shadow-inner resize-none min-h-[50px] max-h-[150px] disabled:opacity-50"
                rows={1}
              />

              <motion.button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="p-3 md:p-3.5 bg-gradient-to-r from-cherry-red to-vintage-red border-2 border-cherry-red rounded-sm text-vintage-paper hover:from-vintage-red hover:to-cherry-red transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin stroke-[1.5px]" />
                ) : (
                  <Send className="w-5 h-5 stroke-[1.5px]" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}