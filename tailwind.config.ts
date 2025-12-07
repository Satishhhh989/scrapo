import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vintage Paper Tones
        "vintage-paper": "#FDFBF7",
        "old-paper": "#F8F3E6",
        "aged-paper": "#E8DFC8",
        
        // Core Palette
        "ink-black": "#2A2A2A",
        "cherry-red": "#8B0000",
        "faded-gold": "#C5A059",
        "melancholy-blue": "#2C3E50",
        
        // Accent Tones (From Original Design)
        "rose-quartz": "#F7CAC9",
        "dusty-rose": "#D4A5A5",
        "vintage-red": "#C2847A",
        "sepia-dark": "#3A3226",
        "vintage-teal": "#5F9EA0",
      },
      fontFamily: {
        // Serif for headings
        cinzel: ["var(--font-cinzel)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
        
        // Typewriter for poems
        courier: ["var(--font-courier)", "monospace"],
        mono: ["var(--font-geist-mono)", "monospace"],
        
        // Sans for UI elements
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
      boxShadow: {
        "polaroid": "0 20px 50px rgba(58, 50, 38, 0.4), inset 0 0 50px rgba(232, 223, 200, 0.7)",
        "vinyl": "0 8px 24px rgba(58, 50, 38, 0.3)",
        "vintage": "2px 2px 6px rgba(58, 50, 38, 0.15), inset 0 0 6px rgba(255, 255, 255, 0.3)",
      },
      backgroundImage: {
        "film-grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E\")",
        "vintage-texture": "url(\"data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='vintagePattern' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Crect width='100' height='100' fill='none'/%3E%3Cpath d='M0,0 L100,100 M100,0 L0,100' stroke='rgba(194,132,122,0.05)' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='2' fill='rgba(212,165,165,0.1)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23vintagePattern)' opacity='0.3'/%3E%3C/svg%3E\")",
      },
      animation: {
        "typewriter": "typewriter 0.05s steps(1) forwards",
        "blink": "blink 1s step-end infinite",
        "float": "float 6s ease-in-out infinite",
        "fadeIn": "fadeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "slideOut": "slideOut 0.3s ease-out forwards",
        "gradientShift": "gradientShift 8s linear infinite",
      },
      keyframes: {
        typewriter: {
          "to": { left: "100%" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeIn: {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        slideOut: {
          "from": { transform: "translateX(0)" },
          "to": { transform: "translateX(8px)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
      },
    },
  },
  plugins: [],
};

export default config;