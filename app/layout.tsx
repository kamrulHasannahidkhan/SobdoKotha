import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shobdo Khata: English and Bangla vocabulary",
  description: "Practice, add and edit English to Bangla and Bangla to English vocabulary.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap"
        />
      </head>
      <body>
        <StoreProvider>
          <div className="wrap">
            <Nav />
            <main className="page">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
