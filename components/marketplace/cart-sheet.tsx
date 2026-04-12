'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCart } from './cart-context'
import { ShoppingCart, X, Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { CheckoutModal } from './checkout-modal'

export function CartSheet() {
  const { items, cartTotal, itemCount, removeFromCart, updateQuantity, isOpen, setIsOpen } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-teal-600 hover:bg-teal-700 shadow-xl relative p-0 flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6 text-white" />
          {itemCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {itemCount}
            </div>
          )}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md w-full h-[90vh] md:h-auto overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex flex-col text-left">
              <span className="text-2xl font-bold">Your Cart</span>
              <span className="text-stone-500 text-sm font-normal normal-case">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] md:h-full text-stone-500 py-12">
                <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-stone-100 rounded-sm relative overflow-hidden shrink-0 border border-stone-200">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-stone-500 mt-1 font-medium">KES {item.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-sm overflow-hidden border-stone-300">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 text-stone-500">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 text-stone-500">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold ml-auto">KES {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t shrink-0 bg-stone-50">
            <div className="flex justify-between mb-4 font-bold text-lg">
              <span>Subtotal</span>
              <span>KES {cartTotal.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full bg-black hover:bg-stone-800 text-white font-bold h-12 text-sm uppercase tracking-widest"
              disabled={items.length === 0}
              onClick={() => {
                setIsOpen(false)
                setCheckoutOpen(true)
              }}
            >
              Checkout Seamlessly
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  )
}
