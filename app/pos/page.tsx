"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatRupiah } from "@/lib/formatters";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import ProductCard from "@/components/pos/ProductCard";
import CartItemRow from "@/components/pos/CartItemRow";
import { Button } from "@/app/components/ui/Button";
import Header from "../components/ui/Header";
import { useRouter } from "next/navigation";

export default function POSTerminal() {
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref untuk shortcut keyboard

  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [discount, setDiscount] = useState(0);

  // --- 2. FETCH DATA API ---
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
        toast.error("Gagal memuat produk dari database."); // Ganti alert
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- KEYBOARD SHORTCUT LISTENER (Fitur Baru!) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Jika tekan tombol '/' dan tidak sedang mengetik di input
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault(); // Mencegah karakter '/' tertulis di input
        searchInputRef.current?.focus();
        toast("Mode Pencarian", { icon: '🔍', duration: 1000 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- 3. Logic Search & Filter ---
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
  /* const addToCart = (product: Product) => {
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
        toast.success(`+1 ${product.name}`, { duration: 1000 });
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
  }; */

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

  // const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // const tax = subtotal * 0.11;
  // const total = Math.max(0, subtotal + tax - discount);

  return (
    <div className="container-fluid vh-100 overflow-hidden">
      <div className="row h-100">

        {/* === BAGIAN KIRI: PRODUK === */}
        <div className="p-5 d-flex flex-column products">
          {/* <div className="p-4 d-flex flex-column"> */}
            {/* Header & Search */}
            <div className="mb-4 d-flex flex-column gap-4">
              <Button variant="flat" onClick={() => router.back()} className="align-self-start">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </Button>
              <Header title="Pilih Produk"/>
              {/* <h1 className="fw-bold mb-3" style={{ fontSize: "2.2rem", borderBottom: "3px solid #EFCE9E", paddingBottom: "8px" }}>Pilih Produk</h1> */}
              <div className="d-flex gap-3">
                <input
                  ref={searchInputRef} // Attach Ref
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
          {/* </div> */}
        </div>

        {/* === BAGIAN KANAN: KERANJANG (Sama Persis) === */}
        <div className="p-5 d-flex flex-column side">
          {/* <div className="p-4 d-flex flex-column"> */}
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
          {/* </div> */}
        </div>

      {/* </div> */}
    </div>
  );
}