// Central currency formatting utility
// All currency displays in the app must use these helpers

export const CURRENCY_SYMBOL = 'Rs';
export const CURRENCY_CODE = 'PKR';
export const CURRENCY_LOCALE = 'en-PK';

/**
 * Format a number as Pakistani Rupees
 * Examples:
 * formatPrice(1500)     → "Rs 1,500"
 * formatPrice(250.50)   → "Rs 250.50"
 * formatPrice(0)        → "Rs 0"
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs 0';
  }
  const num = parseFloat(amount);
  return `Rs ${num.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format with explicit decimal places
 * Example: formatPriceFixed(1500) → "Rs 1,500.00"
 */
export const formatPriceFixed = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs 0.00';
  }
  const num = parseFloat(amount);
  return `Rs ${num.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format compact large numbers
 * Example: formatPriceCompact(150000) → "Rs 1.5L"
 */
export const formatPriceCompact = (amount) => {
  if (!amount || isNaN(amount)) return 'Rs 0';
  const num = parseFloat(amount);
  if (num >= 100000) return `Rs ${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `Rs ${(num / 1000).toFixed(1)}K`;
  return `Rs ${num}`;
};
