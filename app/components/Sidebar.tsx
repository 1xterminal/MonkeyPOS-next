"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // Helper untuk mengecek active class
  const isActive = (path: string) => pathname.startsWith(path) ? "active" : "";

  return (
    <div className="sidebar">
      
      {/* 1. Logo Container */}
      <div className="logo-container">
        {/* Pastikan file logo ada di public/img/logo/logo.svg */}
        <img 
          src="/img/logo/logo.svg" 
          alt="MonkeyPOS Logo" 
          className="logo" 
          style={{ width: "150px" }} // Sesuaikan ukuran jika perlu
        />
      </div>

      {/* 2. Menu Bagian Atas (Dashboard) */}
      <div className="menus top">
        <Link href="/dashboard" className={`menu ${isActive("/dashboard")}`}>
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </Link>
      </div>

      {/* 3. Menu Bagian Tengah (Operasional Utama) */}
      <div className="menus center">
        <Link href="/pos" className={`menu ${isActive("/pos")}`}>
          <span className="material-symbols-outlined">point_of_sale</span>
          Terminal POS
        </Link>
        
        <Link href="/products" className={`menu ${isActive("/products")}`}>
          <span className="material-symbols-outlined">inventory_2</span>
          Daftar Produk
        </Link>
        
        <Link href="/history" className={`menu ${isActive("/history")}`}>
          <span className="material-symbols-outlined">history</span>
          Riwayat Penjualan
        </Link>
        
        <Link href="/members" className={`menu ${isActive("/members")}`}>
          <span className="material-symbols-outlined">badge</span>
          Daftar Member
        </Link>
        
        <Link href="/reports" className={`menu ${isActive("/reports")}`}>
          <span className="material-symbols-outlined">insert_chart</span>
          Laporan
        </Link>
      </div>

      {/* 4. Menu Bagian Bawah (User/Settings) */}
      <div className="menus bottom">
        <Link href="/settings" className={`menu ${isActive("/settings")}`}>
          <span className="material-symbols-outlined">settings</span>
          Pengaturan
        </Link>
        {/* Tombol Logout Dummy */}
        <Link href="/login" className="menu text-danger">
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </Link>
      </div>

    </div>
  );
}