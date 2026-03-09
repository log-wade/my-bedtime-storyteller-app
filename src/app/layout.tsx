import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers";
import { Nav } from "@/components/nav";
import { PlayerProvider } from "@/contexts/PlayerContext";
import MediaPlayer from "@/components/MediaPlayer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Bedtime Storyteller",
  description: "Search for a book and let the voice agent read it to you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100`}
      >
        <AuthSessionProvider>
          <PlayerProvider>
            <Nav />
            {children}
            <MediaPlayer />
          </PlayerProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
