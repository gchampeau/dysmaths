import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dysmaths",
  description: "Multilingual math writing workspace."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          defer
          src="https://umami.champeau.info/script.js"
          data-website-id="5fb50e68-45bd-4a02-8da5-ffe741541fe3"
        />
      </body>
    </html>
  );
}
