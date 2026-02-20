"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Filter, Trash2 } from "lucide-react";
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

        querySnapshot.forEach((doc: any) => {
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
    <div className="min-h-screen p-4 md:p-8">
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
                className="p-2 bg-vintage-paper border-2 border-faded-gold rounded-full hover:bg-rose-quartz transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-melancholy-blue stroke-[1.5px]" />
              </motion.button>

              <div>
                <h1 className="font-cinzel text-3xl md:text-5xl font-bold text-sepia-dark">
                  The Vinyl Collection
                </h1>
                <p className="font-sans text-sm text-vintage-red italic mt-1">
                  {poems.length} poems collected
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-melancholy-blue/50 stroke-[1.5px]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search poems..."
                className="w-full pl-10 pr-4 py-3 bg-vintage-paper border-2 border-dusty-rose rounded-sm font-sans text-ink-black placeholder:text-melancholy-blue/50 focus:outline-none focus:border-cherry-red transition-colors"
              />
            </div>

            {/* Mood Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-melancholy-blue/50 stroke-[1.5px]" />
              <select
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value as MoodType | "all")}
                className="w-full md:w-48 pl-10 pr-4 py-3 bg-vintage-paper border-2 border-dusty-rose rounded-sm font-sans text-ink-black focus:outline-none focus:border-cherry-red transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Moods</option>
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
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-playfair text-2xl text-melancholy-blue/70 italic">
              No poems found. Start creating your collection...
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sepia-dark/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPoem(null)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-vintage-paper border-2 border-faded-gold shadow-polaroid rounded-sm p-6 md:p-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Film grain */}
              <div className="absolute inset-0 bg-film-grain opacity-10 pointer-events-none rounded-sm" />

              <div className="relative">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold text-ink-black mb-2">
                    {selectedPoem.title}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2 py-1 bg-cherry-red/10 border border-cherry-red/30 rounded-sm font-sans text-xs text-cherry-red uppercase tracking-wide">
                      {selectedPoem.mood}
                    </span>
                    <span className="font-sans text-sm text-melancholy-blue italic">
                      {new Date(selectedPoem.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-20 h-0.5 bg-gradient-to-r from-faded-gold to-transparent mb-6" />

                {/* Content */}
                <div className="font-courier text-base md:text-lg text-ink-black leading-relaxed whitespace-pre-wrap mb-6">
                  {selectedPoem.content}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <motion.button
                    onClick={() => handleExport(selectedPoem)}
                    className="px-4 py-2 bg-gradient-to-r from-faded-gold to-cherry-red text-vintage-paper font-sans rounded-sm hover:from-cherry-red hover:to-faded-gold transition-all"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    Eternalize
                  </motion.button>

                  <motion.button
                    onClick={() => setSelectedPoem(null)}
                    className="px-4 py-2 bg-vintage-paper border-2 border-dusty-rose text-ink-black font-sans rounded-sm hover:bg-rose-quartz transition-colors"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    Close
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