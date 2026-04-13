import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DonationStatus, PaymentPurpose, PaymentStatus } from '@prisma/client'
import {
  MARKETPLACE_PLATFORM_COMMISSION_RATE,
  REGISTRATION_FEE_COMMISSION_RATE,
  marketplaceCommissionFromGross,
  registrationFeeCommissionFromGross,
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

function formatMoney(n: number, currency: string) {
  const c = (currency || 'KES').toUpperCase() === 'USD' ? 'USD' : 'KES'
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: c,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

const marketplaceWhere = (periodStart: Date, periodEnd: Date) => ({
  status: PaymentStatus.COMPLETED,
  purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
  updatedAt: { gte: periodStart, lte: periodEnd },
})

const registrationWhere = (periodStart: Date, periodEnd: Date) => ({
  status: PaymentStatus.COMPLETED,
  purpose: PaymentPurpose.REGISTRATION_FEE,
  updatedAt: { gte: periodStart, lte: periodEnd },
})

const donationWhere = (periodStart: Date, periodEnd: Date) => ({
  status: DonationStatus.PAID,
  createdAt: { gte: periodStart, lte: periodEnd },
})

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
    const mw = marketplaceWhere(periodStart, periodEnd)
    const rw = registrationWhere(periodStart, periodEnd)
    const dw = donationWhere(periodStart, periodEnd)

    const [
      marketplacePayments,
      registrationPayments,
      donations,
      marketplaceAgg,
      registrationAgg,
      donationAgg,
    ] = await Promise.all([
      prisma.payment.findMany({
        where: mw,
        orderBy: { updatedAt: 'asc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.payment.findMany({
        where: rw,
        orderBy: { updatedAt: 'asc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.donation.findMany({
        where: dw,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.payment.aggregate({
        where: mw,
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: rw,
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: dw,
        _sum: { amount: true },
      }),
    ])

    const orderIds = [
      ...new Set(marketplacePayments.map((p) => p.merchantReference).filter(Boolean) as string[]),
    ]
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

    const purchaseVolumeKes = marketplaceAgg._sum.amount ?? 0
    const registrationVolumeKes = registrationAgg._sum.amount ?? 0
    const donationVolume = donationAgg._sum.amount ?? 0

    const marketplaceCommissionKes = marketplaceCommissionFromGross(purchaseVolumeKes)
    const donationCommissionKes = marketplaceCommissionFromGross(donationVolume)
    const registrationCommissionKes = registrationFeeCommissionFromGross(registrationVolumeKes)
    const platformCommissionDueKes =
      Math.round((marketplaceCommissionKes + donationCommissionKes + registrationCommissionKes) * 100) / 100

    const lineItemsMarketplace = marketplacePayments.map((p, i) => {
      const oid = p.merchantReference ?? ''
      const order = oid ? orderMap.get(oid) : undefined
      return {
        line: i + 1,
        orderId: oid || '—',
        orderStatus: order?.status ?? 'UNKNOWN',
        paidAt: p.updatedAt.toISOString(),
        grossKes: p.amount,
        customerEmail: p.user?.email ?? null,
      }
    })

    const lineItemsRegistration = registrationPayments.map((p, i) => ({
      line: i + 1,
      paymentId: p.id,
      paidAt: p.updatedAt.toISOString(),
      grossKes: p.amount,
      customerEmail: p.user?.email ?? null,
    }))

    const lineItemsDonations = donations.map((d, i) => ({
      line: i + 1,
      donationId: d.id,
      paidAt: d.createdAt.toISOString(),
      gross: d.amount,
      currency: d.currency,
      donorEmail: d.donorEmail,
      tierId: d.tierId,
    }))

    const periodLabel = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(periodStart)

    const invoiceNumber = `ATHQ-COM-${year}${String(month).padStart(2, '0')}`
    const platformName = process.env.NEXT_PUBLIC_APP_NAME || 'AthletiQ'

    const transactionCount =
      marketplacePayments.length + registrationPayments.length + donations.length

    const payload = {
      invoiceNumber,
      platformName,
      periodLabel,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      currency: 'KES',
      commissionRates: {
        marketplace: MARKETPLACE_PLATFORM_COMMISSION_RATE,
        donation: MARKETPLACE_PLATFORM_COMMISSION_RATE,
        registration: REGISTRATION_FEE_COMMISSION_RATE,
      },
      lineItems: {
        marketplace: lineItemsMarketplace,
        donations: lineItemsDonations,
        registration: lineItemsRegistration,
      },
      totals: {
        purchaseVolumeKes,
        donationVolume,
        registrationVolumeKes,
        marketplaceCommissionKes,
        donationCommissionKes,
        registrationCommissionKes,
        platformCommissionDueKes,
        transactionCount,
      },
      generatedAt: new Date().toISOString(),
    }

    if (format === 'html') {
      const rowsM = lineItemsMarketplace
        .map(
          (l) => `
        <tr>
          <td>${l.line}</td>
          <td class="mono">${escapeHtml(l.orderId.slice(0, 12))}…</td>
          <td>${escapeHtml(l.orderStatus)}</td>
          <td>${escapeHtml(l.customerEmail || '—')}</td>
          <td class="num">${formatKes(l.grossKes)}</td>
        </tr>`
        )
        .join('')

      const rowsD = lineItemsDonations
        .map(
          (l) => `
        <tr>
          <td>${l.line}</td>
          <td class="mono">${escapeHtml(l.donationId.slice(0, 12))}…</td>
          <td>${escapeHtml(l.tierId)}</td>
          <td>${escapeHtml(l.donorEmail || '—')}</td>
          <td class="num">${escapeHtml(formatMoney(l.gross, l.currency))}</td>
        </tr>`
        )
        .join('')

      const rowsR = lineItemsRegistration
        .map(
          (l) => `
        <tr>
          <td>${l.line}</td>
          <td class="mono">${escapeHtml(l.paymentId.slice(0, 12))}…</td>
          <td>${escapeHtml(l.customerEmail || '—')}</td>
          <td class="num">${formatKes(l.grossKes)}</td>
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
    body { font-family: system-ui, sans-serif; max-width: 960px; margin: 24px auto; padding: 0 16px; color: #111; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    .muted { color: #555; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.875rem; }
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
  <p class="muted">Totals match finance analytics: marketplace and donations at ${(MARKETPLACE_PLATFORM_COMMISSION_RATE * 100).toFixed(0)}% of gross volume in period; registration fees at ${(REGISTRATION_FEE_COMMISSION_RATE * 100).toFixed(0)}%. Donations use <code>createdAt</code>; payments use <code>updatedAt</code> when marked completed.</p>

  <h2>Marketplace purchases</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Order</th>
        <th>Order status</th>
        <th>Customer</th>
        <th>Purchase (KES)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsM || '<tr><td colspan="5">No completed marketplace payments in this period.</td></tr>'}
    </tbody>
  </table>

  <h2>Donations</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Donation</th>
        <th>Tier</th>
        <th>Donor</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rowsD || '<tr><td colspan="5">No paid donations in this period.</td></tr>'}
    </tbody>
  </table>

  <h2>Registration &amp; entry fees</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Payment</th>
        <th>Customer</th>
        <th>Fee (KES)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsR || '<tr><td colspan="4">No completed registration payments in this period.</td></tr>'}
    </tbody>
  </table>

  <div class="summary">
    <p><strong>Marketplace gross (KES):</strong> ${formatKes(payload.totals.purchaseVolumeKes)} → <strong>Commission (${(MARKETPLACE_PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%):</strong> ${formatKes(payload.totals.marketplaceCommissionKes)}</p>
    <p><strong>Donation gross (numeric sum, analytics basis):</strong> ${payload.totals.donationVolume.toFixed(2)} → <strong>Commission (${(MARKETPLACE_PLATFORM_COMMISSION_RATE * 100).toFixed(0)}%):</strong> ${formatKes(payload.totals.donationCommissionKes)}</p>
    <p><strong>Registration gross (KES):</strong> ${formatKes(payload.totals.registrationVolumeKes)} → <strong>Commission (${(REGISTRATION_FEE_COMMISSION_RATE * 100).toFixed(0)}%):</strong> ${formatKes(payload.totals.registrationCommissionKes)}</p>
    <p><strong>Total platform commission due:</strong> ${formatKes(payload.totals.platformCommissionDueKes)}</p>
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
