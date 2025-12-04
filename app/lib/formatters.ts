// Formatting utilities for currency and dates

/**
 * Format a number as Indonesian Rupiah currency
 * @param value - The number to format
 * @returns Formatted currency string (e.g., "Rp 50.000")
 */
export function formatRupiah(value: number | string | undefined | null): string {
    const n = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(n);
}

/**
 * Safely parse a date from various formats
 * @param date - Date string or Date object
 * @returns Date object or null if invalid
 */
export function parseDate(date: string | Date | undefined | null): Date | null {
    if (!date) return null;

    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date/time for display in Indonesian locale
 * @param date - Date string or Date object
 * @returns Formatted date/time string or the original string if invalid
 */
export function formatDateTime(date: string | Date | undefined | null): string {
    const d = parseDate(date);
    if (!d) return typeof date === 'string' ? date : '-';

    return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format a date for display in Indonesian locale (date only)
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | undefined | null): string {
    const d = parseDate(date);
    if (!d) return typeof date === 'string' ? date : '-';

    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format time for display in Indonesian locale (time only)
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export function formatTime(date: string | Date | undefined | null): string {
    const d = parseDate(date);
    if (!d) return '-';

    return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}
