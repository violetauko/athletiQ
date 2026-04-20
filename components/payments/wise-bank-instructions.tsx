'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export type WiseBankPayload = {
  recipientName: string
  iban: string | null
  accountNumber: string | null
  bic: string | null
  bankName: string | null
  notes: string | null
}

async function copyLine(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} copied`)
  } catch {
    toast.error('Could not copy')
  }
}

export function WiseBankInstructions({
  bank,
  reference,
  amount,
  currency,
}: {
  bank: WiseBankPayload
  reference: string
  amount: number
  currency: string
}) {
  return (
    <div className="rounded-lg border bg-stone-50 p-4 space-y-3 text-sm">
      <p className="font-medium text-stone-900">Pay with Wise (bank transfer)</p>
      <p className="text-muted-foreground text-xs leading-relaxed">
        In Wise, send exactly the amount below to the account details. Use the reference in the transfer
        description so we can match your payment. Settlement is manual — an admin marks the payment after funds
        arrive (usually within 1–2 business days).
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 border">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground">Amount</p>
          <p className="font-mono font-semibold">
            {amount.toLocaleString()} {currency}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => copyLine('Amount', `${amount} ${currency}`)}>
          Copy
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 border">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase text-muted-foreground">Reference (required)</p>
          <p className="font-mono text-xs break-all">{reference}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => copyLine('Reference', reference)}>
          Copy
        </Button>
      </div>

      <div className="space-y-1 rounded-md bg-white px-3 py-2 border text-xs">
        <p className="text-[10px] uppercase text-muted-foreground">Recipient</p>
        <p className="font-medium">{bank.recipientName}</p>
        {bank.bankName ? <p className="text-muted-foreground">{bank.bankName}</p> : null}
        {bank.iban ? (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="font-mono break-all">IBAN: {bank.iban}</span>
            <Button type="button" variant="ghost" size="sm" className="shrink-0 h-7 text-xs" onClick={() => copyLine('IBAN', bank.iban!)}>
              Copy IBAN
            </Button>
          </div>
        ) : null}
        {bank.accountNumber ? (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="font-mono break-all">Account: {bank.accountNumber}</span>
            <Button type="button" variant="ghost" size="sm" className="shrink-0 h-7 text-xs" onClick={() => copyLine('Account', bank.accountNumber!)}>
              Copy account
            </Button>
          </div>
        ) : null}
        {bank.bic ? <p className="font-mono pt-1">BIC / SWIFT: {bank.bic}</p> : null}
        {bank.notes ? <p className="text-muted-foreground pt-2 border-t mt-2 whitespace-pre-wrap">{bank.notes}</p> : null}
      </div>
    </div>
  )
}
