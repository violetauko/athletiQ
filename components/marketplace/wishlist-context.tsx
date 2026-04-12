'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category: string
}

interface WishlistContextType {
  items: WishlistItem[]
  toggleWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
  itemCount: number
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  // Persist wishlist to localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem('athletiq_wishlist')
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (e) {
        console.error('Failed to parse wishlist')
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('athletiq_wishlist', JSON.stringify(items))
  }, [items])

  const toggleWishlist = (product: WishlistItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
          toast.info(`Removed ${product.name} from wishlist`)
          return prev.filter((item) => item.id !== product.id)
      }
      toast.success(`Added ${product.name} to wishlist`)
      return [...prev, product]
    })
  }

  const removeFromWishlist = (id: string) => {
    setItems((prev) => {
        const item = prev.find(i => i.id === id)
        if (item) toast.info(`Removed ${item.name} from wishlist`)
        return prev.filter((item) => item.id !== id)
    })
  }

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id)
  }

  const clearWishlist = () => {
    setItems([])
  }

  const itemCount = items.length

  return (
    <WishlistContext.Provider value={{ 
        items, 
        toggleWishlist, 
        removeFromWishlist, 
        isInWishlist, 
        clearWishlist, 
        itemCount,
        isOpen,
        setIsOpen
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
