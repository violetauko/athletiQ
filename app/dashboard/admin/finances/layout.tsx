"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Activity,
  DollarSign,
  CreditCard,
  FileText,
  RefreshCw,
} from "lucide-react"


export default function FinanceLayout({ children }: { children: React.ReactNode }){
  const pathname = usePathname()

  // Determine active tab from URL
  const getActiveTab = () => {
    if (pathname.includes("/donations")) return "bg-amber-200"
    if (pathname.includes("/payments")) return "bg-amber-200"
    return ""
  }

  const activeTab = getActiveTab()
  const tabs = [
  {
    label: "Overview",
    href: "/dashboard/admin/finances",
    icon: Activity,
    value: "overview",
  },
  {
    label: "Donations",
    href: "/dashboard/admin/finances/donations",
    icon: DollarSign,
    value: "donations",
  },
  {
    label: "Payments",
    href: "/dashboard/admin/finances/payments",
    icon: CreditCard,
    value: "payments",
  },
]

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Management</h1>
            <p className="text-muted-foreground mt-1">
              Track donations, payments, and transactions
            </p>
          </div>

          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button> */}
            <div></div>

            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div  className="space-y-4">
          <div className="grid w-full grid-cols-3 max-w-md">

            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive =
                pathname === tab.href ||
                (tab.value !== "overview" && pathname.startsWith(tab.href))

                return (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors
                    ${
                        isActive
                        ? "bg-white shadow text-foreground"
                        : "text-muted-foreground hover:bg-white/50"
                    }`}
                >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                </Link>
                )
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="mt-6">
          {children}
        </div>

      </div>
    </div>
  )
}
