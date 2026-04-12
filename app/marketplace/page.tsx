'use client'

import React, { useState } from 'react'
import { ProductCard } from '@/components/marketplace/product-card'
import { MarketplaceFilters } from '@/components/marketplace/market-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Grid2X2, Grid3X3, LayoutGrid, ChevronRight, SlidersHorizontal, ArrowUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function MarketplacePage() {
    const [viewMode, setViewMode] = useState<'grid2' | 'grid3' | 'grid4'>('grid3')

    // Dynamic Product State
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters State
    const [status, setStatus] = useState('ALL')
    const [category, setCategory] = useState('ALL')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [sort, setSort] = useState('featured')
    const [search, setSearch] = useState('')

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (status !== 'ALL') params.set('status', status)
            if (category !== 'ALL') params.set('category', category)
            if (minPrice) params.set('minPrice', minPrice)
            if (maxPrice) params.set('maxPrice', maxPrice)
            if (sort !== 'featured') params.set('sort', sort)
            if (search) params.set('search', search)

            const res = await fetch(`/api/products?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setProducts(data.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch products', error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts()
        }, 500)
        return () => clearTimeout(timeout)
    }, [status, category, minPrice, maxPrice, sort, search])


    return (
        <div className="min-h-screen bg-white">
            {/* Announcement Bar */}
            {/* <div className="bg-stone-100 py-2 text-center overflow-hidden">
                <div className="container">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-600 animate-pulse">
                        Exclusive Early Access for Athletes — Use code <span className="text-black">ATHLETIQ20</span> for 20% OFF
                    </p>
                </div>
            </div> */}

            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumbs & Header */}
                <nav className="flex items-center gap-2 text-xs text-stone-400 mb-8 uppercase tracking-widest font-semibold">
                    <a href="/" className="hover:text-black">Home</a>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-stone-800">Marketplace</span>
                </nav>

                <div className="flex flex-col gap-2 mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Performance Gear</h1>
                    <p className="text-stone-500 max-w-2xl">
                        Curated high-performance equipment and apparel designed for the modern athlete.
                        Tested by pros, available for everyone.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="sticky top-[64px] z-20 bg-white/80 backdrop-blur-md border-b py-2 mb-8 flex flex-col md:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <Button variant="ghost" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-0">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filter
                        </Button>
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-widest whitespace-nowrap">
                            {products.length} Products
                        </span>
                        <div className="relative w-full max-w-xs ml-auto md:ml-4">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
                            <Input
                                placeholder="Search products..."
                                className="pl-8 h-9 text-xs"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Grid Toggles (Desktop) */}
                        <div className="hidden lg:flex items-center gap-1 border-r pr-4 mr-2">
                            <ToolbarIconButton
                                active={viewMode === 'grid2'}
                                onClick={() => setViewMode('grid2')}
                                icon={<Grid2X2 className="w-4 h-4" />}
                            />
                            <ToolbarIconButton
                                active={viewMode === 'grid3'}
                                onClick={() => setViewMode('grid3')}
                                icon={<Grid3X3 className="w-4 h-4" />}
                            />
                            <ToolbarIconButton
                                active={viewMode === 'grid4'}
                                onClick={() => setViewMode('grid4')}
                                icon={<LayoutGrid className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Sort by:</span>
                            <Select value={sort} onValueChange={setSort}>
                                <SelectTrigger className="w-[180px] h-9 border-none bg-transparent hover:bg-stone-50 text-xs font-bold uppercase tracking-widest shadow-none p-0 px-2">
                                    <SelectValue placeholder="Featured" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="featured">Featured</SelectItem>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="low-high">Price: Low to High</SelectItem>
                                    <SelectItem value="high-low">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-12">
                    {/* Sidebar Filters */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <MarketplaceFilters
                            status={status} setStatus={setStatus}
                            minPrice={minPrice} setMinPrice={setMinPrice}
                            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                            category={category} setCategory={setCategory}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="py-20 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 text-center text-stone-500">
                                No products found matching your criteria.
                            </div>
                        ) : (
                            <div className={cn(
                                "grid gap-x-6 gap-y-12",
                                viewMode === 'grid2' ? "grid-cols-2" :
                                    viewMode === 'grid3' ? "grid-cols-2 md:grid-cols-3" :
                                        "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                            )}>
                                {products.map(product => {
                                    // Adapt product API data to ProductCard props
                                    const cardProps = {
                                        id: product.id,
                                        name: product.name,
                                        category: product.category,
                                        price: product.price,
                                        image: product.imageUrl,
                                        hoverImage: product.imageUrl,
                                        description: product.description
                                    }
                                    return <ProductCard key={product.id} {...cardProps} />
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Simple Footer Note */}
            <footer className="border-t py-12 mt-20">
                <div className="container text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-4">AthletiQ Official Store</p>
                    <div className="flex justify-center gap-6">
                        {['Returns', 'Shipping', 'Track Order', 'FAQ', 'Contact'].map(item => (
                            <a key={item} href="#" className="text-xs font-bold uppercase cursor-pointer hover:text-teal-600 transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

function ToolbarIconButton({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={cn(
                "w-8 h-8 rounded-sm",
                active ? "bg-stone-100 text-black" : "text-stone-400 hover:text-stone-600"
            )}
        >
            {icon}
        </Button>
    )
}


