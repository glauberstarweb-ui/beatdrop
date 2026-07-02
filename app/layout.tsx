import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "BeatDrop — Adivinhe a música",
    template: "%s | BeatDrop",
  },
  description:
    "Ouça pequenos trechos de músicas e adivinhe qual é a música antes que o tempo acabe.",
  keywords: ["música", "jogo", "adivinhar", "quiz", "beatdrop"],
  authors: [{ name: "BeatDrop" }],
  openGraph: {
    title: "BeatDrop",
    description: "O jogo de adivinhação musical definitivo",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeatDrop",
    description: "Adivinhe a música antes que o tempo acabe!",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased bg-surface-900 text-white min-h-screen`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1a1a28",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
