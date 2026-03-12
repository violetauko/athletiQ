import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export function formatSalary(min: number, max: number): string {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`
}

export function timeAgo(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}
/**
 * Format a currency amount with proper locale and currency symbol
 * @param amount - The amount to format (in dollars/cents depending on input)
 * @param currency - The currency code (USD, KES, EUR, etc.)
 * @param fromCents - Whether the amount is in cents (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USD',
  fromCents: boolean = true
): string {
  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return `$0.00`
  }

  // Convert from cents if needed (e.g., 2500 cents -> 25.00)
  const convertedAmount = fromCents ? numAmount / 100 : numAmount

  // Currency symbols and formatting options
  const currencyConfig: Record<string, { symbol: string, locale: string }> = {
    USD: { symbol: '$', locale: 'en-US' },
    KES: { symbol: 'KSh', locale: 'en-KE' },
    EUR: { symbol: '€', locale: 'de-DE' },
    GBP: { symbol: '£', locale: 'en-GB' },
    JPY: { symbol: '¥', locale: 'ja-JP' },
    CAD: { symbol: 'C$', locale: 'en-CA' },
    AUD: { symbol: 'A$', locale: 'en-AU' },
    CNY: { symbol: '¥', locale: 'zh-CN' },
    INR: { symbol: '₹', locale: 'en-IN' },
    CHF: { symbol: 'Fr.', locale: 'de-CH' },
    NZD: { symbol: 'NZ$', locale: 'en-NZ' },
    ZAR: { symbol: 'R', locale: 'en-ZA' },
    NGN: { symbol: '₦', locale: 'en-NG' },
    GHS: { symbol: 'GH₵', locale: 'en-GH' },
    UGX: { symbol: 'USh', locale: 'en-UG' },
    TZS: { symbol: 'TSh', locale: 'en-TZ' },
    RWF: { symbol: 'FRw', locale: 'en-RW' },
  }

  const config = currencyConfig[currency.toUpperCase()] || currencyConfig.USD

  try {
    // Use Intl.NumberFormat for proper formatting
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return formatter.format(convertedAmount)
  } catch (error) {
    // Fallback to simple formatting if Intl fails
    const symbol = config.symbol
    const formattedAmount = convertedAmount.toFixed(2)
    
    // Handle different currency symbol placements
    if (currency.toUpperCase() === 'KES') {
      return `${symbol} ${formattedAmount}` // KSh 1,000.00
    }
    return `${symbol}${formattedAmount}` // $1000.00
  }
}

/**
 * Format a currency amount in a compact way (e.g., $1.2K, $1M)
 */
export function formatCompactCurrency(
  amount: number | string,
  currency: string = 'USD',
  fromCents: boolean = true
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const convertedAmount = fromCents ? numAmount / 100 : numAmount

  const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  })

  const symbol = getCurrencySymbol(currency)
  return `${symbol}${formatter.format(convertedAmount)}`
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    KES: 'KSh',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
    INR: '₹',
    CHF: 'Fr.',
    NZD: 'NZ$',
    ZAR: 'R',
    NGN: '₦',
    GHS: 'GH₵',
    UGX: 'USh',
    TZS: 'TSh',
    RWF: 'FRw',
  }

  return symbols[currency.toUpperCase()] || '$'
}

/**
 * Convert cents to dollars/euros/etc.
 */
export function fromCents(amount: number): number {
  return amount / 100
}

/**
 * Convert dollars/euros/etc. to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format a number as currency with specific options
 */
export function formatCurrencyAdvanced(
  amount: number | string,
  options: {
    currency?: string
    fromCents?: boolean
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    compact?: boolean
  } = {}
): string {
  const {
    currency = 'USD',
    fromCents = true,
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false,
  } = options

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const convertedAmount = fromCents ? numAmount / 100 : numAmount

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits,
      maximumFractionDigits,
      notation: compact ? 'compact' : 'standard',
      compactDisplay: 'short',
    })

    return formatter.format(convertedAmount)
  } catch (error) {
    // Fallback
    const symbol = getCurrencySymbol(currency)
    return `${symbol}${convertedAmount.toFixed(minimumFractionDigits)}`
  }
}

// Example usage:
// formatCurrency(2500) -> "$25.00"
// formatCurrency(2500, 'KES') -> "KSh 25.00"
// formatCurrency(2500, 'EUR') -> "25.00 €"
// formatCurrency("2500", 'GBP') -> "£25.00"
// formatCompactCurrency(250000, 'USD') -> "$2.5K"
// fromCents(2500) -> 25
// toCents(25.99) -> 2599