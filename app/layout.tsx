import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./components/BootstrapClient";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { Toaster } from "react-hot-toast"; // <--- 1. Import ini

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MonkeyPOS Next",
  description: "Fullstack POS System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-bs-theme="light">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        <div className="d-flex vh-100 overflow-hidden p-4">

          <Sidebar />

          <main className="flex-grow-1 h-100 d-flex flex-column overflow-hidden">
            <div className="h-100 w-100 overflow-auto">
              {children}
            </div>
          </main>

        </div>
        
        {/* 2. Tambahkan komponen Toaster di sini */}
        <Toaster position="top-center" reverseOrder={false} />
        
        <BootstrapClient />
      </body>
    </html>
  );
}