import type { Metadata } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/findit/Navbar";

// Primary Font - Clean, Modern
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Secondary Font - Headings
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FindIT - University Lost & Found System",
  description: "Find what you've lost, get it back fast. The smart lost and found platform for university students.",
  keywords: "lost and found, university, students, find items, lost property",
  authors: [{ name: "FindIT Team" }],
  openGraph: {
    title: "FindIT - Lost & Found System",
    description: "Find what you've lost, get it back fast.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, plusJakarta.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>
          <Navbar />
          <div className="relative z-10">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
