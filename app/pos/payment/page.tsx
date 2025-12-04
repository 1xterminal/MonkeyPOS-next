"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatRupiah } from "@/lib/formatters";

// Constants
const MEMBER_DISCOUNT_RATE = 0.05;

// Types
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
}

interface OrderData {
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}

export default function PaymentPage() {
    const router = useRouter();

    // State Data
    const [members, setMembers] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [baseSubtotal, setBaseSubtotal] = useState(0);
    const [baseTax, setBaseTax] = useState(0);
    const [baseTotal, setBaseTotal] = useState(0);

    // State Input
    const [selectedMember, setSelectedMember] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [amountReceived, setAmountReceived] = useState<number | "">("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal State

    // State Kalkulasi
    const [discount, setDiscount] = useState(0);
    const [total, setTotal] = useState(0);
    const [change, setChange] = useState(0);

    const [invoiceId, setInvoiceId] = useState("");

    // 1. Load Data Members & User & Order saat halaman dibuka
    useEffect(() => {
        // Load Order from LocalStorage
        const savedOrder = localStorage.getItem("currentOrder");
        if (!savedOrder) {
            router.push("/pos");
            return;
        }

        try {
            const parsedOrder: OrderData = JSON.parse(savedOrder);
            setCart(parsedOrder.items);
            setBaseSubtotal(parsedOrder.subtotal);
            setBaseTax(parsedOrder.tax);
            setBaseTotal(parsedOrder.total);
            setDiscount(parsedOrder.discount); // Initial discount from POS page
        } catch (e) {
            console.error("Failed to parse order", e);
            router.push("/pos");
            return;
        }

        // Load Members dari API Database
        fetch("/api/members")
            .then((res) => res.json())
            .then((data) => setMembers(data))
            .catch((err) => console.error("Gagal load member", err));

        // Load Current User (Kasir) dari API
        fetch("/api/user/current")
            .then((res) => res.json())
            .then((data) => {
                if (data.id) {
                    setCurrentUser(data);
                } else {
                    console.error("User tidak ditemukan, jalankan: npx prisma db seed");
                    alert("Error: User kasir tidak ditemukan. Silakan seed database terlebih dahulu.");
                }
            })
            .catch((err) => console.error("Gagal load user", err));
    }, [router]);

    // 2. Kalkulasi Total (Setiap kali member berubah)
    useEffect(() => {
        // Logic Diskon 5% jika member dipilih
        let memberDiscount = 0;
        if (selectedMember) {
            memberDiscount = baseSubtotal * MEMBER_DISCOUNT_RATE;
        }

        // Total calculation: Base Total (from POS) - Member Discount
        // Note: Base Total already includes tax and manual discount from POS
        const newTotal = Math.max(0, baseTotal - memberDiscount);

        setDiscount(memberDiscount); // Update displayed discount to show member discount
        setTotal(newTotal);
    }, [selectedMember, baseSubtotal, baseTotal]);

    // 3. Kalkulasi Kembalian
    useEffect(() => {
        if (paymentMethod === "CASH" && typeof amountReceived === "number") {
            setChange(amountReceived - total);
        } else {
            setChange(0);
        }
    }, [amountReceived, total, paymentMethod]);

    // 4. Handle Selesaikan Penjualan
    const handleCompleteSale = async () => {
        const transactionData = {
            total,
            subtotal: baseSubtotal,
            tax: baseTax,
            discount: discount, // This might need adjustment if we want to track manual vs member discount separately
            paymentMethod,
            amountReceived: paymentMethod === "CASH" ? Number(amountReceived) : total,
            change: paymentMethod === "CASH" ? change : 0,
            items: cart,
            memberId: selectedMember || null,
            userId: currentUser?.id || "",
        };

        // Validate user exists
        if (!currentUser?.id) {
            alert("Error: User kasir tidak ditemukan. Silakan refresh halaman atau seed database.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transactionData),
            });

            if (response.ok) {
                setShowSuccessModal(true);
                localStorage.removeItem("currentOrder"); // Clear order

                const data = await response.json();
                setInvoiceId(data.invoiceId);
            } else {
                const errorData = await response.json();
                toast.error(`Gagal: ${errorData.error}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem saat memproses transaksi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintReceipt = () => {
        if (invoiceId) {
            router.push(`/receipt/${invoiceId}`);
        }
    }

    // Validasi Tombol Bayar
    const isPayDisabled = (paymentMethod === "CASH" && (typeof amountReceived !== "number" || amountReceived < total)) || isLoading;

    return (
        <div className="container-fluid vh-100 position-relative">
            {/* Background Gradient Wrapper */}
            <div className="row h-100 p-4" style={{ background: "linear-gradient(180deg, #FFFBE7, #FDF0CB)", borderRadius: "12px" }}>

                {/* === KIRI: RINCIAN PESANAN === */}
                <div className="col-md-7 h-100 d-flex flex-column">
                    <div className="card-monkey p-4 h-100 d-flex flex-column shadow-sm">
                        <h3 className="fw-bold pb-3 mb-3 border-bottom border-warning">Rincian Pesanan</h3>

                        <div className="flex-grow-1 overflow-auto">
                            {cart.map((item) => (
                                <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                    <div>
                                        <div className="fw-bold">{item.name}</div>
                                        <div className="text-muted small">{item.quantity} x {formatRupiah(item.price)}</div>
                                    </div>
                                    <div className="fw-bold">{formatRupiah(item.price * item.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        {/* TOTALAN */}
                        <div className="mt-auto pt-3 border-top">
                            <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>{formatRupiah(baseSubtotal)}</span></div>
                            <div className="d-flex justify-content-between mb-2"><span>Pajak (11%)</span><span>{formatRupiah(baseTax)}</span></div>
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
                                    <label key={method} className={`btn btn-outline-warning text-dark text-start fw-bold rounded-4 ${paymentMethod === method ? "active bg-warning" : "bg-white"}`} style={{ border: "2px solid #EFCE9E" }}>
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
                                            borderRadius: "16px"
                                        }}
                                    >
                                        Uang Pas
                                    </button>
                                    <button
                                        className="btn flex-grow-1 fw-bold"
                                        onClick={() => setAmountReceived((prev) => (Number(prev) || 0) + 20000)}
                                        style={{
                                            border: "2px solid #EFCE9E",
                                            color: "#856404",
                                            background: "white",
                                            borderRadius: "16px"
                                        }}
                                    >
                                        +20k
                                    </button>
                                    <button
                                        className="btn flex-grow-1 fw-bold"
                                        onClick={() => setAmountReceived((prev) => (Number(prev) || 0) + 50000)}
                                        style={{
                                            border: "2px solid #EFCE9E",
                                            color: "#856404",
                                            background: "white",
                                            borderRadius: "16px"
                                        }}
                                    >
                                        +50k
                                    </button>
                                    <button
                                        className="btn flex-grow-1 fw-bold"
                                        onClick={() => setAmountReceived((prev) => (Number(prev) || 0) + 100000)}
                                        style={{
                                            border: "2px solid #EFCE9E",
                                            color: "#856404",
                                            background: "white",
                                            borderRadius: "16px"
                                        }}
                                    >
                                        +100k
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
                            <button className="btn btn-outline-dark py-2 fw-bold" onClick={() => handlePrintReceipt()}>
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