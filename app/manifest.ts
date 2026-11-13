import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Almoin Crockery — Fine Tableware & Bone China",
    short_name: "Almoin",
    description:
      "Curated royal bone china dinner sets, ceramic platters, and artisan stoneware tableware across Pakistan.",
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

