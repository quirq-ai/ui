import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Quicksand } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: { default: "quirq shapes", template: "%s · quirq shapes" },
  description:
    "Every UI component shape used across quirq products, demoed live in Next.js, plus a sample app built from them.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    /* Font variables belong on <html>: Tailwind's @theme resolves them at
       :root, so declaring them on <body> would leave those tokens invalid. */
    <html lang="en" className={`${plexMono.variable} ${quicksand.variable}`}>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
