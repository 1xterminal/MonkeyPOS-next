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
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal State

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

        setIsLoading(true);

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionData),
            });

            if (response.ok) {
                // Sukses -> Tampilkan Modal
                setShowSuccessModal(true);
                localStorage.removeItem("currentOrder");
            } else {
                const errorData = await response.json();
                alert(`Gagal menyimpan transaksi: ${errorData.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan sistem saat memproses transaksi.");
        } finally {
            setIsLoading(false);
        }
    };

    // Validasi Tombol Bayar
    const isPayDisabled = (paymentMethod === "CASH" && (typeof amountReceived !== "number" || amountReceived < total)) || isLoading;

    return (
        <div className="container-fluid h-100 position-relative">
            {/* Background Gradient Wrapper */}
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
                                    className="form-control input-monkey fs-5 mb-2"
                                    placeholder="Rp 0"
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value ? parseFloat(e.target.value) : "")}
                                />
                                {/* Quick Cash Buttons */}
                                <div className="d-flex gap-2 mb-3 justify-content-between">
                                    <button
                                        className="btn flex-grow-1 fw-bold"
                                        onClick={() => setAmountReceived(total)}
                                        style={{
                                            border: "2px solid #EFCE9E",
                                            color: "#856404",
                                            background: amountReceived === total ? "#FFFBE7" : "white",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        Uang Pas
                                    </button>
                                    <button
                                        className="btn flex-grow-1 fw-bold"
                                        onClick={() => setAmountReceived(20000)}
                                        style={{
                                            border: "2px solid #EFCE9E",
                                            color: "#856404",
                                            background: amountReceived === 20000 ? "#FFFBE7" : "white",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        20k
                                    </button>
                                    <button
                                        className="btn flex-grow-1 fw-bold"
                                        onClick={() => setAmountReceived(50000)}
                                        style={{
                                            border: "2px solid #EFCE9E",
                                            color: "#856404",
                                            background: amountReceived === 50000 ? "#FFFBE7" : "white",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        50k
                                    </button>
                                    <button
                                        className="btn flex-grow-1 fw-bold"
                                        onClick={() => setAmountReceived(100000)}
                                        style={{
                                            border: "2px solid #EFCE9E",
                                            color: "#856404",
                                            background: amountReceived === 100000 ? "#FFFBE7" : "white",
                                            borderRadius: "10px"
                                        }}
                                    >
                                        100k
                                    </button>
                                </div>

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
                                {isLoading ? "Memproses..." : "Selesaikan Penjualan"}
                            </button>
                        </div>

                    </div>
                </div>

            </div>

            {/* === SUCCESS MODAL === */}
            {showSuccessModal && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="bg-white p-5 rounded-4 shadow-lg text-center" style={{ maxWidth: "400px", width: "90%" }}>
                        <div className="mb-3 text-success">
                            <span className="material-symbols-outlined" style={{ fontSize: "80px" }}>check_circle</span>
                        </div>
                        <h2 className="fw-bold mb-2">Transaksi Berhasil!</h2>
                        <p className="text-muted mb-4">Pembayaran telah diterima.</p>

                        {paymentMethod === "CASH" && (
                            <div className="bg-light p-3 rounded mb-4">
                                <div className="small text-muted">Kembalian</div>
                                <div className="fs-2 fw-bold text-success">{formatRupiah(change)}</div>
                            </div>
                        )}

                        <div className="d-flex flex-column gap-2">
                            <button className="btn btn-outline-dark py-2 fw-bold" onClick={() => alert("Fitur Cetak Struk akan segera hadir!")}>
                                <span className="material-symbols-outlined align-middle me-2">print</span>
                                Cetak Struk
                            </button>
                            <button className="btn btn-monkey py-2 fw-bold" onClick={() => router.push("/pos")}>
                                Transaksi Baru
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}