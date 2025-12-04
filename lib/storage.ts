// Client-side localStorage utility
// Only works in browser environment

/**
 * Get data from localStorage
 * @param key - The localStorage key
 * @param fallback - Default value if key doesn't exist
 * @returns Parsed data or fallback value
 */
export function getLocal<T>(key: string, fallback: T): T {
    // Check if running in browser
    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.warn(`Failed to read from localStorage key: ${key}`, error);
        return fallback;
    }
}

/**
 * Save data to localStorage
 * @param key - The localStorage key
 * @param value - The data to save
 */
export function setLocal<T>(key: string, value: T): void {
    // Check if running in browser
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to write to localStorage key: ${key}`, error);
    }
}

/**
 * Remove an item from localStorage
 * @param key - The localStorage key to remove
 */
export function removeLocal(key: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Failed to remove from localStorage key: ${key}`, error);
    }
}

/**
 * Clear all localStorage
 */
export function clearLocal(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.clear();
    } catch (error) {
        console.error('Failed to clear localStorage', error);
    }
}

/**
 * Get data from sessionStorage
 * @param key - The sessionStorage key
 * @param fallback - Default value if key doesn't exist
 * @returns Parsed data or fallback value
 */
export function getSession<T>(key: string, fallback?: T): T | undefined {
    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.warn(`Failed to read from sessionStorage key: ${key}`, error);
        return fallback;
    }
}

/**
 * Save data to sessionStorage
 * @param key - The sessionStorage key
 * @param value - The data to save
 */
export function setSession<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to write to sessionStorage key: ${key}`, error);
    }
}
