/**
 * Formatting utilities for currency, phone, and document inputs
 */

/**
 * Formats a number as Brazilian currency (R$ 1.234,56)
 * @param value - The numeric value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

/**
 * Formats user input as currency while typing
 * Handles keystrokes and returns formatted string
 * @param input - Raw input string (may contain non-numeric chars)
 * @returns Formatted currency string for display
 */
export const formatCurrencyInput = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');

    if (!numbers) return '';

    // Convert to number (treating as cents)
    const value = parseInt(numbers) / 100;

    return formatCurrency(value);
};

/**
 * Parses a formatted currency string back to a number
 * @param formattedValue - Currency string like "R$ 1.234,56"
 * @returns Numeric value
 */
export const parseCurrencyInput = (formattedValue: string): number => {
    // Remove currency symbol, dots, and replace comma with dot
    const cleaned = formattedValue
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim();

    return parseFloat(cleaned) || 0;
};

/**
 * Formats a phone number as (48) 99999-9999 or (48) 9999-9999
 * @param input - Raw phone number input
 * @returns Formatted phone string
 */
export const formatPhoneInput = (input: string): string => {
    const numbers = input.replace(/\D/g, '');

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

/**
 * Formats CPF (123.456.789-01) or CNPJ (12.345.678/0001-90)
 * @param input - Raw document number
 * @returns Formatted document string
 */
export const formatDocumentInput = (input: string): string => {
    const numbers = input.replace(/\D/g, '');

    // CPF: 11 digits
    if (numbers.length <= 11) {
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }

    // CNPJ: 14 digits
    if (numbers.length <= 14) {
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
        if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
        if (numbers.length <= 12) {
            return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
        }
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }

    return numbers.slice(0, 14);
};

/**
 * Removes all formatting from a document string
 * @param formatted - Formatted document string
 * @returns Raw numbers only
 */
export const unformatDocument = (formatted: string): string => {
    return formatted.replace(/\D/g, '');
};
