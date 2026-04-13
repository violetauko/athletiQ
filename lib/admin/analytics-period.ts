export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year'

/** Start of the rolling window ending now (matches finance analytics behavior). */
export function getAnalyticsPeriodStart(period: AnalyticsPeriod): Date {
  const d = new Date()
  switch (period) {
    case 'week': {
      const x = new Date(d)
      x.setDate(x.getDate() - 7)
      return x
    }
    case 'month': {
      const x = new Date(d)
      x.setMonth(x.getMonth() - 1)
      return x
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
      const x = new Date(d)
      x.setMonth(x.getMonth() - 1)
      return x
    }
  }
}
