"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Check, Music2, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { Poem } from "@/lib/types";

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

  // "Spotify" Themes
  const themes = [
    { name: "Melancholy", bg: "bg-gradient-to-br from-[#2c3e50] via-[#3a3226] to-[#000000]", text: "text-vintage-white" },
    { name: "Lana's Rose", bg: "bg-gradient-to-br from-[#d4a5a5] via-[#f7cac9] to-[#c2847a]", text: "text-[#3a3226]" },
    { name: "Midnight", bg: "bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]", text: "text-white" },
    { name: "Golden Hour", bg: "bg-gradient-to-tr from-[#c5a059] via-[#e8dfc8] to-[#d4af37]", text: "text-[#2a2a2a]" },
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
      // Generate Image
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        backgroundColor: null,
        useCORS: true,
      });

      // Convert to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], "scrapo-poem.png", { type: "image/png" });

        // Try Native Share (Mobile) - Fixed TypeScript Check
        if (navigator.share && typeof navigator.canShare === "function") {
          if (navigator.canShare({ files: [file] })) {
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
        }

        // Fallback: Download (Desktop)
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scrapo-story-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-vintage-paper w-full max-w-md rounded-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-dusty-rose/30 flex justify-between items-center">
          <h3 className="font-cinzel text-lg text-ink-black font-bold">
            {step === "select" ? "Select Verses" : "Customize Card"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full">
            <X className="w-5 h-5 text-ink-black" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === "select" ? (
            <div className="space-y-2">
              <p className="text-xs text-center text-melancholy-blue mb-4 font-sans uppercase tracking-widest">
                Pick up to 4 lines
              </p>
              {lines.map((line, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => toggleLine(idx)}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 rounded-md cursor-pointer border transition-all ${
                    selectedLines.includes(idx)
                      ? "bg-rose-quartz/30 border-vintage-red shadow-sm"
                      : "bg-white/50 border-transparent hover:bg-white"
                  }`}
                >
                  <p className={`font-courier text-sm ${selectedLines.includes(idx) ? "text-ink-black font-bold" : "text-ink-black/60"}`}>
                    {line}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {/* THE CARD PREVIEW */}
              <div 
                ref={cardRef}
                className={`w-[280px] aspect-[9/16] ${themes[selectedTheme].bg} relative shadow-2xl rounded-sm overflow-hidden flex flex-col p-6`}
              >
                {/* Grain Overlay */}
                <div className="absolute inset-0 bg-film-grain opacity-20 pointer-events-none mix-blend-overlay" />
                
                {/* Content Container */}
                <div className="flex-1 flex flex-col justify-center items-center text-center z-10 space-y-6">
                  {selectedLines.map(i => (
                    <p key={i} className={`font-cinzel text-xl md:text-2xl leading-relaxed ${themes[selectedTheme].text} drop-shadow-md`}>
                      {lines[i]}
                    </p>
                  ))}
                </div>

                {/* Spotify-style Footer */}
                <div className="z-10 mt-auto pt-6">
                  <div className="w-full h-1 bg-white/30 rounded-full mb-3 overflow-hidden">
                    <div className="w-2/3 h-full bg-white/80 rounded-full" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`font-sans text-[10px] font-bold uppercase tracking-wider opacity-80 ${themes[selectedTheme].text}`}>
                        {penName}
                      </p>
                      <p className={`font-playfair text-xs italic opacity-60 ${themes[selectedTheme].text}`}>
                        Scrapo Original • {new Date().getFullYear()}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full border ${themes[selectedTheme].text === "text-white" ? "border-white/30" : "border-black/10"}`}>
                      <Music2 className={`w-4 h-4 ${themes[selectedTheme].text}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="flex gap-3 overflow-x-auto w-full pb-2 justify-center">
                {themes.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTheme(i)}
                    className={`w-10 h-10 rounded-full ${t.bg} border-2 ${selectedTheme === i ? "border-ink-black scale-110" : "border-transparent"} shadow-md transition-all`}
                    title={t.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-dusty-rose/30 bg-white/50 backdrop-blur-sm">
          {step === "select" ? (
            <button
              onClick={() => setStep("preview")}
              disabled={selectedLines.length === 0}
              className="w-full py-3 bg-ink-black text-vintage-white font-cinzel rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sepia-dark transition-colors flex items-center justify-center gap-2"
            >
              Next <ImageIcon className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setStep("select")}
                className="flex-1 py-3 border border-ink-black text-ink-black font-sans text-sm rounded-sm hover:bg-black/5"
              >
                Back
              </button>
              <button
                onClick={handleShare}
                className="flex-[2] py-3 bg-vintage-red text-white font-sans text-sm font-bold rounded-sm hover:bg-cherry-red shadow-lg flex items-center justify-center gap-2"
              >
                Share to Story <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
