"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Image as ImageIcon, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { ShareTheme } from "@/lib/types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  penName?: string;
}

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.017 18L16.41 12H11.91V4H21.91V12.5L18.017 18H14.017ZM5.01697 18L7.40997 12H2.90997V4H12.91V12.5L9.01697 18H5.01697Z" />
  </svg>
);


export default function ShareModal({ isOpen, onClose, content, penName = "The Poet" }: ShareModalProps) {
  const [step, setStep] = useState<"select" | "preview">("select");
  const [selectedLines, setSelectedLines] = useState<{ originalIndex: number; text: string }[]>([]);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const lines = content.split("\n").filter((line) => line.trim() !== "");

  const themes = [
    {
      name: "Crimson Velvet",
      bg: "bg-gradient-to-br from-[#4A0E17] via-[#2D060E] to-[#1A0307]",
      textPrimary: "text-[#FDECEA]",
      textSecondary: "text-[#FDECEA]/60",
      accent: "border-[#FDECEA]/15",
      emboss: "0 2px 4px rgba(0,0,0,0.5)",
      barBg: "bg-[#FDECEA]"
    },
    {
      name: "Obsidian Aura",
      bg: "bg-gradient-to-b from-[#1C1C1E] via-[#121212] to-[#0A0A0A]",
      textPrimary: "text-[#F5F5DC]",
      textSecondary: "text-[#F5F5DC]/50",
      accent: "border-[#F5F5DC]/10",
      emboss: "0 1px 2px rgba(0,0,0,0.8)",
      barBg: "bg-[#F5F5DC]"
    },
    {
      name: "Ethereal Dawn",
      bg: "bg-gradient-to-tr from-[#3f2b96] to-[#a8c0ff]",
      textPrimary: "text-[#FFFFFF]",
      textSecondary: "text-[#FFFFFF]/70",
      accent: "border-[#FFFFFF]/25",
      emboss: "0 1px 3px rgba(0,0,0,0.3)",
      barBg: "bg-[#FFFFFF]"
    },
    {
      name: "Sapphire Abyss",
      bg: "bg-gradient-to-bl from-[#0F2027] via-[#203A43] to-[#2C5364]",
      textPrimary: "text-[#F0F4F8]",
      textSecondary: "text-[#F0F4F8]/60",
      accent: "border-[#F0F4F8]/15",
      emboss: "0 2px 4px rgba(0,0,0,0.4)",
      barBg: "bg-[#F0F4F8]"
    },
    {
      name: "Neon Cyberpunk",
      bg: "bg-[#090A0F]",
      textPrimary: "text-[#00FFCC]",
      textSecondary: "text-[#00FFCC]/60",
      accent: "border-[#FF00FF]/30",
      emboss: "0 0 8px rgba(0,255,204,0.6)",
      barBg: "bg-[#FF00FF]"
    },
    {
      name: "Film Noir",
      bg: "bg-[#050505]",
      textPrimary: "text-[#E5E5E5]",
      textSecondary: "text-[#E5E5E5]/50",
      accent: "border-[#E5E5E5]/15",
      emboss: "none",
      barBg: "bg-[#E5E5E5]"
    },
    {
      name: "Ethereal Pearl",
      bg: "bg-gradient-to-tr from-[#E0EAFC] to-[#CFDEF3]",
      textPrimary: "text-[#1A1A1A]",
      textSecondary: "text-[#1A1A1A]/50",
      accent: "border-[#1A1A1A]/10",
      emboss: "0 1px 1px rgba(255,255,255,0.8)",
      barBg: "bg-[#1A1A1A]"
    },
    {
      name: "Blood Moon",
      bg: "bg-gradient-to-b from-[#110101] to-[#360808]",
      textPrimary: "text-[#FF4D4D]",
      textSecondary: "text-[#FF4D4D]/60",
      accent: "border-[#FF4D4D]/20",
      emboss: "0 1px 4px rgba(255,0,0,0.5)",
      barBg: "bg-[#FF4D4D]"
    }
  ];

  const currentTheme: ShareTheme = themes[selectedTheme];

  const toggleLine = (index: number, text: string) => {
    if (selectedLines.find((l) => l.originalIndex === index)) {
      setSelectedLines(prev => prev.filter((l) => l.originalIndex !== index));
    } else {
      if (selectedLines.length >= 4) return;
      setSelectedLines(prev => [...prev, { originalIndex: index, text }].sort((a, b) => a.originalIndex - b.originalIndex));
    }
  };

  const handleLineEdit = (index: number, newText: string) => {
    setSelectedLines(prev =>
      prev.map(line =>
        line.originalIndex === index ? { ...line, text: newText } : line
      )
    );
  };

  const generateCanvasBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 4, // Max resolution limit for standard memory devices
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });
    } catch (err) {
      console.error("Export failed", err);
      return null;
    }
  };

  const handleShare = async () => {
    const blob = await generateCanvasBlob();
    if (!blob) return;

    const file = new File([blob], "scrapo-archive.png", { type: "image/png" });
    if (navigator.share && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Scrapo Archive",
        });
        return;
      } catch {
        console.log("Share failed, falling back to download");
      }
    }
    await handleDownload();
  };

  const handleDownload = async () => {
    const blob = await generateCanvasBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrapo-archive-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0A0A0A] border border-white/5 w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-cinzel text-lg text-white font-bold tracking-[0.2em] uppercase">
              {step === "select" ? "Curate Verses" : "The Archive"}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
            {step === "select" ? (
              <div className="space-y-4">
                <p className="text-[10px] text-center text-white/40 mb-8 font-courier uppercase tracking-[0.2em]">
                  Select up to 4 lines to curate
                </p>
                {lines.map((line: string, idx: number) => {
                  const isSelected = selectedLines.some(l => l.originalIndex === idx);
                  return (
                    <motion.div
                      key={idx}
                      onClick={() => toggleLine(idx, line)}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 ${isSelected
                        ? "bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                        : "bg-white/5 border-transparent hover:bg-white/[0.07]"
                        }`}
                    >
                      <p className={`font-playfair text-base leading-relaxed ${isSelected ? "text-white italic" : "text-white/60"}`}>
                        {line}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8">
                {/* THE GOD-TIER CARD PREVIEW */}
                <div
                  ref={cardRef}
                  className={`w-[340px] min-h-[480px] ${currentTheme.bg} relative rounded-md flex flex-col overflow-hidden shadow-2xl`}
                >
                  {/* Aesthetic Glow Effects */}
                  {selectedTheme === 0 && (
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
                  )}
                  {selectedTheme === 1 && (
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
                  )}
                  {selectedTheme === 2 && (
                    <>
                      <div className="absolute top-10 left-10 w-48 h-48 bg-white/30 blur-[60px] rounded-full pointer-events-none" />
                      <div className="absolute bottom-10 right-10 w-64 h-64 bg-yellow-300/20 blur-[80px] rounded-full pointer-events-none" />
                    </>
                  )}
                  {selectedTheme === 3 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
                  )}
                  {selectedTheme === 4 && (
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF00FF]/10 blur-[100px] rounded-full pointer-events-none" />
                  )}
                  {selectedTheme === 5 && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] pointer-events-none" />
                  )}
                  {selectedTheme === 7 && (
                    <div className="absolute top-10 left-10 w-64 h-64 bg-[#FF4D4D]/10 blur-[80px] rounded-full pointer-events-none" />
                  )}

                  {/* Top Metadata */}
                  <div className="flex justify-between items-center w-full px-8 pt-8 z-10">
                    <span className={`font-courier text-[8.5px] uppercase tracking-[0.3em] font-bold ${currentTheme.textSecondary}`}>
                      SCRAPO ARCHIVES
                    </span>
                    <span className={`font-courier text-[8.5px] uppercase tracking-[0.3em] font-bold ${currentTheme.textSecondary}`}>
                      NO. 001
                    </span>
                  </div>

                  {/* Content Container (Rule of Thirds / Plenty of Breathing Room) */}
                  <div className="flex-1 flex flex-col justify-center items-center px-10 py-12 text-center z-10 relative">
                    <QuoteIcon className={`w-8 h-8 opacity-[0.07] absolute top-6 left-8 -translate-y-1/2 ${currentTheme.textPrimary}`} />

                    <div className="space-y-6 w-full relative z-20">
                      {selectedLines.map((lineObj) => (
                        <input
                          key={lineObj.originalIndex}
                          value={lineObj.text}
                          onChange={(e) => handleLineEdit(lineObj.originalIndex, e.target.value)}
                          className={`font-playfair text-xl md:text-2xl leading-[2.2] tracking-wide text-center w-full bg-transparent outline-none ${currentTheme.textPrimary}`}
                          style={{ textShadow: currentTheme.emboss, fontWeight: 600 }}
                        />
                      ))}
                    </div>

                    <QuoteIcon className={`w-8 h-8 opacity-[0.07] absolute bottom-6 right-8 translate-y-1/2 rotate-180 ${currentTheme.textPrimary}`} />
                  </div>

                  {/* Vintage "Spotify" Footer */}
                  <div className={`w-full px-8 pb-8 pt-6 border-t ${currentTheme.accent} mt-auto z-10 flex justify-between items-end`}>
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`font-cinzel text-sm font-semibold tracking-wider ${currentTheme.textPrimary}`}
                        style={{ textShadow: currentTheme.emboss }}
                      >
                        {penName}
                      </span>
                      <span className={`font-courier text-[8px] uppercase tracking-[0.25em] ${currentTheme.textSecondary} flex items-center gap-2`}>
                        Curated Verse <span className="w-1 h-1 rounded-full bg-current opacity-50 block"></span> {new Date().getFullYear()}
                      </span>
                    </div>

                    {/* Pure CSS Vintage Barcode */}
                    <div className={`flex items-end gap-[2.5px] h-7 opacity-80 pb-0.5`}>
                      {[2, 1, 3, 1, 2, 1, 4, 1, 2, 1.5, 3, 1].map((w: number, idx: number) => (
                        <div key={idx} className={`${currentTheme.barBg}`} style={{ width: `${w}px`, height: idx % 3 === 0 ? '100%' : '75%' }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="flex gap-4 overflow-x-auto w-full pb-2 justify-center px-4">
                  {themes.map((t: ShareTheme, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedTheme(i)}
                      className={`w-12 h-12 rounded-full ${t.bg} border border-white/10 ${selectedTheme === i ? "ring-2 ring-white ring-offset-2 ring-offset-[#0A0A0A] scale-110" : "opacity-60 hover:opacity-100"} shadow-lg transition-all duration-300 flex-shrink-0`}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-white/5 bg-white/[0.02] flex gap-3">
            {step === "select" ? (
              <button
                onClick={() => setStep("preview")}
                disabled={selectedLines.length === 0}
                className="w-full py-4 bg-white text-black font-cinzel tracking-widest uppercase text-xs font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
              >
                Curate Selection <ImageIcon className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 py-4 border border-white/10 text-white/70 font-cinzel tracking-widest uppercase text-xs rounded-lg hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex-[3] flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-[1] py-4 bg-white/10 text-white font-cinzel tracking-[0.2em] uppercase text-xs font-bold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center"
                    title="Download Image"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-[2] py-4 bg-white text-black font-cinzel tracking-[0.1em] uppercase text-[10px] md:text-xs font-bold rounded-lg hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    Share Note <Share2 className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
