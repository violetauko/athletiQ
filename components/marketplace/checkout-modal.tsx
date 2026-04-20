'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCart } from './cart-context'
import { toast } from 'sonner'
import { Loader2, Smartphone, MapPin, Landmark } from 'lucide-react'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { PAYPAL_MARKETPLACE_SURCHARGE_KES } from '@/lib/paypal-pricing'
import { WiseBankInstructions, type WiseBankPayload } from '@/components/payments/wise-bank-instructions'

type WiseCheckoutData = {
  bank: WiseBankPayload
  reference: string
  amount: number
  currency: string
}

export function CheckoutModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { items, cartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [paymentTab, setPaymentTab] = useState<'mpesa' | 'paypal' | 'wise'>('mpesa')
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [preparingPaypal, setPreparingPaypal] = useState(false)
  const [wiseData, setWiseData] = useState<WiseCheckoutData | null>(null)
  const [preparingWise, setPreparingWise] = useState(false)

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''

  const paypalTotal = cartTotal + PAYPAL_MARKETPLACE_SURCHARGE_KES

  const resetPaypalPrep = () => setPaypalOrderId(null)
  const resetWisePrep = () => setWiseData(null)

  const handleAddressChange = (v: string) => {
    setAddress(v)
    resetPaypalPrep()
    resetWisePrep()
  }

  const handleMpesaCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return toast.error('Your cart is empty')

    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          phone,
          shippingAddress: address,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      toast.success('M-Pesa STK push sent! Please check your phone.', { duration: 8000 })
      clearCart()
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const preparePayPalOrder = async () => {
    if (items.length === 0) return toast.error('Your cart is empty')
    if (!address.trim()) return toast.error('Shipping address is required')

    setPreparingPaypal(true)
    resetPaypalPrep()
    try {
      const response = await fetch('/api/marketplace/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          shippingAddress: address,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not start PayPal')
      }
      setPaypalOrderId(data.id)
      toast.success('PayPal order ready — complete payment below.')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'PayPal checkout failed')
    } finally {
      setPreparingPaypal(false)
    }
  }

  const prepareWiseCheckout = async () => {
    if (items.length === 0) return toast.error('Your cart is empty')
    if (!address.trim()) return toast.error('Shipping address is required')

    setPreparingWise(true)
    resetWisePrep()
    try {
      const response = await fetch('/api/marketplace/wise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          shippingAddress: address,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not start Wise checkout')
      }
      setWiseData({
        bank: data.bank,
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
      })
      toast.success('Transfer details ready — pay in Wise using the reference shown.')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Wise checkout failed')
    } finally {
      setPreparingWise(false)
    }
  }

  const finishWiseInstructions = () => {
    clearCart()
    onOpenChange(false)
    setPaymentTab('mpesa')
    resetPaypalPrep()
    resetWisePrep()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">Checkout</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-stone-100 rounded-lg space-y-1 font-bold">
            <div className="flex justify-between items-center">
              <span>{paymentTab === 'paypal' ? 'Subtotal:' : 'Total:'}</span>
              <span className="text-teal-600">KES {cartTotal.toFixed(2)}</span>
            </div>
            {paymentTab === 'paypal' && (
              <>
                <div className="flex justify-between items-center text-sm font-semibold text-stone-600">
                  <span>PayPal fee:</span>
                  <span>KES {PAYPAL_MARKETPLACE_SURCHARGE_KES.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                  <span>Total (PayPal):</span>
                  <span className="text-xl text-teal-600">KES {paypalTotal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Shipping Address
            </Label>
            <Input
              id="address"
              required
              placeholder="Street, City, Postal Code"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
            />
          </div>

          <Tabs
            value={paymentTab}
            onValueChange={(v) => {
              setPaymentTab(v as 'mpesa' | 'paypal' | 'wise')
              resetPaypalPrep()
              resetWisePrep()
            }}
          >
            <TabsList className="grid w-full grid-cols-3 mb-4 gap-1">
              <TabsTrigger value="mpesa" className="text-xs sm:text-sm px-1">
                M-Pesa
              </TabsTrigger>
              <TabsTrigger value="paypal" className="text-xs sm:text-sm px-1">
                PayPal
              </TabsTrigger>
              <TabsTrigger value="wise" className="text-xs sm:text-sm px-1">
                <Landmark className="w-3 h-3 sm:mr-1 inline sm:hidden" />
                Wise
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mpesa" className="space-y-4 mt-0">
              <form onSubmit={handleMpesaCheckout} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> M-Pesa Phone Number
                  </Label>
                  <div className="flex">
                    <div className="flex items-center justify-center px-4 border border-r-0 border-stone-200 bg-stone-100 rounded-l-md font-bold text-stone-500 text-sm">
                      +254
                    </div>
                    <Input
                      id="phone"
                      required
                      placeholder="712345678"
                      className="rounded-l-none"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-stone-500 font-medium">Format: 7XX XXX XXX or 1XX XXX XXX</p>
                </div>

                <div className="p-4 border-t bg-stone-50 rounded-lg">
                  <Button
                    type="submit"
                    className="w-full bg-[#52B44B] hover:bg-[#429E3C] text-white font-bold h-12"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Initiating STK Push...
                      </>
                    ) : (
                      'Pay with M-Pesa'
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="paypal" className="space-y-4 mt-0">
              {!paypalClientId ? (
                <p className="text-sm text-muted-foreground">
                  PayPal is not configured.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    A fixed KES {PAYPAL_MARKETPLACE_SURCHARGE_KES} PayPal fee applies per order. Enter your shipping address,
                    then prepare checkout and pay with PayPal or card.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={preparingPaypal || items.length === 0 || !address.trim()}
                    onClick={preparePayPalOrder}
                  >
                    {preparingPaypal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Preparing…
                      </>
                    ) : (
                      'Prepare PayPal checkout'
                    )}
                  </Button>

                  {paypalOrderId && (
                    <div className="min-h-[140px]">
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'rect' }}
                        createOrder={() => Promise.resolve(paypalOrderId)}
                        onApprove={async (data) => {
                          const res = await fetch('/api/payment/paypal/capture', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID }),
                          })
                          const json = await res.json()
                          if (!res.ok) {
                            throw new Error(json.error || 'Capture failed')
                          }
                          toast.success('Payment successful! Your order is being processed.')
                          clearCart()
                          onOpenChange(false)
                          setPaypalOrderId(null)
                        }}
                        onError={(err) => {
                          console.error(err)
                          toast.error('PayPal error — try again or use M-Pesa.')
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="wise" className="space-y-4 mt-0">
              <p className="text-sm text-muted-foreground">
                Pay by bank transfer from your Wise account (or linked bank). Your order stays pending until an
                admin confirms the transfer.
              </p>
              {!wiseData ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={preparingWise || items.length === 0 || !address.trim()}
                  onClick={prepareWiseCheckout}
                >
                  {preparingWise ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating order…
                    </>
                  ) : (
                    'Get Wise transfer details'
                  )}
                </Button>
              ) : (
                <>
                  <WiseBankInstructions
                    bank={wiseData.bank}
                    reference={wiseData.reference}
                    amount={wiseData.amount}
                    currency={wiseData.currency}
                  />
                  <Button type="button" className="w-full" onClick={finishWiseInstructions}>
                    I&apos;ve saved the details — close
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
