"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard, Smartphone, CheckCircle2, AlertCircle, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { PAYPAL_REGISTRATION_FEE_KES } from "@/lib/paypal-pricing";
import { WiseBankInstructions, type WiseBankPayload } from "@/components/payments/wise-bank-instructions";

export function AthletePaywall() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, update } = useSession();

    const [isLoading, setIsLoading] = useState(false);
    const [mpesaPhone, setMpesaPhone] = useState("");
    const [stanbicPhone, setStanbicPhone] = useState("");
    const [stkStatus, setStkStatus] = useState<"idle" | "polling" | "success" | "failed">({
        payment: searchParams.get("payment") === "success" ? "success" : "idle"
    }.payment as any);

    const [feePayPalOrderId, setFeePayPalOrderId] = useState<string | null>(null);
    const [preparingPayPalFee, setPreparingPayPalFee] = useState(false);
    const [feeWiseData, setFeeWiseData] = useState<{
        bank: WiseBankPayload;
        reference: string;
        amount: number;
        currency: string;
    } | null>(null);
    const [preparingWiseFee, setPreparingWiseFee] = useState(false);

    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
    const defaultEntryFeeKes = Number(process.env.NEXT_PUBLIC_ENTRY_FEE_AMOUNT ?? 1000);

    // Check for successful Stripe redirect 
    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            toast.success("Payment successful! Welcome to your dashboard.");
            refreshSessionAndReload();
        } else if (searchParams.get("payment") === "cancelled") {
            toast.error("Payment was cancelled.");
        }
    }, [searchParams]);

    const refreshSessionAndReload = async () => {
        // Update the next-auth session token to include hasPaidFee = true
        await update({ hasPaidFee: true });
        router.refresh(); // Reload server components
    };

    // Poll for payment status
    useEffect(() => {
        if (stkStatus !== "polling") return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/payment/status");
                if (res.ok) {
                    const data = await res.json();
                    if (data.hasPaidFee) {
                        clearInterval(interval);
                        setStkStatus("success");
                        toast.success("M-Pesa payment received!");
                        await refreshSessionAndReload();
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 10000); // Check every 10 seconds

        // Stop polling after 2 minutes (Mpesa timeout)
        const timeout = setTimeout(() => {
            if (stkStatus === "polling") {
                clearInterval(interval);
                setStkStatus("failed");
                toast.error("Payment timed out. Please try again.");
            }
        }, 5 * 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [stkStatus]);

    const handleStripeCheckout = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/payment/stripe/checkout", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to initiate checkout");
            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe
            }
        } catch (err: any) {
            toast.error(err.message);
            setIsLoading(false);
        }
    };

    const handlePesapalCheckout = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/payment/pesapal/initiate", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to initiate Pesapal checkout");
            if (data.redirect_url) {
                window.location.href = data.redirect_url; // Redirect to Pesapal iframe/hosted page
            }
        } catch (err: any) {
            toast.error(err.message);
            setIsLoading(false);
        }
    };

    const handleMpesaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mpesaPhone) return toast.error("Please enter a valid M-Pesa phone number");

        try {
            setIsLoading(true);
            setStkStatus("idle");

            const res = await fetch("/api/payment/mpesa/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: mpesaPhone }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to initiate M-Pesa Push");
            console.log("M-Pesa STK Push initiated:", data);

            toast.info("Check your phone! An M-Pesa prompt has been sent.");
            setStkStatus("polling");

        } catch (err: any) {
            toast.error(err.message);
            setStkStatus("failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStanbicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stanbicPhone) return toast.error("Please enter a valid M-Pesa phone number");

        try {
            setIsLoading(true);
            setStkStatus("idle");

            const res = await fetch("/api/payment/stanbic/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: stanbicPhone }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to initiate Stanbic Push");

            toast.info("Check your phone! An M-Pesa prompt has been sent via Stanbic.");
            setStkStatus("polling");

        } catch (err: any) {
            toast.error(err.message);
            setStkStatus("failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (stkStatus === "success" || session?.user.hasPaidFee) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">Payment Complete</h2>
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
                <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4" />
            </div>
        );
    }

    const prepareFeeWise = async () => {
        try {
            setPreparingWiseFee(true);
            const res = await fetch("/api/payment/wise/registration", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Wise is not available");
            setFeeWiseData({
                bank: data.bank,
                reference: data.reference,
                amount: data.amount,
                currency: data.currency,
            });
            toast.success("Transfer details ready — pay in Wise with the reference shown.");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Wise failed");
        } finally {
            setPreparingWiseFee(false);
        }
    };

    const prepareFeePayPal = async () => {
        try {
            setPreparingPayPalFee(true);
            const res = await fetch("/api/payment/paypal/create-order", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to start PayPal");
            setFeePayPalOrderId(data.id);
            toast.success("PayPal order ready — complete payment below.");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "PayPal failed");
        } finally {
            setPreparingPayPalFee(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] py-12 px-4">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl">Complete Registration</CardTitle>
                    <CardDescription>
                        A one-time entry fee is required to access the athlete dashboard and apply to opportunities.
                        Most methods: <strong>KES {defaultEntryFeeKes.toLocaleString()}</strong>. PayPal:{" "}
                        <strong>KES {PAYPAL_REGISTRATION_FEE_KES.toLocaleString()}</strong>. Wise: bank transfer for{" "}
                        <strong>KES {defaultEntryFeeKes.toLocaleString()}</strong> (confirmed manually after arrival).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="mpesa" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 gap-1">
                            <TabsTrigger value="mpesa" disabled={stkStatus === "polling"} className="text-xs sm:text-sm px-1">
                                <Smartphone className="w-4 h-4 mr-1 hidden sm:inline" />
                                M-Pesa
                            </TabsTrigger>
                            <TabsTrigger value="paypal" disabled={stkStatus === "polling"} className="text-xs sm:text-sm px-1">
                                <CreditCard className="w-4 h-4 mr-1 hidden sm:inline" />
                                PayPal
                            </TabsTrigger>
                            <TabsTrigger value="wise" disabled={stkStatus === "polling"} className="text-xs sm:text-sm px-1">
                                <Landmark className="w-4 h-4 mr-1 hidden sm:inline" />
                                Wise
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pesapal" className="space-y-4">
                            <div className="py-6 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Pay securely via Pesapal (supports M-Pesa, Airtel Money, and Cards).
                                </p>
                                <Button onClick={handlePesapalCheckout} className="w-full" disabled={isLoading || stkStatus === "polling"}>
                                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Pay KES 1,000 via Pesapal
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="mpesa">
                            {stkStatus === "polling" ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                        <Smartphone className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <h3 className="font-semibold text-lg">Waiting for payment...</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Please check your phone and enter your M-Pesa PIN to complete the transaction.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleMpesaSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">M-Pesa Phone Number</Label>
                                        <Input
                                            id="phone"
                                            placeholder="e.g. 0712345678 or 2547..."
                                            value={mpesaPhone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    {stkStatus === "failed" && (
                                        <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                            Payment failed or timed out. Please try again.
                                        </div>
                                    )}
                                    <Button type="submit" className="w-full bg-[#52B44B] hover:bg-[#429E3C] text-white" disabled={isLoading || !mpesaPhone}>
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Pay KES 1,000 via M-Pesa
                                    </Button>
                                </form>
                            )}
                        </TabsContent>

                        <TabsContent value="stanbic">
                            {stkStatus === "polling" ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                        <Smartphone className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <h3 className="font-semibold text-lg">Waiting for payment...</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Please check your phone and enter your M-Pesa PIN to complete the Stanbic transaction.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleStanbicSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stanbicPhone">M-Pesa Phone Number</Label>
                                        <Input
                                            id="stanbicPhone"
                                            placeholder="e.g. 0712345678"
                                            value={stanbicPhone}
                                            onChange={(e) => setStanbicPhone(e.target.value)}
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    {stkStatus === "failed" && (
                                        <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                            Payment failed or timed out. Please try again.
                                        </div>
                                    )}
                                    <Button type="submit" className="w-full bg-[#0033A1] hover:bg-[#002277] text-white" disabled={isLoading || !stanbicPhone}>
                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Pay KES 1,000 via Stanbic
                                    </Button>
                                </form>
                            )}
                        </TabsContent>

                        <TabsContent value="wise" className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Pay the entry fee from Wise or your bank using the details below. Access is enabled after an admin confirms your transfer.
                            </p>
                            {!feeWiseData ? (
                                <Button
                                    type="button"
                                    className="w-full"
                                    disabled={preparingWiseFee || stkStatus === "polling"}
                                    onClick={prepareFeeWise}
                                >
                                    {preparingWiseFee ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Get Wise transfer details
                                </Button>
                            ) : (
                                <WiseBankInstructions
                                    bank={feeWiseData.bank}
                                    reference={feeWiseData.reference}
                                    amount={feeWiseData.amount}
                                    currency={feeWiseData.currency}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="paypal" className="space-y-4">
                            {!paypalClientId ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    PayPal is not configured.
                                </p>
                            ) : (
                                <>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Pay with PayPal or card via PayPal. Prepare the order once, then complete payment.
                                    </p>
                                    {!feePayPalOrderId ? (
                                        <Button
                                            type="button"
                                            className="w-full"
                                            disabled={preparingPayPalFee || stkStatus === "polling"}
                                            onClick={prepareFeePayPal}
                                        >
                                            {preparingPayPalFee ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : null}
                                            Prepare PayPal checkout
                                        </Button>
                                    ) : (
                                        <div className="min-h-[140px]">
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect" }}
                                                createOrder={() => Promise.resolve(feePayPalOrderId)}
                                                onApprove={async (data) => {
                                                    const res = await fetch("/api/payment/paypal/capture", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ orderID: data.orderID }),
                                                    });
                                                    const json = await res.json();
                                                    if (!res.ok) {
                                                        throw new Error(json.error || "Payment failed");
                                                    }
                                                    toast.success("Payment successful! Welcome to your dashboard.");
                                                    setFeePayPalOrderId(null);
                                                    await refreshSessionAndReload();
                                                }}
                                                onError={(err) => {
                                                    console.error(err);
                                                    toast.error("PayPal error — try again or use M-Pesa.");
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 pb-4">
                    <p className="text-xs text-muted-foreground flex items-center">
                        Payments are securely processed. Need help? <a href="/contact" className="underline ml-1">Contact Support</a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
