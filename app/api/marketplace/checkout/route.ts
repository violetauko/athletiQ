import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getMpesaToken, generateTimestamp, generateMpesaPassword, formatPhoneNumber } from '@/lib/mpesa'
import { PaymentProvider, PaymentPurpose, PaymentStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // We strictly require authentication for checkout so Orders are bound properly
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to checkout' }, { status: 401 })
    }

    const { items, phone, shippingAddress } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!phone) {
      return NextResponse.json({ error: 'M-Pesa phone number is required' }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 })
    }

    const formattedPhone = formatPhoneNumber(phone)
    if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
      return NextResponse.json({ error: 'Invalid M-Pesa phone number format' }, { status: 400 })
    }

    // 1. Validate prices with database
    const productIds = items.map((i: any) => i.id)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are invalid' }, { status: 400 })
    }

    let totalAmount = 0
    const orderItemsData = []

    for (const item of items) {
      const dbProduct = dbProducts.find(p => p.id === item.id)
      if (!dbProduct) continue
      
      // Prevent ordering unavailable stock
      if (dbProduct.stock < item.quantity) {
         return NextResponse.json({ error: `Not enough stock for ${dbProduct.name}` }, { status: 400 })
      }

      totalAmount += dbProduct.price * item.quantity
      orderItemsData.push({
        productId: item.id,
        quantity: item.quantity,
        price: dbProduct.price
      })
    }

    // 2. Create the Order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        shippingAddress,
        paymentMethod: 'MPESA',
        OrderItem: {
          create: orderItemsData
        }
      }
    })

    // 3. Initiate STK Push
    const isSandbox = (process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke").includes('sandbox')
    const finalAmount = isSandbox ? Math.min(Math.round(totalAmount), 11) : Math.round(totalAmount) 
    const childTillNumber = process.env.MPESA_CHILD_TILL_NUMBER || "5384902"

    const passkey = process.env.MPESA_PASSKEY!
    const shortcode = process.env.MPESA_SHORTCODE!
    const callbackUrl = process.env.MPESA_CALLBACK_URL!

    if (!passkey || !shortcode || !callbackUrl) {
      return NextResponse.json({ error: "M-Pesa not configured properly" }, { status: 500 })
    }

    const token = await getMpesaToken()
    const timestamp = generateTimestamp()
    const password = generateMpesaPassword(shortcode, passkey, timestamp)

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: finalAmount,
      PartyA: formattedPhone,
      PartyB: childTillNumber,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: order.id.substring(0, 12),
      TransactionDesc: `AthletiQ Order`,
    };

    const response = await fetch(
      `${process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    )

    const mpesaResponse = await response.json()

    if (mpesaResponse.ResponseCode !== "0" || (mpesaResponse.ResponseDescription && mpesaResponse.ResponseDescription.toLowerCase().includes('error'))) {
      console.error("M-Pesa Checkout STK Push Error:", mpesaResponse)
      
      // Delete the order since we failed to initiate payment
      await prisma.order.delete({ where: { id: order.id } })
      
      return NextResponse.json(
        { error: mpesaResponse.errorMessage || mpesaResponse.ResponseDescription || 'M-Pesa STK push failed' },
        { status: 400 }
      )
    }

    // 4. Create Pending Payment
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: Math.round(totalAmount),
        currency: "KES",
        provider: PaymentProvider.MPESA,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
        referenceId: mpesaResponse.CheckoutRequestID,
        merchantReference: order.id
      },
    })

    return NextResponse.json({ 
      success: true, 
      CheckoutRequestID: mpesaResponse.CheckoutRequestID,
      orderId: order.id
    })

  } catch (error: any) {
    console.error("Checkout Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
