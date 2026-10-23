import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import { Sidebar } from "@/components/shared/sidebar";
import { AppNav } from "@/components/shared/app-nav";
import { GlobalLoadingBar } from "@/components/shared/global-loading-bar";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Passe — Mercado de Jogadores",
  description:
    "Mercado de jogadores de uma liga de futebol: jogadores, clubes, compra e venda, escalação, partidas e classificação.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={GeistSans.className}>
      <body className="flex min-h-screen flex-col lg:flex-row">
        <GlobalLoadingBar />
        <div className="lg:hidden">
          <AppNav />
        </div>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6">
            {children}
          </div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
