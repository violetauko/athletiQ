'use client'

import React from 'react'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'

import { Input } from '@/components/ui/input'

interface MarketplaceFiltersProps {
    status: string;
    setStatus: (val: string) => void;
    minPrice: string;
    setMinPrice: (val: string) => void;
    maxPrice: string;
    setMaxPrice: (val: string) => void;
    category: string;
    setCategory: (val: string) => void;
}

// Helper for checkable items
function FilterItem({ label, isActive, onClick, count }: { label: string, isActive?: boolean, onClick?: () => void, count?: number }) {
    return (
        <div onClick={onClick} className="flex items-center justify-between group cursor-pointer py-1.5">
            <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 border rounded-sm transition-colors ${isActive ? 'bg-teal-500 border-teal-500' : 'border-stone-300 group-hover:border-teal-500'}`} />
                <span className={`text-sm transition-colors ${isActive ? 'text-black font-medium' : 'text-stone-600 group-hover:text-black'}`}>{label}</span>
            </div>
            {count !== undefined && <span className="text-xs text-stone-400 group-hover:text-stone-600">({count})</span>}
        </div>
    )
}

export function MarketplaceFilters({ 
    status, setStatus, 
    minPrice, setMinPrice, 
    maxPrice, setMaxPrice, 
    category, setCategory 
}: MarketplaceFiltersProps) {
    return (
        <aside className="w-full lg:block hidden">
            <div className="sticky top-24 space-y-8">
                {/* Product Categories */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Availability</h3>
                    <div className="space-y-1">
                        <FilterItem 
                            label="All Status" 
                            isActive={status === 'ALL'} 
                            onClick={() => setStatus('ALL')} 
                        />
                        <FilterItem 
                            label="In Stock" 
                            isActive={status === 'IN_STOCK'} 
                            onClick={() => setStatus('IN_STOCK')} 
                        />
                        <FilterItem 
                            label="Out of Stock" 
                            isActive={status === 'OUT_OF_STOCK'} 
                            onClick={() => setStatus('OUT_OF_STOCK')} 
                        />
                    </div>
                </div>

                <Separator className="bg-stone-100" />

                {/* Price Range */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Price</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Label className="text-[10px] uppercase text-stone-400">Min</Label>
                                <div className="flex items-center">
                                    <Input 
                                        type="number" 
                                        value={minPrice} 
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="KES 0"
                                        className="h-10 text-sm border-stone-200 rounded-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Label className="text-[10px] uppercase text-stone-400">Max</Label>
                                <div className="flex items-center">
                                    <Input 
                                        type="number" 
                                        value={maxPrice} 
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="KES 50000"
                                        className="h-10 text-sm border-stone-200 rounded-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-stone-100" />

                {/* Categories */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Product Category</h3>
                    <div className="space-y-1">
                        {['ALL', 'Apparel', 'Equipment', 'Accessories', 'Nutrition', 'Services', 'Other'].map(c => (
                            <FilterItem 
                                key={c}
                                label={c === 'ALL' ? 'All Categories' : c} 
                                isActive={category.toLowerCase() === c.toLowerCase()} 
                                onClick={() => setCategory(c === 'ALL' ? 'ALL' : c.toUpperCase())} 
                            />
                        ))}
                    </div>
                </div>

                <Separator className="bg-stone-100" />

                {/* Brands (Placeholder mapping for now as Prisma Product model doesn't have brand) */}
                <div className="opacity-50 pointer-events-none grayscale">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Brand <span className="text-[10px] float-right normal-case pt-1 font-normal text-stone-400">(Coming soon)</span></h3>
                    <div className="space-y-1">
                        <FilterItem label="Nike" count={0} />
                        <FilterItem label="Adidas" count={0} />
                        <FilterItem label="AthletiQ Pro" count={0} />
                        <FilterItem label="Under Armour" count={0} />
                    </div>
                </div>

                <Separator className="bg-stone-100" />

                {/* Colors (Placeholder) */}
                <div className="opacity-50 pointer-events-none grayscale">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Color <span className="text-[10px] float-right normal-case pt-1 font-normal text-stone-400">(Coming soon)</span></h3>
                    <div className="grid grid-cols-5 gap-2">
                        {['#000000', '#FFFFFF', '#14b8a6', '#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#a855f7', '#ec4899'].map((color, i) => (
                            <div 
                                key={i}
                                className="w-7 h-7 rounded-full border border-stone-200 cursor-pointer shadow-sm flex items-center justify-center p-0.5"
                                title={color}
                            >
                                <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}
