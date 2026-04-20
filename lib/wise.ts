import { randomBytes } from 'crypto'

/** Short reference for the payer to enter in Wise (alphanumeric, typical bank limits). */
export function generateWisePaymentReference(): string {
  const suffix = randomBytes(6).toString('hex').toUpperCase()
  return `ATHQ${suffix}`.slice(0, 18)
}

export type WiseBankInstructions = {
  recipientName: string
  iban: string | null
  accountNumber: string | null
  bic: string | null
  bankName: string | null
  /** Extra lines shown to the payer (e.g. sort code, address). */
  notes: string | null
}

export function isWiseConfigured(): boolean {
  const name = process.env.WISE_RECIPIENT_NAME?.trim()
  const iban = process.env.WISE_IBAN?.trim()
  const account = process.env.WISE_ACCOUNT_NUMBER?.trim()
  return Boolean(name && (iban || account))
}

export function getWiseBankInstructions(): WiseBankInstructions | null {
  if (!isWiseConfigured()) return null
  return {
    recipientName: process.env.WISE_RECIPIENT_NAME!.trim(),
    iban: process.env.WISE_IBAN?.trim() || null,
    accountNumber: process.env.WISE_ACCOUNT_NUMBER?.trim() || null,
    bic: process.env.WISE_BIC?.trim() || null,
    bankName: process.env.WISE_BANK_NAME?.trim() || null,
    notes: process.env.WISE_PAYMENT_NOTES?.trim() || null,
  }
}
