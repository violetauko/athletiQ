'use client'

import React from 'react'
import { CartProvider } from '@/components/marketplace/cart-context'
import { CartSheet } from '@/components/marketplace/cart-sheet'
import { WishlistProvider } from '@/components/marketplace/wishlist-context'
import { WishlistSheet } from '@/components/marketplace/wishlist-sheet'

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
        <CartSheet />
        <WishlistSheet />
      </WishlistProvider>
    </CartProvider>
  )
}
