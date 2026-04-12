'use client'

import React from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Star, ShieldCheck, Truck, RefreshCcw } from 'lucide-react'
import { useCart } from './cart-context'
import { cn } from '@/lib/utils'

interface QuickViewModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    product: {
        id: string
        name: string
        category: string
        price: number
        originalPrice?: number
        image: string
        hoverImage: string
        badge?: string
        description?: string
        colors?: string[]
    }
}

export function QuickViewModal({ isOpen, onOpenChange, product }: QuickViewModalProps) {
    const { addToCart } = useCart()

    if (!product) return null

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-sm">
                <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
                    {/* Left Side: Images */}
                    <div className="w-full md:w-1/2 bg-stone-100 relative aspect-square md:aspect-auto">
                        {product.badge && (
                            <Badge className="absolute top-6 left-6 z-10 bg-black text-white px-3 py-1 text-[10px] uppercase tracking-widest rounded-none">
                                {product.badge}
                            </Badge>
                        )}
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Right Side: Details */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
                        <DialogHeader className="p-0 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                    {product.category}
                                </p>
                                <div className="flex items-center gap-0.5 ml-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-2.5 h-2.5 fill-teal-500 text-teal-500" />
                                    ))}
                                    <span className="text-[10px] text-stone-400 font-bold ml-1">(48 Reviews)</span>
                                </div>
                            </div>
                            <DialogTitle className="text-3xl font-bold tracking-tight mb-2">
                                {product.name}
                            </DialogTitle>

                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-black font-mono">
                                    KES {product.price.toFixed(2)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-lg text-stone-400 line-through font-mono">
                                        KES {product.originalPrice.toFixed(2)}
                                    </span>
                                )}
                                {discount > 0 && (
                                    <Badge variant="destructive" className="bg-red-500 text-white rounded-none border-none text-[10px] font-bold">
                                        SAVE {discount}%
                                    </Badge>
                                )}
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            <p className="text-stone-500 text-sm leading-relaxed">
                                {product.description}
                            </p>

                            {/* Color Selection (Visual Only) */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-900 mb-3">Available Colors</p>
                                    <div className="flex gap-2">
                                        {product.colors.map((color, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2 border-white ring-1 ring-stone-200 cursor-pointer hover:scale-110 transition-transform",
                                                    idx === 0 && "ring-black"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Benefits */}
                            <div className="grid grid-cols-2 gap-4 py-6 border-y border-stone-100">
                                <div className="flex items-center gap-3">
                                    <Truck className="w-4 h-4 text-stone-400" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Fast Delivery</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4 text-stone-400" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Elite Quality</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RefreshCcw className="w-4 h-4 text-stone-400" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">30-Day Return</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => {
                                        addToCart({
                                            id: product.id,
                                            name: product.name,
                                            price: product.price,
                                            image: product.image
                                        })
                                        onOpenChange(false)
                                    }}
                                    className="flex-1 bg-black hover:bg-stone-800 text-white rounded-none h-14 font-bold uppercase text-xs tracking-widest transition-all"
                                >
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Add to Bag
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
