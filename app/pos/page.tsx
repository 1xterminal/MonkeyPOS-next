"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatRupiah } from "@/lib/formatters";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/pos/ProductCard";
import CartItemRow from "@/components/pos/CartItemRow";

export default function POSTerminal() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [discount, setDiscount] = useState(0);

  // Use Custom Hook
  const { cart, addToCart, updateQuantity, removeFromCart, subtotal, tax, total } = useCart();

  // --- FETCH DATA API ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Gagal mengambil data produk");

        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);

        const uniqueCategories = Array.from(new Set(data.map((p: any) => p.category?.name || "Lainnya"))) as string[];
        setCategories(["Semua", ...uniqueCategories]);

      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Gagal memuat produk dari database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- KEYBOARD SHORTCUT LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        toast("Mode Pencarian", { icon: '🔍', duration: 1000 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Logic Search & Filter ---
  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((p: any) => (p.category?.name || "Lainnya") === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // --- 5. Cart Logic ---
  const addToCart = (product: Product) => {
    // Cek stok awal dulu
    if (product.stock <= 0) {
      toast.error(`Stok ${product.name} habis!`); // Toast Error
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
        // Optional: Toast kecil feedback
        toast.success(`+1 ${product.name}`, { duration: 1000, position: "bottom-center" });
      } else {
        toast.error(`Stok ${product.name} tidak mencukupi!`); // Toast Error
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`${product.name} masuk keranjang`); // Toast Success
    }
  };

  const updateQuantity = (id: string, type: "plus" | "minus") => {
    const existingItem = cart.find((item) => item.id === id);
    if (!existingItem) return;

    if (type === "plus") {
      if (existingItem.quantity < existingItem.stock) {
        setCart(cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)));
      } else {
        toast.error("Stok maksimal tercapai!");
      }
    } else {
      if (existingItem.quantity > 1) {
        setCart(cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item)));
      } else {
        removeFromCart(id);
        toast("Item dihapus dari keranjang", { icon: '🗑️' });
      }
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.11;
    const total = Math.max(0, subtotal + tax - discount); // Ensure total is not negative

    const orderData = {
      items: cart,
      subtotal,
      tax,
      discount,
      total,
    };
    localStorage.setItem("currentOrder", JSON.stringify(orderData));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.11;
  const total = Math.max(0, subtotal + tax - discount);

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        {/* === BAGIAN KIRI: PRODUK === */}
        <div className="col-md-8 p-3">
          <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
            {/* Header & Search */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3" style={{ borderBottom: "3px solid #EFCE9E", paddingBottom: "8px" }}>
                <h1 className="fw-bold mb-0" style={{ fontSize: "2.2rem" }}>Pilih Produk</h1>
                <Link href="/dashboard" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                  Dashboard
                </Link>
              </div>
              <div className="d-flex gap-3">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control input-monkey py-2"
                  placeholder="Cari produk... (Tekan '/')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Tabs */}
              <div className="d-flex gap-2 mt-3 overflow-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`btn rounded-pill px-4 fw-bold ${selectedCategory === cat ? "btn-warning text-dark" : "btn-light text-muted border"}`}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid Area */}
            {isLoading ? (
              <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Memuat produk dari database...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center" style={{ color: "#aaa" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "80px", marginBottom: "16px" }}>sentiment_dissatisfied</span>
                <p className="fs-4 fw-bold mb-1" style={{ color: "#888" }}>Produk Tidak Ditemukan</p>
                <span>Coba cari kata kunci lain atau ganti kategori.</span>
              </div>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 overflow-auto flex-grow-1" style={{ minHeight: "0", alignContent: "flex-start" }}>
                {filteredProducts.map((product) => {
                  // Logic Visual Low Stock
                  const isLowStock = product.stock <= 5 && product.stock > 0;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div key={product.id} className="col">
                      <div
                        className={`card card-monkey h-100 p-3 text-center cursor-pointer position-relative ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        onClick={() => addToCart(product)}
                        style={{ cursor: isOutOfStock ? "not-allowed" : "pointer", border: isLowStock ? "2px solid #ff4d4d" : "" }}
                      >

                        {/* Badge Low Stock / Out of Stock */}
                        {isLowStock && (
                          <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger m-2">
                            Sisa {product.stock}!
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="position-absolute top-50 start-50 translate-middle badge bg-dark fs-6 px-3 py-2">
                            HABIS
                          </span>
                        )}

                        <div style={{ height: "110px", width: "100%", overflow: "hidden", borderRadius: "8px", backgroundColor: "#f0f0f0" }}>
                          <img
                            src={product.image || "https://placehold.co/150x110?text=No+Img"}
                            alt={product.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => (e.currentTarget.src = "https://placehold.co/150x110?text=Error")}
                          />
                        </div>
                        <div className="mt-3 fw-bold text-truncate" style={{ fontSize: "0.95rem" }}>{product.name}</div>
                        <div className="mt-1 small text-primary fw-bold" style={{ color: "var(--color-text-highlight)" }}>
                          {formatRupiah(product.price)}
                        </div>
                        <div className={`mt-1 small ${isLowStock ? 'text-danger fw-bold' : 'text-muted'}`} style={{ fontSize: "0.8rem" }}>
                          Stok: {product.stock}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer Cart */}
            <div className="mt-auto pt-3 border-top border-2" style={{ borderColor: "#EFCE9E" }}>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Pajak (11%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>

              {/* Discount Input */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Diskon (Rp)</span>
                <input
                  type="number"
                  className="form-control form-control-sm text-end"
                  style={{ width: "100px" }}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="d-flex justify-content-between mb-3 fw-bold fs-5" style={{ marginTop: "12px", color: "var(--color-text-highlight)" }}>
                <span>Total Keseluruhan</span>
                <span>{formatRupiah(total)}</span>
              </div>

              <Link
                href={cart.length === 0 ? "#" : "/pos/payment"}
                className={`btn btn-monkey w-100 py-3 fs-5 ${cart.length === 0 ? "disabled" : ""}`}
                onClick={(e) => {
                  if (cart.length === 0) {
                    e.preventDefault();
                    toast.error("Keranjang kosong!");
                  } else {
                    handleCheckout();
                  }
                }}
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