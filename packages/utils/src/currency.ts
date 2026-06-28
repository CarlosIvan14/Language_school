export function formatCurrency(cents: number, currency = 'USD', locale = 'es-MX'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export function centsToFloat(cents: number): number {
  return cents / 100
}

export function floatToCents(amount: number): number {
  return Math.round(amount * 100)
}
