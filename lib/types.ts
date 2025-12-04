// Type definitions for MonkeyPOS transactions
// These interfaces handle the flexible property names from the original implementation

export interface TransactionItem {
    // Product name variants
    name?: string;
    product?: string;
    title?: string;
    nama?: string;

    // ID variants
    sku?: string;
    id?: string;

    // Quantity variants
    quantity?: number;
    qty?: number;
    q?: number;

    // Price variants
    price?: number;
    harga?: number;
    unitPrice?: number;

    // Subtotal
    subtotal?: number;
}

export interface Transaction {
    // Transaction ID variants
    id?: string;
    transactionId?: string;
    invoiceId?: string;
    code?: string;
    transactionID?: string;
    transaction_id?: string;
    invoice_id?: string;

    // Date/time variants
    date?: string;
    datetime?: string;
    createdAt?: string;
    time?: string;

    // Items array variants
    items?: TransactionItem[];
    cart?: TransactionItem[];
    products?: TransactionItem[];
    details?: TransactionItem[];
    lineItems?: TransactionItem[];

    // Financial data
    total?: number;
    amountPaid?: number;
    subtotal?: number;
    subTotal?: number;
    amount?: number;
    tax?: number;
    pajak?: number;
    taxRate?: number;

    // Discount variants
    discount?: number | string;
    discountAmount?: number;
    discountRate?: number;
    discountPercent?: number;
    discountLabel?: string;

    // Payment info
    paymentMethod?: string;
    payment?: string;
    method?: string;

    // Cash payment details
    amountReceived?: number;
    change?: number;

    // People
    cashier?: string;
    kasir?: string;
    user?: string;
    member?: string;
    memberName?: string;
    customer?: string;
}
