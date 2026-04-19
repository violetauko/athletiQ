import { prisma } from '@/lib/prisma'

export type CartLine = { id: string; quantity: number }

export async function createMarketplaceOrderFromCart(params: {
  userId: string
  items: CartLine[]
  shippingAddress: string
  paymentMethod: string
}) {
  const { userId, items, shippingAddress, paymentMethod } = params

  if (!items || items.length === 0) {
    throw new Error('Cart is empty')
  }

  if (!shippingAddress?.trim()) {
    throw new Error('Shipping address is required')
  }

  const productIds = items.map((i) => i.id)
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  if (dbProducts.length !== productIds.length) {
    throw new Error('One or more products are invalid')
  }

  let totalAmount = 0
  const orderItemsData: { productId: string; quantity: number; price: number }[] = []

  for (const item of items) {
    const dbProduct = dbProducts.find((p) => p.id === item.id)
    if (!dbProduct) continue

    if (dbProduct.stock < item.quantity) {
      throw new Error(`Not enough stock for ${dbProduct.name}`)
    }

    totalAmount += dbProduct.price * item.quantity
    orderItemsData.push({
      productId: item.id,
      quantity: item.quantity,
      price: dbProduct.price,
    })
  }

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      shippingAddress,
      paymentMethod,
      OrderItem: {
        create: orderItemsData,
      },
    },
  })

  return { order, totalAmount }
}
