"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'ADMIN' | 'CASHIER' | null>(null);

  const isActive = (path: string) => pathname.startsWith(path) ? "active" : "";

  // Fetch user role from JWT
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Failed to get user role:', error);
      }
    };
    getUserRole();
  }, []);

  // Hide Sidebar on Login Page
  if (pathname === "/login") return null;

  const isAdmin = userRole === 'ADMIN';

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

        {isAdmin && (
          <Link href="/products" className={`menu ${isActive("/products")}`}>
            <span className="material-symbols-outlined">box</span>
            Produk
          </Link>
        )}

        {isAdmin && (
          <Link href="/categories" className={`menu ${isActive("/categories")}`}>
            <span className="material-symbols-outlined">category</span>
            Kategori
          </Link>
        )}

        {isAdmin && (
          <Link href="/suppliers" className={`menu ${isActive("/suppliers")}`}>
            <span className="material-symbols-outlined">local_shipping</span>
            Supplier
          </Link>
        )}

        <Link href="/sales-history" className={`menu ${isActive("/sales-history")}`}>
          <span className="material-symbols-outlined">history</span>
          Riwayat
        </Link>

        {isAdmin && (
          <Link href="/members" className={`menu ${isActive("/members")}`}>
            <span className="material-symbols-outlined">badge</span>
            Member
          </Link>
        )}

        {isAdmin && (
          <Link href="/reports" className={`menu ${isActive("/reports")}`}>
            <span className="material-symbols-outlined">insert_chart</span>
            Laporan
          </Link>
        )}

        {isAdmin && (
          <Link href="/employees" className={`menu ${isActive("/employees")}`}>
            <span className="material-symbols-outlined">group</span>
            Karyawan
          </Link>
        )}
      </div>

      <div className="menus bottom">
        {isAdmin && (
          <Link href="/settings" className={`menu ${isActive("/settings")}`}>
            <span className="material-symbols-outlined">settings</span>
            Pengaturan
          </Link>
        )}
        <button
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }}
          className="menu text-danger"
          style={{
            width: '100%',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'inherit',
            fontFamily: 'inherit'
          }}
        >
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </button>
      </div>

    </div>
  );
}