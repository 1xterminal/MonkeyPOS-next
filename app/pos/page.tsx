"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// Jika kamu punya komponen UI khusus di components/ui, kita bisa import di sini nanti.
// Untuk sekarang kita pakai standard HTML/Bootstrap class dulu.

// Tipe Data
interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  image: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSTerminal() {
  // --- 1. Data Dummy (Sementara, nanti ganti fetch API) ---
  const products: Product[] = [
    { id: 1, name: "Kopi Hitam", sku: "KH001", price: 15000, image: "/img/products/kopi-hitam.png", stock: 20 },
    { id: 2, name: "Cappuccino", sku: "CP002", price: 25000, image: "/img/products/cappuccino.jpg", stock: 15 },
    { id: 3, name: "Espresso", sku: "ES003", price: 18000, image: "/img/products/kopi-hitam.png", stock: 10 },
    { id: 4, name: "Latte", sku: "LT004", price: 28000, image: "/img/products/cappuccino.jpg", stock: 5 },
    { id: 5, name: "Mocha", sku: "MC005", price: 30000, image: "/img/products/kopi-hitam.png", stock: 12 },
  ];

  // --- 2. State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // --- 3. Logic Search ---
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery]);

  // --- 4. Helper Format Rupiah ---
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // --- 5. Cart Logic ---
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        alert(`Stok untuk ${product.name} tidak mencukupi!`);
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      } else {
        alert(`Stok untuk ${product.name} habis!`);
      }
    }
  };

  const updateQuantity = (id: number, type: "plus" | "minus") => {
    const existingItem = cart.find((item) => item.id === id);
    if (!existingItem) return;

    if (type === "plus") {
      if (existingItem.quantity < existingItem.stock) {
        setCart(cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)));
      } else {
        alert(`Stok maksimal tercapai!`);
      }
    } else {
      if (existingItem.quantity > 1) {
        setCart(cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item)));
      } else {
        removeFromCart(id);
      }
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Simpan data ke localStorage saat mau bayar
  const handleCheckout = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.11;
    const total = subtotal + tax;

    const orderData = {
      items: cart,
      subtotal,
      tax,
      total,
    };
    localStorage.setItem("currentOrder", JSON.stringify(orderData));
  };

  // Perhitungan Total untuk Display
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        
        {/* === BAGIAN KIRI: PRODUK === */}
        <div className="col-md-8 p-3">
          <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
            {/* Header & Search */}
            <div className="mb-4">
              <h1 className="fw-bold mb-3" style={{ fontSize: "2.2rem", borderBottom: "3px solid #EFCE9E", paddingBottom: "8px" }}>Pilih Produk</h1>
              <input
                type="text"
                className="form-control input-monkey py-2"
                placeholder="Cari produk berdasarkan nama atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Product Grid */}
            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 overflow-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
              {filteredProducts.length === 0 ? (
                <div className="col-12 text-center mt-5" style={{ color: "#aaa" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "80px", marginBottom: "16px" }}>sentiment_dissatisfied</span>
                  <p className="fs-4 fw-bold mb-1" style={{ color: "#888" }}>Belum Ada Produk</p>
                  <span>Silakan ubah kata kunci pencarian.</span>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="col">
                    <div 
                      className="card card-monkey h-100 p-3 text-center cursor-pointer"
                      onClick={() => addToCart(product)}
                      style={{ cursor: "pointer" }}
                    >
                      <div style={{ height: "110px", width: "100%", overflow: "hidden", borderRadius: "8px", backgroundColor: "#f0f0f0" }}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/150x110?text=No+Img")}
                        />
                      </div>
                      <div className="mt-3 fw-bold" style={{ fontSize: "0.95rem" }}>{product.name}</div>
                      <div className="mt-1 small text-primary fw-bold" style={{ color: "var(--color-text-highlight)" }}>
                        {formatRupiah(product.price)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* === BAGIAN KANAN: KERANJANG === */}
        <div className="col-md-4 p-3">
          <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
            {/* Header Cart */}
            <div className="border-bottom border-2 pb-3 mb-3" style={{ borderColor: "#EFCE9E" }}>
              <h2 className="fw-bold mb-0" style={{ fontSize: "1.8rem" }}>Pesanan Saat Ini</h2>
            </div>

            {/* Cart Items */}
            <div className="flex-grow-1 overflow-auto pe-1">
              {cart.length === 0 ? (
                <div className="text-center mt-5" style={{ color: "#888" }}>
                  <p>Keranjang masih kosong.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {cart.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center pb-2 border-bottom" style={{ gap: "15px" }}>
                      <div className="flex-grow-1">
                        <div className="fw-bold">{item.name}</div>
                        <div className="small text-muted">{formatRupiah(item.price)}</div>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, "minus")}>-</button>
                        <span className="fw-bold text-center" style={{ minWidth: "30px" }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, "plus")}>+</button>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Cart: Summary & Button */}
            <div className="mt-auto pt-3 border-top border-2" style={{ borderColor: "#EFCE9E" }}>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Pajak (11%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 fw-bold fs-5" style={{ marginTop: "12px", color: "var(--color-text-highlight)" }}>
                <span>Total Keseluruhan</span>
                <span>{formatRupiah(total)}</span>
              </div>

              <Link 
                href={cart.length === 0 ? "#" : "/pos/payment"} 
                className={`btn btn-monkey w-100 py-3 fs-5 ${cart.length === 0 ? "disabled" : ""}`}
                onClick={cart.length === 0 ? (e) => e.preventDefault() : handleCheckout}
              >
                Lanjutkan ke Pembayaran
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}