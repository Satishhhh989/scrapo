// lib/types.ts

// User Profile stored in Firestore
export interface UserProfile {
  uid: string;
  email: string;
  penName: string; // The poetic pseudonym (e.g., "The Sad Poet")
  createdAt: string;
  updatedAt: string;
  preferences?: {
    mood?: MoodType;
    theme?: ThemeType;
  };
}

// Poem Document in Firestore
export interface Poem {
  id: string;
  userId: string;
  title: string;
  content: string; // The full poem text
  prompt: string; // User's original input
  mood: MoodType;
  theme: ThemeType;
  createdAt: string;
  updatedAt?: string;
  isFavorite?: boolean;
}

// Message in Chat Interface
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

// AI Mood Settings (From original design)
export type MoodType = "melancholic" | "romantic" | "rebellious" | "dreamy";

export const MOODS: Record<MoodType, string> = {
  melancholic: "Respond in a melancholic, nostalgic style with references to lost love and faded glory.",
  romantic: "Respond in a romantic, passionate style with poetic declarations of love and desire.",
  rebellious: "Respond in a rebellious, wild style with references to fast cars, bad boys, and dangerous love.",
  dreamy: "Respond in a dreamy, ethereal style with surreal imagery and floating sensations.",
};

// Theme Settings (From original design)
export type ThemeType = "default" | "midnight" | "sunset";

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const THEMES: Record<ThemeType, Theme> = {
  default: {
    name: "Vintage",
    colors: {
      primary: "#FDFBF7",
      secondary: "#E8DFC8",
      accent: "#8B0000",
      background: "#F8F3E6",
      text: "#2A2A2A",
    },
  },
  midnight: {
    name: "Midnight",
    colors: {
      primary: "#1A1A2E",
      secondary: "#16213E",
      accent: "#B14AED",
      background: "#0F3460",
      text: "#E2E2E2",
    },
  },
  sunset: {
    name: "Sunset",
    colors: {
      primary: "#FFF5E6",
      secondary: "#FFEBCC",
      accent: "#FF6B8B",
      background: "#FFB3BA",
      text: "#4A3933",
    },
  },
};

// API Request/Response Types
export interface GeneratePoemRequest {
  prompt: string;
  mood: MoodType;
  penName?: string;
  conversationHistory?: Message[];
  command?: "expand" | "shorten" | "rewrite_pov";
}

export interface GeneratePoemResponse {
  success: boolean;
  content?: string;
  error?: string;
}

// Export Options
export interface ExportOptions {
  format: "png" | "pdf";
  quality: number;
  includeWatermark: boolean;
}

/** Represents the visual styling themes for the ShareCard **/
export interface ShareTheme {
  name: string;
  bg: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  emboss: string;
  barBg: string;
}