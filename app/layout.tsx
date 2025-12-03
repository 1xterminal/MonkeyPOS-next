import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./components/BootstrapClient";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MonkeyPOS Next", // Ubah judul tab browser
  description: "Fullstack POS System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/* Container Utama: Flexbox & Padding agar Sidebar punya jarak dari tepi */}
        <div className="d-flex vh-100 overflow-hidden p-4">

          {/* Sidebar Komponen */}
          <Sidebar />

          {/* Area Konten Kanan */}
          <main className="flex-grow-1 h-100 d-flex flex-column overflow-hidden">
            <div className="h-100 w-100 overflow-auto">
              {children}
            </div>
          </main>

        </div>

        <BootstrapClient />
      </body>
    </html>
  );
}