import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://almoincrockery.pk"
  ),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Almoin Store",
    statusBarStyle: "default",
  },
  title: {
    default: "Almoin Store (المُعِين) | Crockery, Ladies Boutique & Shoes Pakistan",
    template: "%s | Almoin Store",
  },
  description:
    "Shop fine bone china crockery, ladies ready-to-wear boutique suits, and handcrafted ladies shoes delivered across Pakistan with Cash on Delivery.",
  keywords: [
    "almoin store",
    "almoin crockery",
    "ladies ready to wear suits pakistan",
    "ladies shoes khussa heels pakistan",
    "bone china dinner set",
  ],
  openGraph: {
    type: "website",
    title: "Almoin Store | Crockery, Ladies Boutique & Footwear Pakistan",
    description:
      "Three curated stores in one destination: Fine Crockery, Ladies Ready-to-Wear Suits, and Ladies Shoes across Pakistan.",
    images: ["/logo-card.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Almoin Store | Crockery, Ladies Boutique & Footwear Pakistan",
    description:
      "Shop Fine Crockery, Ladies Ready-to-Wear Boutique Suits, and Ladies Shoes with Cash on Delivery across Pakistan.",
    images: ["/logo-card.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-800 selection:text-amber-50">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
