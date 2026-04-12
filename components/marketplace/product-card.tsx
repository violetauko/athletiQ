'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Heart, Search, ShoppingBag, BarChart2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCart } from './cart-context'
import { QuickViewModal } from './quick-view-modal'
import { useWishlist } from './wishlist-context'

interface ProductCardProps {
    id: string
    name: string
    category: string
    price: number
    originalPrice?: number
    image: string
    hoverImage: string
    badge?: string
    colors?: string[],
    description?: string
}

export function ProductCard({
    id,
    name,
    category,
    price,
    originalPrice,
    image,
    hoverImage,
    badge,
    colors,
    description
}: ProductCardProps) {
    const { addToCart } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const [isHovered, setIsHovered] = useState(false)
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

    const isSaved = isInWishlist(id)

    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart({
            id,
            name,
            price,
            image
        })
    }

    return (
        <div
            className="group relative flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-sm mb-4">
                {/* Badge */}
                {badge && (
                    <Badge className="absolute top-3 left-3 z-10 bg-teal-500 hover:bg-teal-600 font-medium rounded-sm px-2.5 py-0.5">
                        {badge}
                    </Badge>
                )}
                {discount > 0 && !badge && (
                    <Badge variant="destructive" className="absolute top-3 left-3 z-10 font-medium rounded-sm px-2.5 py-0.5">
                        -{discount}%
                    </Badge>
                )}

                {/* Images */}
                <Image
                    src={image}
                    alt={name}
                    fill
                    className={cn(
                        "object-cover transition-opacity duration-700 ease-in-out",
                        isHovered ? "opacity-0" : "opacity-100"
                    )}
                />
                <Image
                    src={hoverImage}
                    alt={`${name} hover`}
                    fill
                    className={cn(
                        "object-cover transition-opacity duration-700 ease-in-out",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}
                />

                {/* Quick Actions (Sidebar on hover) */}
                <div className={cn(
                    "absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                )}>
                    <QuickActionButton
                        icon={<Heart className={cn("w-4 h-4", isSaved && "fill-teal-500 text-teal-500")} />}
                        label={isSaved ? "Saved" : "Wishlist"}
                        onClick={() => toggleWishlist({ id, name, price, image, category })}
                    />
                    <QuickActionButton icon={<BarChart2 className="w-4 h-4" />} label="Compare" />
                    <QuickActionButton
                        icon={<Search className="w-4 h-4" />}
                        label="Quick View"
                        onClick={() => setIsQuickViewOpen(true)}
                    />
                </div>

                {/* Quick Add Button (Bottom on hover) */}
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                )}>
                    <Button
                        onClick={handleAddToCart}
                        className="w-full bg-white text-black hover:bg-black hover:text-white rounded-none h-10 font-bold uppercase text-[10px] tracking-widest shadow-lg"
                    >
                        <ShoppingBag className="w-3.5 h-3.5 mr-2" />
                        Quick Add
                    </Button>
                </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-1.5">
                <p className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">{category}</p>
                <h3 className="text-sm font-medium hover:text-teal-600 transition-colors cursor-pointer leading-tight">
                    {name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold">KES {price.toFixed(2)}</span>
                    {originalPrice && (
                        <span className="text-xs text-stone-400 line-through">KES {originalPrice.toFixed(2)}</span>
                    )}
                </div>

                {/* Color Swatches */}
                {colors && colors.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                        {colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-stone-200 cursor-pointer hover:scale-110 transition-transform shadow-inner"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <QuickViewModal
                isOpen={isQuickViewOpen}
                onOpenChange={setIsQuickViewOpen}
                product={{
                    id, name, category, price, originalPrice, image, hoverImage, badge, colors, description
                }}
            />
        </div>
    )
}

function QuickActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-10 h-10 bg-white hover:bg-black hover:text-white flex items-center justify-center rounded-sm shadow-sm transition-colors group/btn relative"
            title={label}
        >
            {icon}
            <span className="absolute right-full mr-2 px-2 py-1 bg-black text-white text-[10px] whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none rounded-sm">
                {label}
            </span>
        </button>
    )
}
