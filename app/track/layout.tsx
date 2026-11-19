import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your Almoin Store shipment status.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

