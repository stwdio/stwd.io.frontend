export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code']

export const PRICE_TIERS = {
  1: { symbol: '$', label: 'Budget', description: 'Up to $800/day' },
  2: { symbol: '$$', label: 'Mid-range', description: '$800-$2000/day' },
  3: { symbol: '$$$', label: 'Premium', description: 'Over $2000/day' },
} as const

export type PriceTier = keyof typeof PRICE_TIERS

export function getCurrencySymbol(code: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === code)
  return currency?.symbol || '$'
}

export function formatPrice(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency)
  
  // Special formatting for JPY and CNY (no decimals)
  if (currency === 'JPY' || currency === 'CNY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }
  
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function getPriceTierSymbol(tier: number): string {
  return PRICE_TIERS[tier as PriceTier]?.symbol || '$$'
}

export function getPriceTierLabel(tier: number): string {
  return PRICE_TIERS[tier as PriceTier]?.label || 'Mid-range'
}