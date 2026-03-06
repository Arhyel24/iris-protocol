import type { Metadata } from "next";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { AppProviders } from "@/components/app-providers";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "IRIS Protocol  Real-World Insurance on Solana",
    template: "%s | IRIS Protocol",
  },
  description:
    "IRIS is the settlement layer for Real-World Insurance APIs. Pay premiums on-chain, receive payouts via Solana escrow.",
  applicationName: "IRIS Protocol",
  keywords: [
    "IRIS Protocol",
    "Solana Insurance",
    "On-Chain Insurance",
    "Real World Insurance",
    "Crypto Insurance",
  ],
  authors: [{ name: "IRIS Labs" }],
  creator: "IRIS Labs",
  publisher: "IRIS Labs",
  metadataBase: new URL("https://irisprotocol.xyz"),
  openGraph: {
    title: "IRIS Protocol  Real-World Insurance on Solana",
    description: "Pay premiums on-chain. Receive payouts via Solana escrow.",
    url: "https://irisprotocol.xyz",
    siteName: "IRIS Protocol",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IRIS Protocol  Real-World Insurance on Solana",
    description: "The settlement layer for real-world insurance on Solana.",
    site: "@irisprotocol",
  },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-black text-white font-mono antialiased">
        <AppProviders>
          <Navbar />
          <main>{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
