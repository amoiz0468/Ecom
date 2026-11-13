import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Basket",
  description: "Review your selected Almoin Crockery tableware items.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

