import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Montserrat,
  Poppins,
  DM_Sans,
  Space_Grotesk,
  Plus_Jakarta_Sans,
  Cabin,
  Manrope,
  Outfit
} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/ui/Toast";
import ConditionalNavbar from '../components/ConditionalNavbar';
// Primary Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

// Secondary/Utility Fonts
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const cabin = Cabin({
  subsets: ["latin"],
  variable: "--font-cabin",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hon. Nicholas Mulila - Governor 2027 | Working Today, Building Tomorrow",
  description: "A leader, not just a politician. Join the movement for real change in Kitui County.",
  keywords: "Nicholas Mulila, Kitui Governor, Kitui County, Governor 2027, Leadership, Change Makers, Kenya Politics",
  authors: [{ name: "Team Mulila" }],
  openGraph: {
    title: "Hon. Nicholas Mulila - Governor 2027",
    description: "Working Today, Building Tomorrow. Join the movement for real change in Kitui County.",
    type: "website",
    locale: "en_KE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`
        ${inter.variable}
        ${playfair.variable}
        ${montserrat.variable}
        ${poppins.variable}
        ${dmSans.variable}
        ${spaceGrotesk.variable}
        ${plusJakarta.variable}
        ${cabin.variable}
        ${manrope.variable}
        ${outfit.variable}
        bg-bg-dark
        font-sans
        antialiased
      `}>
        <ToastProvider>
          <ConditionalNavbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
