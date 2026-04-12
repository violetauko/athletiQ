'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from './cart-context'
import { toast } from 'sonner'
import { Loader2, Smartphone, MapPin } from 'lucide-react'

export function CheckoutModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { items, cartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return toast.error('Your cart is empty')
    
    setLoading(true)
    try {
      const response = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ id: item.id, quantity: item.quantity })),
          phone,
          shippingAddress: address
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      toast.success('M-Pesa STK push sent! Please check your phone.', { duration: 8000 })
      clearCart()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold">Checkout</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleCheckout}>
          <div className="p-6 space-y-6">
            <div className="p-4 bg-stone-100 rounded-lg flex justify-between items-center font-bold">
              <span>Total Amount:</span>
              <span className="text-xl text-teal-600">KES {cartTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Shipping Address
                </Label>
                <Input 
                  id="address" 
                  required 
                  placeholder="Street, City, Postal Code" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

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
            </div>
          </div>

          <div className="p-6 border-t bg-stone-50">
            <Button 
              type="submit" 
              className="w-full bg-[#52B44B] hover:bg-[#429E3C] text-white font-bold h-12 group"
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
      </DialogContent>
    </Dialog>
  )
}
