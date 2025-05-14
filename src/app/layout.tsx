import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainNav from "@/components/MainNav";
import { Toaster } from "@/components/ui/sonner";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ fontFamily: 'var(--font-geist-sans)', backgroundColor: '#f9f9f9' }}
      >
        <MainNav />
        <main style={{ minHeight: '100vh', position: 'relative', paddingBottom: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </main>
        <footer style={{ padding: '2rem 0', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
          <p>Smart Todo List &copy; {new Date().getFullYear()}</p>
        </footer>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
