import type { Metadata } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nusantara Indah Property",
  description:
    "Nusantara Indah Property menyediakan hunian premium, vila, dan properti investasi yang elegan dan strategis.",
  openGraph: {
    title: "Nusantara Indah Property",
    description:
      "Nusantara Indah Property menyediakan hunian premium, vila, dan properti investasi yang elegan dan strategis.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/images/logo/logo-10-32.png?v=4",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/images/logo/logo-10.png?v=4",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/images/logo/logo-10-180.png?v=4",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body>
        <Navbar />
        {children}
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
