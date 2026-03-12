// components/admin/PaymentDetailsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Calendar, User, CreditCard, Download, RefreshCw } from 'lucide-react'

interface PaymentDetailsModalProps {
    payment: any | null
    isOpen: boolean
    onClose: () => void
}

export function PaymentDetailsModal({ payment, isOpen, onClose }: PaymentDetailsModalProps) {
    if (!payment) return null

    const getStatusBadge = (status: string) => {
        const styles = {
            COMPLETED: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            FAILED: 'bg-red-100 text-red-800',
        }
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
    }

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'STRIPE': return '💳'
            case 'MPESA': return '📱'
            case 'STANBIC_MPESA': return '📱'
            case 'PAYPAL': return '🅿️'
            case 'PESAPAL': return '💵'
            default: return '💰'
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'long'
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Amount */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge className={getStatusBadge(payment.status)}>
                                {payment.status}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="text-3xl font-bold">
                                {formatCurrency(payment.amount, payment.currency, false)}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* User Information */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            User Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{payment.user?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{payment.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">User ID</p>
                                <p className="font-mono text-sm">{payment.userId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Details
                        </h3>
                        <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment ID</p>
                                    <p className="font-mono text-sm">{payment.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Provider</p>
                                    <p>
                                        <span className="mr-2">{getProviderIcon(payment.provider)}</span>
                                        {payment.provider.replace('_', ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Merchant Reference</p>
                                    <p className="font-mono text-sm">{payment.merchantReference || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Receipt Number</p>
                                    <p className="font-mono text-sm">{payment.receiptNumber || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Provider References */}
                    {payment.referenceId && (
                        <div>
                            <h3 className="font-semibold mb-3">Provider Reference</h3>
                            <div className="bg-stone-50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    {payment.provider === 'MPESA' ? 'Checkout Request ID' : 'Reference ID'}
                                </p>
                                <p className="font-mono text-sm">{payment.referenceId}</p>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Timeline
                        </h3>
                        <div className="bg-stone-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Created:</span>
                                <span className="text-sm">{formatDate(payment.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Last Updated:</span>
                                <span className="text-sm">{formatDate(payment.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        {payment.status === 'PENDING' && payment.provider === 'MPESA' && (
                            <Button variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Check Status
                            </Button>
                        )}
                        {payment.status === 'COMPLETED' && (
                            <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download Receipt
                            </Button>
                        )}
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}