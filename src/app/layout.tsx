import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainNav from "@/components/MainNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Todo List App",
  description: "A smart todo list app with auto-categorization based on deadlines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <MainNav />
        <main className="min-h-screen relative px-4 pb-8 max-w-screen-lg mx-auto">
          {children}
        </main>
        <footer className="py-6 text-center text-neutral-500 text-sm">
          <p>Smart Todo List &copy; {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
