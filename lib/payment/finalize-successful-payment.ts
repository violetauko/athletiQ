import type { Prisma } from '@prisma/client'
import { OrderStatus, PaymentPurpose, PaymentStatus } from '@prisma/client'

type PaymentRow = {
  id: string
  userId: string
  purpose: PaymentPurpose
  merchantReference: string | null
}

/**
 * Marks payment completed and applies registration-fee or marketplace side effects.
 * Used by PayPal capture and admin Wise confirmation.
 */
export async function finalizeSuccessfulPayment(
  tx: Prisma.TransactionClient,
  payment: PaymentRow,
  extra?: { receiptNumber?: string | null; amount?: number }
) {
  await tx.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.COMPLETED,
      ...(extra?.receiptNumber != null && extra.receiptNumber !== ''
        ? { receiptNumber: extra.receiptNumber }
        : {}),
      ...(extra?.amount != null ? { amount: Math.round(extra.amount) } : {}),
    },
  })

  if (payment.purpose === PaymentPurpose.REGISTRATION_FEE) {
    await tx.user.update({
      where: { id: payment.userId },
      data: { hasPaidFee: true },
    })
  } else if (
    payment.purpose === PaymentPurpose.MARKETPLACE_PURCHASE &&
    payment.merchantReference
  ) {
    const order = await tx.order.update({
      where: { id: payment.merchantReference },
      data: { status: OrderStatus.PROCESSING },
      include: { OrderItem: true },
    })

    for (const item of order.OrderItem) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      })
    }
  }
}
