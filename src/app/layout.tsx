import type { Metadata } from "next";
import { AstryxProviders } from "@/components/astryx-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "XO UI registry", template: "%s · XO UI registry" },
  description:
    "Every XO UI component, block and page template, distributed through a shadcn registry.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <AstryxProviders>{children}</AstryxProviders>
      </body>
    </html>
  );
}
