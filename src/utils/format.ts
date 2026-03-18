/**
 * Parses a currency string in Brazilian format (e.g., "2.000,00" or "2.000") 
 * to a standard JavaScript number.
 * 
 * @param value The string value to parse
 * @returns The parsed number
 */
export const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  // Remove all dots (thousands separator)
  // Replace comma with dot (decimal separator)
  const sanitized = value
    .toString()
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats a number to Brazilian currency format (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formats a number to Brazilian decimal format
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
