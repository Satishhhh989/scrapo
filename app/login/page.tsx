"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Feather } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";

/**
 * Login Page - Vintage membership card aesthetic
 * Collects Pen Name during sign-up
 */
export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        if (!penName.trim()) {
          setError("Please enter your pen name");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          penName: penName.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preferences: {
            mood: "melancholic",
            theme: "default",
          },
        };

        await setDoc(doc(db, "users", user.uid), userProfile);
        router.push("/");
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        // New user - create profile with default pen name
        const defaultPenName = user.displayName || "Anonymous Poet";
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          penName: defaultPenName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preferences: {
            mood: "melancholic",
            theme: "default",
          },
        };

        await setDoc(doc(db, "users", user.uid), userProfile);
      }

      router.push("/");
    } catch (err: unknown) {
      console.error("Google auth error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Google authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Membership Card */}
        <div className="bg-vintage-paper border-[3px] border-faded-gold shadow-polaroid p-8 md:p-10 relative">
          {/* Film grain overlay */}
          <div className="absolute inset-0 bg-film-grain opacity-10 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.h1
                className="font-cinzel text-4xl md:text-5xl font-bold text-sepia-dark mb-2"
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
                SCRAPO
              </motion.h1>
              <p className="font-sans text-sm text-vintage-red italic">
                {isSignUp ? "Join the Society" : "Welcome Back"}
              </p>
            </div>

            {/* Feather Divider */}
            <div className="flex items-center justify-center mb-6">
              <Feather className="w-6 h-6 text-faded-gold stroke-[1.5px]" />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="mb-4 p-3 bg-cherry-red/10 border border-cherry-red/30 rounded-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm text-cherry-red font-sans">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block font-sans text-sm text-ink-black mb-2">
                    Pen Name <span className="text-cherry-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="The Melancholic Poet"
                    className="w-full px-4 py-3 bg-old-paper border-2 border-dusty-rose rounded-sm font-courier text-ink-black placeholder:text-melancholy-blue/50 focus:outline-none focus:border-cherry-red transition-colors"
                    required={isSignUp}
                  />
                  <p className="mt-1 text-xs font-sans text-melancholy-blue/70 italic">
                    This is how the AI will address you
                  </p>
                </div>
              )}

              <div>
                <label className="block font-sans text-sm text-ink-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="poet@vintage.com"
                  className="w-full px-4 py-3 bg-old-paper border-2 border-dusty-rose rounded-sm font-courier text-ink-black placeholder:text-melancholy-blue/50 focus:outline-none focus:border-cherry-red transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-sm text-ink-black mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-old-paper border-2 border-dusty-rose rounded-sm font-courier text-ink-black placeholder:text-melancholy-blue/50 focus:outline-none focus:border-cherry-red transition-colors"
                  required
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-cherry-red to-vintage-red text-vintage-paper font-cinzel font-bold border-2 border-cherry-red rounded-sm hover:from-vintage-red hover:to-cherry-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {loading ? "Processing..." : isSignUp ? "Sign the Registry" : "Enter"}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dusty-rose" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-vintage-paper font-sans text-melancholy-blue">
                  or
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <motion.button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3 bg-vintage-paper border-2 border-faded-gold text-ink-black font-sans rounded-sm hover:bg-old-paper transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </motion.button>

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="font-sans text-sm text-melancholy-blue hover:text-cherry-red transition-colors underline"
              >
                {isSignUp
                  ? "Already a member? Sign in"
                  : "New here? Join the society"}
              </button>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-faded-gold" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-faded-gold" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-faded-gold" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-faded-gold" />
        </div>

        {/* Attribution */}
        <motion.p
          className="text-center mt-6 font-sans text-sm text-melancholy-blue/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Made with ♥ by Satish
        </motion.p>
      </motion.div>
    </div>
  );
}