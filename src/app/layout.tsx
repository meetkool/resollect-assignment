import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-gray-50 to-gray-100`}
      >
        <div className="fixed inset-0 bg-grid-primary/[0.02] -z-10" />
        <div className="fixed inset-0 bg-gradient-radial from-transparent to-gray-100/80 -z-10" />
        <Navbar />
        <main className="min-h-screen relative pt-4">
          {children}
        </main>
        <footer className="py-6 text-center text-gray-500 text-sm">
          <p>Smart Todo List &copy; {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
