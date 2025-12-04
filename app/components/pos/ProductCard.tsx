import { formatRupiah } from "@/lib/formatters";
import { Product } from "@/types";

interface ProductCardProps {
    product: Product;
    onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
    const isLowStock = product.stock <= 5 && product.stock > 0;
    const isOutOfStock = product.stock === 0;

    return (
        <div className="col">
            <div
                className={`card card-monkey h-100 p-3 text-center cursor-pointer position-relative ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                onClick={() => onClick(product)}
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

                <div style={{ height: "110px", width: "100%", overflow: "hidden", borderRadius: "12px", backgroundColor: "#f0f0f0" }}>
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
}
