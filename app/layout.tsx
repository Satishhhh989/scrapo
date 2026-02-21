import type { Metadata } from "next";
import {
  Cinzel, Playfair_Display, Courier_Prime, Montserrat,
  Cormorant_Garamond, Lora, Merriweather, EB_Garamond,
  Spectral, Space_Mono, Bodoni_Moda, Libre_Baskerville,
  Alice, Fraunces, Inconsolata, Outfit, Special_Elite
} from "next/font/google";
import "./globals.css";
import FloatingElements from "@/components/FloatingElements";

// Font configurations
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
});

const courier = Courier_Prime({
  subsets: ["latin"],
  variable: "--font-courier",
  weight: ["400", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "700"],
});

const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["400", "600"] });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", weight: ["400", "500"] });
const merriweather = Merriweather({ subsets: ["latin"], variable: "--font-merriweather", weight: ["300", "400"] });
const ebGaramond = EB_Garamond({ subsets: ["latin"], variable: "--font-eb-garamond", weight: ["400", "500"] });
const spectral = Spectral({ subsets: ["latin"], variable: "--font-spectral", weight: ["400"] });
const spaceMono = Space_Mono({ subsets: ["latin"], variable: "--font-space-mono", weight: ["400"] });
const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", weight: ["400"], adjustFontFallback: false });
const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], variable: "--font-libre", weight: ["400"] });
const alice = Alice({ subsets: ["latin"], variable: "--font-alice", weight: ["400"] });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400"] });
const inconsolata = Inconsolata({ subsets: ["latin"], variable: "--font-inconsolata", weight: ["400"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["300", "400"] });
const specialElite = Special_Elite({ subsets: ["latin"], variable: "--font-special-elite", weight: ["400"] });

export const metadata: Metadata = {
  title: "SCRAPO - Vintage AI Poetry Generator",
  description: "Your personal melancholic poet. Create vintage-styled poetry with AI in the aesthetic of Lana Del Rey.",
  keywords: ["poetry", "AI", "vintage", "aesthetic", "Lana Del Rey", "creative writing"],
  authors: [{ name: "Satish" }],
  openGraph: {
    title: "SCRAPO - Vintage AI Poetry Generator",
    description: "Create melancholic, vintage-styled poetry with AI",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#3a3226",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${playfair.variable} ${courier.variable} ${montserrat.variable} ${cormorant.variable} ${lora.variable} ${merriweather.variable} ${ebGaramond.variable} ${spectral.variable} ${spaceMono.variable} ${bodoni.variable} ${libreBaskerville.variable} ${alice.variable} ${fraunces.variable} ${inconsolata.variable} ${outfit.variable} ${specialElite.variable} font-playfair antialiased`}
      >
        {/* Background with vintage texture and film grain */}
        <div className="fixed inset-0 -z-20 bg-gradient-to-br from-vintage-paper via-old-paper to-aged-paper" />
        <div className="fixed inset-0 -z-10 bg-film-grain opacity-20 pointer-events-none" />
        <div className="fixed inset-0 -z-10 bg-vintage-texture opacity-30 pointer-events-none" />

        {/* Cinematic letterbox bars (visible on desktop) */}
        <div className="hidden md:block fixed top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-50" />
        <div className="hidden md:block fixed bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-50" />

        {/* Floating ambient elements */}
        <FloatingElements />

        {/* Main content */}
        {children}
      </body>
    </html>
  );
}