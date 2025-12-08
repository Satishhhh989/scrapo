"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Check, Music2, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  penName?: string;
}

export default function ShareModal({ isOpen, onClose, content, penName = "The Poet" }: ShareModalProps) {
  const [step, setStep] = useState<"select" | "preview">("select");
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Split content into lines, removing empty ones
  const lines = content.split("\n").filter((line) => line.trim() !== "");

  // "Spotify" Themes - Premium gradient designs
  const themes = [
    { 
      name: "Melancholy", 
      bg: "bg-gradient-to-br from-[#2c3e50] via-[#3a3226] to-[#000000]", 
      text: "text-white",
      accent: "border-white/30"
    },
    { 
      name: "Lana's Rose", 
      bg: "bg-gradient-to-br from-[#d4a5a5] via-[#f7cac9] to-[#c2847a]", 
      text: "text-[#3a3226]",
      accent: "border-[#3a3226]/20"
    },
    { 
      name: "Midnight", 
      bg: "bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]", 
      text: "text-white",
      accent: "border-white/30"
    },
    { 
      name: "Golden Hour", 
      bg: "bg-gradient-to-tr from-[#c5a059] via-[#e8dfc8] to-[#d4af37]", 
      text: "text-[#2a2a2a]",
      accent: "border-[#2a2a2a]/20"
    },
  ];

  const toggleLine = (index: number) => {
    if (selectedLines.includes(index)) {
      setSelectedLines(prev => prev.filter(i => i !== index));
    } else {
      if (selectedLines.length >= 4) return; // Limit to 4 lines for aesthetic
      setSelectedLines(prev => [...prev, index].sort((a, b) => a - b));
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      // Generate Image with high quality settings
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Ultra high resolution for crisp images
        backgroundColor: null,
        useCORS: true,
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });

      // Convert to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        // Try Native Share (Mobile)
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], "scrapo-poem.png", { type: "image/png" });
          try {
            await navigator.share({
              files: [file],
              title: "Scrapo Poem",
              text: "Written with Scrapo.ai",
            });
            return;
          } catch (e) {
            console.log("Share failed, falling back to download");
          }
        }

        // Fallback: Download (Desktop)
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scrapo-story-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png", 1.0);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-vintage-paper w-full max-w-md rounded-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border-2 border-dusty-rose/50"
        >
          {/* Header */}
          <div className="p-4 border-b border-dusty-rose/30 flex justify-between items-center bg-gradient-to-r from-vintage-paper to-rose-quartz/20">
            <h3 className="font-cinzel text-lg text-ink-black font-bold tracking-wide">
              {step === "select" ? "Select Verses" : "Customize Card"}
            </h3>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ink-black" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-vintage">
            {step === "select" ? (
              <div className="space-y-3">
                <p className="text-xs text-center text-melancholy-blue mb-4 font-sans uppercase tracking-widest">
                  Pick up to 4 lines
                </p>
                {lines.map((line, idx) => (
                  <motion.div
                    key={idx}
                    onClick={() => toggleLine(idx)}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-md cursor-pointer border-2 transition-all relative overflow-hidden ${
                      selectedLines.includes(idx)
                        ? "bg-rose-quartz/40 border-vintage-red shadow-md"
                        : "bg-white/60 border-transparent hover:bg-white hover:border-dusty-rose/30"
                    }`}
                  >
                    {selectedLines.includes(idx) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-vintage-red rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                    <p className={`font-courier text-sm leading-relaxed pr-8 ${
                      selectedLines.includes(idx) 
                        ? "text-ink-black font-semibold" 
                        : "text-ink-black/70"
                    }`}>
                      {line}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                {/* THE CARD PREVIEW - Premium Design */}
                <div 
                  ref={cardRef}
                  className={`w-[280px] aspect-[9/16] ${themes[selectedTheme].bg} relative shadow-2xl rounded-sm overflow-hidden flex flex-col p-6 border-2 ${themes[selectedTheme].accent}`}
                  style={{
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 0 100px rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {/* Grain Overlay */}
                  <div className="absolute inset-0 bg-film-grain opacity-20 pointer-events-none mix-blend-overlay" />
                  
                  {/* Subtle gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
                  
                  {/* Content Container */}
                  <div className="flex-1 flex flex-col justify-center items-center text-center z-10 space-y-6">
                    {selectedLines.map((i, idx) => (
                      <motion.p 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`font-cinzel text-xl md:text-2xl leading-relaxed ${themes[selectedTheme].text} drop-shadow-lg font-medium tracking-wide`}
                        style={{
                          textShadow: themes[selectedTheme].text === "text-white" 
                            ? "0 2px 8px rgba(0, 0, 0, 0.3)" 
                            : "0 2px 8px rgba(255, 255, 255, 0.3)"
                        }}
                      >
                        {lines[i]}
                      </motion.p>
                    ))}
                  </div>

                  {/* Spotify-style Footer - Enhanced */}
                  <div className="z-10 mt-auto pt-6">
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden backdrop-blur-sm">
                      <motion.div 
                        className="h-full bg-white/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "66%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    
                    {/* Footer content */}
                    <div className="flex justify-between items-end">
                      <div className="flex-1">
                        <p className={`font-sans text-[10px] font-bold uppercase tracking-wider opacity-90 ${themes[selectedTheme].text} mb-0.5`}>
                          {penName}
                        </p>
                        <p className={`font-playfair text-xs italic opacity-70 ${themes[selectedTheme].text}`}>
                          Scrapo Original • {new Date().getFullYear()}
                        </p>
                      </div>
                      <motion.div 
                        className={`p-2.5 rounded-full border-2 ${themes[selectedTheme].accent} bg-white/10 backdrop-blur-sm`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Music2 className={`w-4 h-4 ${themes[selectedTheme].text}`} />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Theme Selector - Enhanced */}
                <div className="flex gap-3 overflow-x-auto w-full pb-2 justify-center">
                  {themes.map((t, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setSelectedTheme(i)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-12 h-12 rounded-full ${t.bg} border-2 ${
                        selectedTheme === i 
                          ? "border-ink-black scale-110 shadow-lg ring-2 ring-rose-quartz/50" 
                          : "border-transparent opacity-60 hover:opacity-100"
                      } shadow-md transition-all relative overflow-hidden`}
                      title={t.name}
                    >
                      {selectedTheme === i && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-white/20 rounded-full"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-dusty-rose/30 bg-white/50 backdrop-blur-sm">
            {step === "select" ? (
              <motion.button
                onClick={() => setStep("preview")}
                disabled={selectedLines.length === 0}
                whileHover={{ scale: selectedLines.length > 0 ? 1.02 : 1 }}
                whileTap={{ scale: selectedLines.length > 0 ? 0.98 : 1 }}
                className="w-full py-3 bg-ink-black text-white font-cinzel rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sepia-dark transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                Next <ImageIcon className="w-4 h-4" />
              </motion.button>
            ) : (
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep("select")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 border-2 border-ink-black text-ink-black font-sans text-sm rounded-sm hover:bg-black/5 transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-[2] py-3 bg-gradient-to-r from-vintage-red to-cherry-red text-white font-sans text-sm font-bold rounded-sm hover:from-cherry-red hover:to-vintage-red shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  Share to Story <Share2 className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

