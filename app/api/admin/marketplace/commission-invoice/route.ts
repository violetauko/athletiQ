import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PaymentPurpose, PaymentStatus } from '@prisma/client'
import {
  MARKETPLACE_PLATFORM_COMMISSION_RATE,
  marketplaceCommissionFromGross,
} from '@/lib/marketplace/commission'

function utcMonthRange(year: number, month1to12: number) {
  const m = month1to12 - 1
  const periodStart = new Date(Date.UTC(year, m, 1, 0, 0, 0, 0))
  const periodEnd = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59, 999))
  return { periodStart, periodEnd }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatKes(n: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'

    const now = new Date()
    let year = parseInt(searchParams.get('year') || '', 10)
    let month = parseInt(searchParams.get('month') || '', 10)
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0))
      year = prev.getUTCFullYear()
      month = prev.getUTCMonth() + 1
    }

    const { periodStart, periodEnd } = utcMonthRange(year, month)

    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
        updatedAt: { gte: periodStart, lte: periodEnd },
      },
      orderBy: { updatedAt: 'asc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    const orderIds = [...new Set(payments.map((p) => p.merchantReference!).filter(Boolean))]
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    })
    const orderMap = new Map(orders.map((o) => [o.id, o]))

    const lineItems = payments.map((p, i) => {
      const oid = p.merchantReference!
      const order = orderMap.get(oid)
      const gross = p.amount
      const commission = marketplaceCommissionFromGross(gross)
      return {
        line: i + 1,
        orderId: oid,
        orderStatus: order?.status ?? 'UNKNOWN',
        paidAt: p.updatedAt.toISOString(),
        grossKes: gross,
        commissionKes: commission,
        customerEmail: p.user?.email ?? null,
      }
    })

    const totalGross = Math.round(lineItems.reduce((s, l) => s + l.grossKes, 0) * 100) / 100
    const totalCommission =
      Math.round(lineItems.reduce((s, l) => s + l.commissionKes, 0) * 100) / 100

    const periodLabel = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(periodStart)

    const invoiceNumber = `ATHQ-COM-${year}${String(month).padStart(2, '0')}`
    const platformName = process.env.NEXT_PUBLIC_APP_NAME || 'AthletiQ'

    const payload = {
      invoiceNumber,
      platformName,
      periodLabel,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      currency: 'KES',
      commissionRate: MARKETPLACE_PLATFORM_COMMISSION_RATE,
      lineItems,
      totals: {
        purchaseVolumeKes: Math.round(totalGross * 100) / 100,
        platformCommissionDueKes: totalCommission,
        transactionCount: lineItems.length,
      },
      generatedAt: new Date().toISOString(),
    }

    if (format === 'html') {
      const rows = lineItems
        .map(
          (l) => `
        <tr>
          <td>${l.line}</td>
          <td class="mono">${escapeHtml(l.orderId.slice(0, 12))}…</td>
          <td>${escapeHtml(l.orderStatus)}</td>
          <td>${escapeHtml(l.customerEmail || '—')}</td>
          <td class="num">${formatKes(l.grossKes)}</td>
          <td class="num">${formatKes(l.commissionKes)}</td>
        </tr>`
        )
        .join('')

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Commission invoice ${escapeHtml(invoiceNumber)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 24px auto; padding: 0 16px; color: #111; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .muted { color: #555; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 0.875rem; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
    th { background: #f4f4f5; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .mono { font-family: ui-monospace, monospace; font-size: 0.8rem; }
    .summary { margin-top: 24px; padding: 16px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; }
    .summary p { margin: 6px 0; }
    @media print { body { margin: 0; } a { color: inherit; text-decoration: none; } }
  </style>
</head>
<body>
  <h1>Platform commission statement</h1>
  <p class="muted">${escapeHtml(platformName)} · ${escapeHtml(invoiceNumber)}</p>
  <p><strong>Billing period (UTC):</strong> ${escapeHtml(periodLabel)}</p>
  <p class="muted">Marketplace purchases settled in this period. Commission rate: ${(MARKETPLACE_PLATFORM_COMMISSION_RATE * 100).toFixed(0)}% of each purchase (KES).</p>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Order</th>
        <th>Order status</th>
        <th>Customer</th>
        <th>Purchase (KES)</th>
        <th>Commission (KES)</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="6">No completed marketplace payments in this period.</td></tr>'}
    </tbody>
  </table>
  <div class="summary">
    <p><strong>Total purchase volume:</strong> ${formatKes(payload.totals.purchaseVolumeKes)}</p>
    <p><strong>Total commission due (${(MARKETPLACE_PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%):</strong> ${formatKes(payload.totals.platformCommissionDueKes)}</p>
    <p class="muted">Transactions: ${payload.totals.transactionCount} · Generated ${escapeHtml(new Date(payload.generatedAt).toUTCString())}</p>
    <p class="muted">Use this document to request payout of the stated commission for the period.</p>
  </div>
</body>
</html>`
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${invoiceNumber}.html"`,
        },
      })
    }

    return NextResponse.json(payload)
  } catch (e) {
    console.error('[ADMIN_MARKETPLACE_COMMISSION_INVOICE]', e)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
