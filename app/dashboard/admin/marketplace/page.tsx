'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ShoppingBag, TrendingUp, DollarSign, Wallet } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminMarketplaceDashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [platformRevenue, setPlatformRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch('/api/admin/marketplace/stats')

        if (res.ok) {
          const data = await res.json()
          setTotalProducts(data.totalProducts || 0)
          setTotalOrders(data.totalOrders || 0)
          setTotalRevenue(data.totalRevenue || 0)
          setPlatformRevenue(data.platformRevenue || 0)
        }
      } catch (error) {
        toast.error('Failed to load marketplace statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-muted-foreground mt-2">
            Overview of your eCommerce operations and active orders.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/finances#marketplace-purchases">
              <TrendingUp className="w-4 h-4 mr-2" />
              Purchase analytics
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/marketplace/orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Manage Orders
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/admin/marketplace/products">
              <Package className="w-4 h-4 mr-2" />
              Manage Products
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <span className="animate-pulse">...</span> : totalProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Listed in the marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <span className="animate-pulse">...</span> : totalOrders}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Orders placed so far</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">From delivered orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Earnings</CardTitle>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES {platformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">20% retained by platform</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
