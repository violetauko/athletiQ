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

    const handleWishlist = () => {
        toggleWishlist({ id, name, price, image, category })
    }

    const openQuickView = () => {
        setIsQuickViewOpen(true)
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
                    <Badge className="absolute top-3 left-3 z-10 bg-amber-500 hover:bg-amber-600 font-medium rounded-sm px-2.5 py-0.5">
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
                    loading='eager'
                    sizes='(width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    className={cn(
                        "object-cover transition-opacity duration-700 ease-in-out",
                        isHovered ? "opacity-0" : "opacity-100"
                    )}
                />
                <Image
                    src={hoverImage}
                    alt={`${name} hover`}
                    loading='eager'
                    fill
                    sizes='(width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    className={cn(
                        "object-cover transition-opacity duration-700 ease-in-out",
                        isHovered ? "opacity-100" : "opacity-0"
                    )}
                />

                {/* Small screens: one horizontal bar — icons + Add share the bottom row */}
                <div
                    className={cn(
                        "absolute inset-x-0 bottom-0 z-20 flex items-stretch gap-0.5 border-t border-stone-200/80 bg-white/95 p-1 shadow-[0_-4px_14px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:gap-1 sm:p-1.5",
                        "lg:hidden",
                    )}
                >
                    <QuickActionButton
                        icon={<Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isSaved && "fill-amber-500 text-amber-500")} />}
                        label={isSaved ? "Saved" : "Wishlist"}
                        onClick={handleWishlist}
                        compact
                    />
                    <QuickActionButton
                        icon={<BarChart2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        label="Compare"
                        compact
                    />
                    <QuickActionButton
                        icon={<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        label="Quick View"
                        onClick={openQuickView}
                        compact
                    />
                    <Button
                        type="button"
                        onClick={handleAddToCart}
                        className="h-9 min-h-9 min-w-0 flex-1 shrink rounded-none bg-amber-600 px-1.5 text-[9px] font-bold md:tracking-wide text-white uppercase shadow-none hover:bg-amber-700 sm:h-10 sm:min-h-10 sm:px-2 sm:text-[10px]"
                    >
                        <ShoppingBag className="mr-0 h-3 w-3 shrink-0 sm:mr-1 sm:h-3.5 sm:w-3.5" />
                        <span className="hidden truncate sm:inline">Add to cart</span>
                    </Button>
                </div>

                {/* Desktop: vertical quick actions (hover) */}
                <div
                    className={cn(
                        "absolute top-3 right-3 z-20 hidden flex-col gap-2 transition-all duration-300 lg:flex",
                        "translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                    )}
                >
                    <QuickActionButton
                        icon={<Heart className={cn("h-4 w-4", isSaved && "fill-amber-500 text-amber-500")} />}
                        label={isSaved ? "Saved" : "Wishlist"}
                        onClick={handleWishlist}
                    />
                    <QuickActionButton icon={<BarChart2 className="h-4 w-4" />} label="Compare" />
                    <QuickActionButton
                        icon={<Search className="h-4 w-4" />}
                        label="Quick View"
                        onClick={openQuickView}
                    />
                </div>

                {/* Desktop: full-width add on hover */}
                <div
                    className={cn(
                        "absolute right-0 bottom-0 left-0 z-20 hidden p-3 transition-all duration-300 lg:block",
                        "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                    )}
                >
                    <Button
                        type="button"
                        onClick={handleAddToCart}
                        className="h-10 w-full rounded-none bg-white text-[10px] font-bold tracking-widest text-black uppercase shadow-lg hover:bg-black hover:text-white"
                    >
                        <ShoppingBag className="mr-2 h-3.5 w-3.5" />
                        Add to cart
                    </Button>
                </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-1 md:gap-1.5">
                <p className="text-[10px] uppercase md:tracking-widest text-stone-500 font-semibold">{category}</p>
                <button
                    type="button"
                    onClick={openQuickView}
                    className="text-left text-sm font-medium leading-tight text-foreground underline-offset-4 hover:text-amber-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 overflow-hidden text-ellipsis whitespace-nowrap"
                >
                    {name}
                </button>
                <div className="flex items-center gap-1 md:gap-2 mt-1">
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

function QuickActionButton({
    icon,
    label,
    onClick,
    compact,
}: {
    icon: React.ReactNode
    label: string
    onClick?: () => void
    compact?: boolean
}) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick?.()
            }}
            className={cn(
                "group/btn relative flex touch-manipulation items-center justify-center rounded-sm bg-white shadow-sm transition-colors hover:bg-black hover:text-white",
                compact
                    ? "h-9 min-h-9 w-9 min-w-9 shrink-0 sm:h-10 sm:min-h-10 sm:w-10 sm:min-w-10"
                    : "h-10 w-10",
            )}
            title={label}
            aria-label={label}
        >
            {icon}
            {!compact && (
                <span className="pointer-events-none absolute right-full mr-2 hidden rounded-sm bg-black px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover/btn:opacity-100 lg:block">
                    {label}
                </span>
            )}
        </button>
    )
}
