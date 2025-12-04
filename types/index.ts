export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    image: string | null;
    stock: number;
    category?: {
        name: string;
    };
}

export interface CartItem extends Product {
    quantity: number;
}
