// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format timestamp to vintage style
 * @example "summer '69" or "winter '24"
 */
export function formatVintageDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seasons = ["winter", "spring", "summer", "autumn"];
  const month = d.getMonth();
  const season = seasons[Math.floor(month / 3)];
  const year = d.getFullYear().toString().slice(-2);
  return `${season} '${year}`;
}

/**
 * Format timestamp to readable time
 * @example "2:45 PM"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Delay utility for typewriter effect
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize filename for export
 */
export function sanitizeFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

/**
 * Parse markdown-style formatting for poems
 */
export function parsePoetryMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([\s\S]*?)\*/g, "<em class=\"opacity-90 italic\">$1</em>")
    .replace(/_([\s\S]*?)_/g, "<em class=\"opacity-90 italic\">$1</em>")
    .replace(/\n/g, "<br>");
}