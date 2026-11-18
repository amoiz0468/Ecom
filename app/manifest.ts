import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Almoin Store — Crockery, Ladies Boutique & Shoes",
    short_name: "Almoin",
    description:
      "Curated fine crockery, ladies ready-to-wear boutique suits, and ladies footwear delivered across Pakistan.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf7",
    theme_color: "#1c1917",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
