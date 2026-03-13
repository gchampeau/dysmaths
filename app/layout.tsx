import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maths Facile",
  description:
    "Une application Next.js pensée pour permettre aux collégiens et lycéens de rédiger, sauvegarder et imprimer leurs formules mathématiques."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
