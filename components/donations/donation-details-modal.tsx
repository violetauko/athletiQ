// components/admin/DonationDetailsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { Calendar, Mail, User, MessageSquare, CreditCard, Download } from 'lucide-react'

interface DonationDetailsModalProps {
    donation: any | null
    isOpen: boolean
    onClose: () => void
}

export function DonationDetailsModal({ donation, isOpen, onClose }: DonationDetailsModalProps) {
    if (!donation) return null

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PAID: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            FAILED: 'bg-red-100 text-red-800',
            REFUNDED: 'bg-purple-100 text-purple-800',
        }
        return styles[status] || 'bg-gray-100 text-gray-800'
    }

    const statusLabel = (status: string) =>
        ({ PAID: 'Paid', COMPLETED: 'Paid', PENDING: 'Pending', FAILED: 'Failed', REFUNDED: 'Refunded' } as Record<string, string>)[status] ?? status

    const settled = donation.status === 'PAID' || donation.status === 'COMPLETED'

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
                    <DialogTitle>Donation Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Amount */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge className={getStatusBadge(donation.status)}>
                                {statusLabel(donation.status)}
                            </Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                {settled ? 'Gross Amount (collected)' : 'Stated amount (not collected)'}
                            </p>
                            <p className="text-3xl font-bold">
                                {formatCurrency(donation.amount, donation.currency, false)}
                            </p>
                            {settled ? (
                                <div className="mt-2 text-xs font-medium space-y-1">
                                    <p className="text-blue-600">
                                        Athlete Share (80%): {formatCurrency(donation.amount * 0.8, donation.currency, false)}
                                    </p>
                                    <p className="text-purple-600">
                                        Platform Commission (20%): {formatCurrency(donation.amount * 0.2, donation.currency, false)}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Splits apply only after payment succeeds. Failed or pending donations do not move funds.
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Donor Information */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Donor Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{donation.donorName || 'Anonymous'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{donation.donorEmail || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {donation.message && (
                        <>
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Message
                                </h3>
                                <div className="bg-stone-50 p-4 rounded-lg">
                                    <p className="italic">{donation.message}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Transaction Details */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Transaction Details
                        </h3>
                        <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono text-sm">{donation.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tier</p>
                                    <p className="font-medium capitalize">{donation.tierId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Custom Amount</p>
                                    <p>{donation.isCustom ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <p>
                                        {donation.stripeSessionId && 'Stripe'}
                                        {donation.paypalOrderId && 'PayPal'}
                                        {donation.pesapalOrderId && 'PesaPal'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* External References */}
                    {(donation.stripeSessionId || donation.stripePaymentId ||
                        donation.paypalOrderId || donation.pesapalOrderId) && (
                            <>
                                <div>
                                    <h3 className="font-semibold mb-3">External References</h3>
                                    <div className="bg-stone-50 p-4 rounded-lg space-y-2">
                                        {donation.stripeSessionId && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Stripe Session</p>
                                                <p className="font-mono text-sm">{donation.stripeSessionId}</p>
                                            </div>
                                        )}
                                        {donation.stripePaymentId && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Stripe Payment</p>
                                                <p className="font-mono text-sm">{donation.stripePaymentId}</p>
                                            </div>
                                        )}
                                        {donation.paypalOrderId && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">PayPal Order</p>
                                                <p className="font-mono text-sm">{donation.paypalOrderId}</p>
                                            </div>
                                        )}
                                        {donation.pesapalOrderId && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">PesaPal Order</p>
                                                <p className="font-mono text-sm">{donation.pesapalOrderId}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
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
                                <span className="text-sm">{formatDate(donation.createdAt)}</span>
                            </div>
                            {donation.paidAt && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Paid:</span>
                                    <span className="text-sm">{formatDate(donation.paidAt)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Last Updated:</span>
                                <span className="text-sm">{formatDate(donation.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        {settled && (
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