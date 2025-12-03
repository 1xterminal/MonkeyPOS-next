"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentPage() {
    const router = useRouter();

    // State Data
    const [cart, setCart] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    // State Input
    const [selectedMember, setSelectedMember] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [amountReceived, setAmountReceived] = useState<number | "">("");
    const [isLoading, setIsLoading] = useState(false);

    // State Kalkulasi
    const [subtotal, setSubtotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [total, setTotal] = useState(0);
    const [change, setChange] = useState(0);

    // 1. Load Data Cart & Members saat halaman dibuka
    useEffect(() => {
        // Load Order dari LocalStorage
        const savedOrder = localStorage.getItem("currentOrder");
        if (savedOrder) {
            const parsedOrder = JSON.parse(savedOrder);
            setCart(parsedOrder.items);
        } else {
            router.push("/pos"); // Balik ke terminal kalau kosong
        }

        // Load Members dari API Database
        fetch("/api/members")
            .then((res) => res.json())
            .then((data) => setMembers(data))
            .catch((err) => console.error("Gagal load member", err));
    }, [router]);

    // 2. Kalkulasi Total (Setiap kali cart/member berubah)
    useEffect(() => {
        const newSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newTax = newSubtotal * 0.11;

        // Logic Diskon 5% jika member dipilih
        let newDiscount = 0;
        if (selectedMember) {
            newDiscount = newSubtotal * 0.05;
        }

        const newTotal = newSubtotal + newTax - newDiscount;

        setSubtotal(newSubtotal);
        setTax(newTax);
        setDiscount(newDiscount);
        setTotal(newTotal);
    }, [cart, selectedMember]);

    // 3. Kalkulasi Kembalian
    useEffect(() => {
        if (paymentMethod === "CASH" && typeof amountReceived === "number") {
            setChange(amountReceived - total);
        } else {
            setChange(0);
        }
    }, [amountReceived, total, paymentMethod]);

    // Helper Rupiah
    const formatRupiah = (num: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
    };

    // Logic Tombol Quantity (+/-) di halaman payment
    const updateQuantity = (id: string, type: "plus" | "minus") => {
        const updatedCart = cart.map(item => {
            if (item.id === id) {
                if (type === "plus") {
                    // Harusnya cek stok lagi di sini idealnya, tapi utk simpel kita assume frontend validation cukup dulu
                    return { ...item, quantity: item.quantity + 1 };
                } else {
                    return { ...item, quantity: item.quantity - 1 };
                }
            }
            return item;
        }).filter(item => item.quantity > 0); // Hapus jika 0

        if (updatedCart.length === 0) {
            router.push("/pos");
        } else {
            setCart(updatedCart);
            // Update localStorage biar sinkron
            localStorage.setItem("currentOrder", JSON.stringify({ items: updatedCart }));
        }
    };

    // 4. Handle Selesaikan Penjualan
    const handleCompleteSale = async () => {
        const transactionData = {
            total,
            subtotal,
            tax,
            discount,
            paymentMethod,
            amountReceived: paymentMethod === "CASH" ? Number(amountReceived) : total,
            change: paymentMethod === "CASH" ? change : 0,
            items: cart,
            memberId: selectedMember || null,
            userId: "user_id_placeholder", // Nanti diganti dengan Auth user asli
        };

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionData),
            });

            if (response.ok) {
                const result = await response.json();
                // Hapus cart lokal
                localStorage.removeItem("currentOrder");
                // Redirect ke Receipt (Nanti kita buat)
                alert("Transaksi Berhasil! (Nanti redirect ke Receipt)");
                // router.push(`/receipt/${result.id}`); 
                router.push("/pos"); // Sementara balik ke POS dulu
            } else {
                alert("Gagal menyimpan transaksi");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan sistem");
        }
    };

    // Validasi Tombol Bayar
    // Validasi Tombol Bayar
    const isPayDisabled = (paymentMethod === "CASH" && (typeof amountReceived !== "number" || amountReceived < total)) || isLoading;

    return (
        <div className="container-fluid h-100">
            {/* Background Gradient Wrapper (Sama seperti Terminal CSS lama) */}
            <div className="row h-100 p-4" style={{ background: "linear-gradient(180deg, #FFFBE7, #FDF0CB)", borderRadius: "12px" }}>

                {/* === KIRI: RINCIAN PESANAN === */}
                <div className="col-md-7 h-100 d-flex flex-column">
                    <div className="card-monkey p-4 h-100 d-flex flex-column shadow-sm">
                        <h3 className="fw-bold pb-3 mb-3 border-bottom border-warning">Rincian Pesanan</h3>

                        <div className="flex-grow-1 overflow-auto">
                            {cart.map((item) => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center py-3 border-bottom">
                                    <div>
                                        <div className="fw-bold">{item.name}</div>
                                        <div className="small text-muted">{formatRupiah(item.price)}</div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, "minus")}>-</button>
                                        <span className="fw-bold" style={{ width: "30px", textAlign: "center" }}>{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateQuantity(item.id, "plus")}>+</button>
                                        <div className="fw-bold text-end" style={{ width: "100px" }}>
                                            {formatRupiah(item.price * item.quantity)}
                                        </div>
                                        {/* Tombol Hapus */}
                                        <button className="remove-btn" onClick={() => {
                                            const newCart = cart.filter(c => c.id !== item.id);
                                            if (newCart.length === 0) router.push("/pos");
                                            setCart(newCart);
                                        }}>×</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TOTALAN */}
                        <div className="mt-auto pt-3 border-top">
                            <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                            <div className="d-flex justify-content-between mb-2"><span>Pajak (11%)</span><span>{formatRupiah(tax)}</span></div>

                            {/* Baris Diskon (Muncul hanya jika member dipilih) */}
                            {selectedMember && (
                                <div className="d-flex justify-content-between mb-2 text-success fw-bold">
                                    <span>Diskon Member (5%)</span>
                                    <span>- {formatRupiah(discount)}</span>
                                </div>
                            )}

                            <div className="d-flex justify-content-between mt-3 pt-2 border-top fs-4 fw-bold text-monkey-dark">
                                <span>Grand Total</span>
                                <span>{formatRupiah(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === KANAN: PEMBAYARAN === */}
                <div className="col-md-5 h-100">
                    <div className="card-monkey p-4 h-100 d-flex flex-column shadow-sm">

                        {/* 1. Pilih Member */}
                        <div className="mb-4">
                            <h3 className="fw-bold pb-2 mb-3 border-bottom border-warning" style={{ fontSize: "1.5rem" }}>Member</h3>
                            <select
                                className="form-select input-monkey py-2"
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                            >
                                <option value="">-- Bukan Member --</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name} - {m.phone}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Metode Pembayaran */}
                        <div className="mb-4">
                            <h3 className="fw-bold pb-2 mb-3 border-bottom border-warning" style={{ fontSize: "1.5rem" }}>Metode Pembayaran</h3>
                            <div className="d-flex flex-column gap-2">
                                {["CASH", "CARD", "E_WALLET"].map((method) => (
                                    <label key={method} className={`btn btn-outline-warning text-dark text-start fw-bold ${paymentMethod === method ? "active bg-warning" : "bg-white"}`} style={{ border: "2px solid #EFCE9E" }}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method}
                                            className="d-none"
                                            checked={paymentMethod === method}
                                            onChange={() => setPaymentMethod(method)}
                                        />
                                        {method === "CASH" ? "Tunai" : method === "CARD" ? "Kartu Kredit/Debit" : "E-Wallet (QRIS)"}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 3. Input Uang (Khusus Cash) */}
                        {paymentMethod === "CASH" && (
                            <div className="mb-4 bg-light p-3 rounded border">
                                <label className="fw-bold mb-2">Uang Diterima</label>
                                <input
                                    type="number"
                                    className="form-control input-monkey fs-5"
                                    placeholder="Rp 0"
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value ? parseFloat(e.target.value) : "")}
                                />
                                <div className="d-flex justify-content-between mt-3 align-items-center">
                                    <span>{change < 0 ? "Kurang" : "Kembalian"}</span>
                                    <span className={`fs-4 fw-bold ${change < 0 ? "text-danger" : "text-success"}`}>
                                        {change < 0 ? formatRupiah(Math.abs(change)) : formatRupiah(change)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="mt-auto d-flex gap-2">
                            <Link href="/pos" className="btn btn-secondary w-50 py-3 fw-bold">Batal</Link>
                            <button
                                className="btn btn-monkey w-100 py-3 fw-bold"
                                disabled={isPayDisabled}
                                onClick={handleCompleteSale}
                            >
                                Selesaikan Penjualan
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}