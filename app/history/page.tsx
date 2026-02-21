"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Poem, MoodType } from "@/lib/types";
import VinylCard from "@/components/VinylCard";
import LoadingScreen from "@/components/LoadingScreen";
import { exportAsPDF } from "@/lib/exportUtils";

export default function HistoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<MoodType | "all">("all");
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  // Fetch poems
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "poems"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const poemsData: Poem[] = [];

        querySnapshot.forEach((doc: typeof querySnapshot.docs[0]) => {
          poemsData.push({ id: doc.id, ...doc.data() } as Poem);
        });

        setPoems(poemsData);
        setFilteredPoems(poemsData);
      } catch (error) {
        console.error("Error fetching poems:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Filter poems
  useEffect(() => {
    let filtered = [...poems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (poem) =>
          poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          poem.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Mood filter
    if (filterMood !== "all") {
      filtered = filtered.filter((poem) => poem.mood === filterMood);
    }

    setFilteredPoems(filtered);
  }, [searchQuery, filterMood, poems]);

  // Toggle favorite
  const handleToggleFavorite = async (poemId: string) => {
    try {
      const poem = poems.find((p) => p.id === poemId);
      if (!poem) return;

      await updateDoc(doc(db, "poems", poemId), {
        isFavorite: !poem.isFavorite,
      });

      setPoems((prev) =>
        prev.map((p) =>
          p.id === poemId ? { ...p, isFavorite: !p.isFavorite } : p
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Delete poem
  const handleDelete = async (poemId: string) => {
    if (!confirm("Are you sure you want to delete this poem?")) return;

    try {
      await deleteDoc(doc(db, "poems", poemId));
      setPoems((prev) => prev.filter((p) => p.id !== poemId));
    } catch (error) {
      console.error("Error deleting poem:", error);
    }
  };

  // Export poem
  const handleExport = async (poem: Poem) => {
    try {
      await exportAsPDF(poem);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0D0E12]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push("/")}
                className="p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-[#F5F5F5] stroke-[1.5px]" />
              </motion.button>

              <div>
                <h1 className="font-cinzel text-3xl md:text-5xl font-bold text-[#F5F5F5] tracking-wide">
                  The Archive
                </h1>
                <p className="font-courier text-xs text-[#F5F5F5]/40 uppercase tracking-[0.2em] mt-2">
                  {poems.length} curated verses
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 stroke-[1.5px]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the archive..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-sans text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors shadow-inner"
              />
            </div>

            {/* Mood Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 stroke-[1.5px]" />
              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value as MoodType | "all")}
                className="w-full md:w-48 pl-12 pr-4 py-3 bg-[#111216] border border-white/10 rounded-xl font-sans text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer shadow-inner"
              >
                <option value="all">Every Mood</option>
                <option value="melancholic">Melancholic</option>
                <option value="romantic">Romantic</option>
                <option value="rebellious">Rebellious</option>
                <option value="dreamy">Dreamy</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Poems Grid */}
        {filteredPoems.length === 0 ? (
          <motion.div
            className="text-center py-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-playfair text-xl md:text-2xl text-white/30 italic font-light tracking-wide">
              The archive is empty. Begin your story...
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence>
              {filteredPoems.map((poem) => (
                <VinylCard
                  key={poem.id}
                  poem={poem}
                  onSelect={setSelectedPoem}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                  onExport={handleExport}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Poem Detail Modal */}
      <AnimatePresence>
        {selectedPoem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPoem(null)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0A0A0A] border border-white/10 shadow-2xl rounded-2xl p-6 md:p-10 relative scrollbar-thin scrollbar-thumb-white/10"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />

              <div className="relative z-10">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-white mb-4 tracking-wide">
                    {selectedPoem.title}
                  </h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md font-courier text-[10px] text-white/70 uppercase tracking-widest shadow-inner">
                      {selectedPoem.mood}
                    </span>
                    <span className="font-courier text-[10px] text-white/40 uppercase tracking-widest">
                      {new Date(selectedPoem.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-8" />

                {/* Chat History Context */}
                {selectedPoem.prompt && (
                  <div className="mb-8 p-5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                    <p className="font-courier text-[10px] uppercase tracking-widest text-[#F5F5F5]/40 mb-3">You whispered:</p>
                    <p className="font-sans text-sm md:text-base text-[#F5F5F5]/80 italic border-l-2 border-white/20 pl-4 py-1">
                      &quot;{selectedPoem.prompt}&quot;
                    </p>
                  </div>
                )}

                {/* Content */}
                <div className="font-playfair text-lg md:text-xl text-[#F5F5F5]/90 leading-relaxed whitespace-pre-wrap mb-10 pl-2">
                  {selectedPoem.content}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-6 border-t border-white/5">
                  <motion.button
                    onClick={() => handleExport(selectedPoem)}
                    className="px-6 py-2.5 bg-white/10 text-white font-cinzel text-xs font-bold tracking-[0.2em] uppercase rounded-lg hover:bg-white/20 transition-all border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Eternalize
                  </motion.button>

                  <motion.button
                    onClick={() => setSelectedPoem(null)}
                    className="px-6 py-2.5 bg-transparent border border-white/10 text-white/70 font-cinzel text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-white/5 hover:text-white transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Return
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}