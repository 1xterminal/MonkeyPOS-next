import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { CartItem, Product } from "@/types";
import { TAX_RATE, MEMBER_DISCOUNT_RATE } from "@/lib/constants";

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedOrder = localStorage.getItem("currentOrder");
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                setCart(parsedOrder.items || []);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        // We only save if there are items, or if we explicitly want to clear it.
        // However, for the POS flow, we usually want to sync.
        // But be careful not to overwrite with empty array on initial load before mount.
        // The mount effect handles loading.

        // To avoid complexity with "initial load vs empty update", we can just save whenever cart changes
        // BUT we need to be careful about the initial empty state overwriting localStorage if not careful.
        // Since we load in useEffect, the initial render has empty cart.
        // We should probably only save if we have interacted or if we loaded.

        // Simpler approach: Just save to a specific key for persistence.
        // But the existing app uses "currentOrder" which has more structure.
        // Let's stick to the existing structure for compatibility.

        if (cart.length > 0) {
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const tax = subtotal * TAX_RATE;
            const total = subtotal + tax;

            const orderData = {
                items: cart,
                subtotal,
                tax,
                total
            };
            localStorage.setItem("currentOrder", JSON.stringify(orderData));
        } else {
            // If cart is empty, should we clear localStorage?
            // Maybe not immediately to avoid accidental clears, but usually yes.
            // Let's leave it for now or clear it if explicitly requested.
        }
    }, [cart]);

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.error(`Stok ${product.name} habis!`);
            return;
        }

        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
                toast.success(`+1 ${product.name}`, { duration: 1000 });
            } else {
                toast.error(`Stok ${product.name} tidak mencukupi!`);
            }
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
            toast.success(`${product.name} masuk keranjang`);
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

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("currentOrder");
    };

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * TAX_RATE;

    // Note: Discount depends on member, which is not in cart state usually.
    // We will calculate total without discount here, and let the page handle discount.
    const total = subtotal + tax;

    return {
        cart,
        setCart, // Exposed for edge cases like loading from specific source
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        tax,
        total
    };
}
