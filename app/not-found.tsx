"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 404 */}
        <motion.h1
          className="font-cinzel text-8xl md:text-9xl font-bold text-sepia-dark mb-4"
          animate={{
            backgroundImage: [
              "linear-gradient(to right, #2A2A2A, #8B0000, #C5A059, #2C3E50, #2A2A2A)",
            ],
            backgroundSize: ["200% auto"],
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-playfair text-2xl md:text-3xl text-ink-black mb-2">
            Lost in the Poetry
          </h2>
          <p className="font-sans text-melancholy-blue italic">
            This page has faded like old memories...
          </p>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cherry-red to-vintage-red border-2 border-cherry-red rounded-sm text-vintage-paper font-cinzel hover:from-vintage-red hover:to-cherry-red transition-all"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Home className="w-5 h-5 stroke-[1.5px]" />
              Return Home
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative Quote */}
        <motion.p
          className="mt-12 font-playfair italic text-melancholy-blue/70 text-sm max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          "Not all who wander are lost, but this page certainly is..."
        </motion.p>
      </motion.div>
    </div>
  );
}