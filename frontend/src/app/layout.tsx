import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: {
    default: "IRIS - AI-Powered Risk Protection for Solana DeFi",
    template: "%s | IRIS Protocol",
  },
  description:
    "Protect your crypto portfolio on Solana with AI-powered wallet risk scores and automated insurance. IRIS gives you real-time risk detection, protection suggestions, and on-chain claim execution.",
  applicationName: "IRIS DeFi Insurance",
  keywords: [
    "DeFi Insurance",
    "Solana Risk Engine",
    "AI Crypto Protection",
    "Wallet Risk Score",
    "IRIS Solana",
    "Crypto Portfolio Insurance",
    "Blockchain Risk Management",
    "Real-Time Token Risk",
  ],
  authors: [
    { name: "IRIS Team" },
    { name: "IRIS", url: "https://irisdefi.xyz" },
  ],
  creator: "IRIS Labs",
  publisher: "IRIS Labs",
  metadataBase: new URL("https://irisdefi.xyz"),
  openGraph: {
    title: "IRIS – AI-Powered DeFi Insurance on Solana",
    description:
      "Get real-time protection from volatility, rug pulls, and whale risks with AI-driven wallet scoring and automated insurance.",
    url: "https://irisdefi.xyz",
    siteName: "IRIS DeFi Insurance",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://irisdefi.xyz/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "IRIS – AI-Powered DeFi Insurance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRIS – AI-Powered DeFi Insurance on Solana",
    description:
      "Protect your portfolio with AI-driven risk scores and insurance automation. Built for Solana.",
    site: "@irisdefi",
    creator: "@irisdefi",
    images: ["https://irisdefi.xyz/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  category: "Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppProviders> {children}</AppProviders>
      </body>
    </html>
  );
}
