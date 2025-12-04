"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path) ? "active" : "";

  // Hide Sidebar on Login Page
  if (pathname === "/login") return null;

  return (
    <div className="sidebar">

      <div className="logo-container">
        <img
          src="/logo.svg"
          alt="MonkeyPOS Logo"
          className="logo"
          style={{ width: "150px" }}
        />
      </div>

      <div className="menus top">
        <Link href="/pos" className={`menu ${isActive("/pos")}`}>
          <span className="material-symbols-outlined">point_of_sale</span>
          Terminal POS
        </Link>
      </div>

      <div className="menus center">
        <Link href="/dashboard" className={`menu ${isActive("/dashboard")}`}>
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </Link>

        <Link href="/products" className={`menu ${isActive("/products")}`}>
          <span className="material-symbols-outlined">box</span>
          Produk
        </Link>

        <Link href="/suppliers" className={`menu ${isActive("/suppliers")}`}>
          <span className="material-symbols-outlined">local_shipping</span>
          Supplier
        </Link>

        <Link href="/sales-history" className={`menu ${isActive("/sales-history")}`}>
          <span className="material-symbols-outlined">history</span>
          Riwayat
        </Link>

        <Link href="/members" className={`menu ${isActive("/members")}`}>
          <span className="material-symbols-outlined">badge</span>
          Member
        </Link>

        <Link href="/reports" className={`menu ${isActive("/reports")}`}>
          <span className="material-symbols-outlined">insert_chart</span>
          Laporan
        </Link>
      </div>

      <div className="menus bottom">
        <Link href="/settings" className={`menu ${isActive("/settings")}`}>
          <span className="material-symbols-outlined">settings</span>
          Pengaturan
        </Link>
        <Link href="/login" className="menu text-danger">
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </Link>
      </div>

    </div>
  );
}