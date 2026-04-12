'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useWishlist } from './wishlist-context'
import { useCart } from './cart-context'
import { Heart, X, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

export function WishlistSheet() {
  const { items, itemCount, removeFromWishlist, isOpen, setIsOpen } = useWishlist()
  const { addToCart } = useCart()

  return (
    <>
      <div className="fixed bottom-24 right-8 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-white hover:bg-stone-50 text-black shadow-xl relative p-0 flex items-center justify-center border-2 border-teal-500"
        >
          <Heart className="w-6 h-6 text-teal-600" />
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
              <span className="text-2xl font-bold">Your Wishlist</span>
              <span className="text-stone-500 text-sm font-normal normal-case">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} saved
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] md:h-full text-stone-500 py-12">
                <Heart className="w-12 h-12 mb-4 opacity-20" />
                <p>Your wishlist is empty.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-24 bg-stone-100 rounded-sm relative overflow-hidden shrink-0 border border-stone-200">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-xs text-stone-500 mt-1 font-medium">{item.category}</p>
                        <p className="text-sm font-bold mt-1">KES {item.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeFromWishlist(item.id)} className="text-stone-300 hover:text-red-500 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            addToCart({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                image: item.image
                            })
                            removeFromWishlist(item.id)
                        }}
                        className="h-8 text-[10px] uppercase tracking-widest font-bold flex-1"
                       >
                         <ShoppingBag className="w-3 h-3 mr-2" />
                         Move to Bag
                       </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t shrink-0 bg-stone-50">
            <Button 
              variant="outline"
              className="w-full border-black text-black hover:bg-black hover:text-white font-bold h-12 text-sm uppercase tracking-widest"
              onClick={() => setIsOpen(false)}
            >
              Back to Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
