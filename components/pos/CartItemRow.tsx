import { formatRupiah } from "@/lib/formatters";
import { CartItem } from "@/types";

interface CartItemRowProps {
    item: CartItem;
    onUpdateQuantity: (id: string, type: "plus" | "minus") => void;
    onRemove: (id: string) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
    return (
        <div className="d-flex justify-content-between align-items-center pb-2 border-bottom" style={{ gap: "15px" }}>
            <div className="flex-grow-1">
                <div className="fw-bold">{item.name}</div>
                <div className="small text-muted">{formatRupiah(item.price)}</div>
            </div>

            <div className="d-flex align-items-center gap-2">
                <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, "minus")}>-</button>
                <span className="fw-bold text-center" style={{ minWidth: "30px" }}>{item.quantity}</span>
                <button className="qty-btn" onClick={() => onUpdateQuantity(item.id, "plus")}>+</button>
                <button className="remove-btn" onClick={() => onRemove(item.id)}>×</button>
            </div>
        </div>
    );
}
