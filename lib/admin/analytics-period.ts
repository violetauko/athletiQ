export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year'

/**
 * Start of a UTC calendar month relative to `reference` (aligned with commission invoice).
 * offset 0 = month containing reference; -1 = previous calendar month, etc.
 */
export function utcCalendarMonthStart(
  reference: Date = new Date(),
  monthOffset = 0
): Date {
  const y = reference.getUTCFullYear()
  const m = reference.getUTCMonth() + monthOffset
  return new Date(Date.UTC(y, m, 1, 0, 0, 0, 0))
}

/** Rolling week/quarter/year; month = start of current UTC calendar month (month-to-date). */
export function getAnalyticsPeriodStart(period: AnalyticsPeriod): Date {
  const d = new Date()
  switch (period) {
    case 'week': {
      const x = new Date(d)
      x.setDate(x.getDate() - 7)
      return x
    }
    case 'month': {
      return utcCalendarMonthStart(d, 0)
    }
    case 'quarter': {
      const x = new Date(d)
      x.setMonth(x.getMonth() - 3)
      return x
    }
    case 'year': {
      const x = new Date(d)
      x.setFullYear(x.getFullYear() - 1)
      return x
    }
    default: {
      return utcCalendarMonthStart(d, 0)
    }
  }
}
