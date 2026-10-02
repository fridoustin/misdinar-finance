import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Nav } from "@/presentation/Nav";

export const metadata: Metadata = { title: "Temu Misdinar Finance" };
export const viewport: Viewport = { themeColor: "#F7F1E7", viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app"><main id="view">{children}</main><Nav /></div>
      </body>
    </html>
  );
}
