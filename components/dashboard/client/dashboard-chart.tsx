// components/client/dashboard-charts.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'

interface ApplicationTrend {
    date: string
    count: number
}

interface CategoryDistribution {
    category: string
    count: number
}

interface DashboardStats {
    applicationRate: number
    interviewRate: number
    successRate: number
    totalApplicants: number
    newApplications: number
    reviewedApplications: number
    shortlistedApplications: number
    rejectedApplications: number
}

interface DashboardChartsProps {
    applicationTrends: ApplicationTrend[]
    categoryDistribution: CategoryDistribution[]
    stats: DashboardStats
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

export function DashboardCharts({ 
    applicationTrends, 
    categoryDistribution,
    stats 
}: DashboardChartsProps) {
    
    // Prepare pie chart data for application status
    const statusData = [
        { name: 'New', value: stats.newApplications, color: '#f59e0b' },
        { name: 'Reviewed', value: stats.reviewedApplications, color: '#3b82f6' },
        { name: 'Shortlisted', value: stats.shortlistedApplications, color: '#10b981' },
        { name: 'Rejected', value: stats.rejectedApplications, color: '#ef4444' }
    ].filter(item => item.value > 0)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Trend Line Chart */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Application Trends (Last 30 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={applicationTrends}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return `${date.getMonth()+1}/${date.getDate()}`
                                    }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    labelFormatter={(label) => {
                                        const date = new Date(label)
                                        return date.toLocaleDateString('en-US', { 
                                            month: 'long', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                    }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#f59e0b" 
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                    name="Applications"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Category Distribution Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Opportunities by Category
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={categoryDistribution}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis 
                                    type="category" 
                                    dataKey="category" 
                                    tick={{ fontSize: 12 }}
                                    width={100}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                                    {categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Application Status Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5" />
                        Application Status Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent ||0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {statusData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics Card */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Performance Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-amber-600 mb-2">
                                {stats.applicationRate.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                                Applications per Opportunity
                            </div>
                            <div className="w-full bg-stone-200 rounded-full h-2">
                                <div 
                                    className="bg-amber-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min(stats.applicationRate * 10, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {stats.interviewRate}%
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                                Interview Rate
                            </div>
                            <div className="w-full bg-stone-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${stats.interviewRate}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {stats.successRate}%
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                                Success Rate
                            </div>
                            <div className="w-full bg-stone-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${stats.successRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}