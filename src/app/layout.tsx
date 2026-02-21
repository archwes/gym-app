import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitPro - Gestão de Academia",
  description: "Aplicativo completo para gestão de academia, personal trainers e alunos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
