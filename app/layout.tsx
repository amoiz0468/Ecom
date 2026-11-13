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
    title: "Almoin Crockery",
    statusBarStyle: "default",
  },
  title: {
    default: "Almoin Crockery (المُعِين) | Luxury Crockery & Fine Bone China Pakistan",
    template: "%s | Almoin Crockery",
  },
  description:
    "Curated royal bone china dinner sets, handcrafted ceramic platters, and artisan stoneware tableware delivered across Pakistan with Cash on Delivery and a 100% Transit Breakage Guarantee.",
  keywords: [
    "almoin crockery",
    "crockery pakistan",
    "dinner sets pakistan",
    "bone china dinner set",
    "ceramic tableware karachi lahore islamabad",
  ],
  openGraph: {
    type: "website",
    title: "Almoin Crockery | Fine Tableware & Bone China Pakistan",
    description:
      "Shop luxury bone china dinner sets, bowls, cups & mugs, and serving platters across Pakistan.",
    images: ["/logo-card.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Almoin Crockery | Fine Tableware & Bone China Pakistan",
    description:
      "Shop luxury bone china dinner sets, bowls, cups & mugs, and serving platters across Pakistan.",
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
