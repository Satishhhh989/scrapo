import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Courier_Prime, Montserrat } from "next/font/google";
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
        className={`${cinzel.variable} ${playfair.variable} ${courier.variable} ${montserrat.variable} font-playfair antialiased`}
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