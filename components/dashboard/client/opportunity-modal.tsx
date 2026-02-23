import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"

// Ensure we have a type from the api payload
interface OpportunityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any; // If editing
}

export function OpportunityModal({ isOpen, onClose, onSubmit, initialData }: OpportunityModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!initialData

    if (!isOpen) return null

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        // Map array fields correctly by splitting commas
        const requirements = String(formData.get("requirements") || "").split(",").map(s => s.trim()).filter(Boolean)
        const benefits = String(formData.get("benefits") || "").split(",").map(s => s.trim()).filter(Boolean)

        const payload = {
            title: formData.get("title"),
            sport: formData.get("sport"),
            category: formData.get("category"),
            location: formData.get("location"),
            city: formData.get("city") || undefined,
            state: formData.get("state") || undefined,
            type: formData.get("type"),
            salaryMin: formData.get("salaryMin") ? parseInt(formData.get("salaryMin") as string, 10) : undefined,
            salaryMax: formData.get("salaryMax") ? parseInt(formData.get("salaryMax") as string, 10) : undefined,
            description: formData.get("description"),
            requirements,
            benefits,
            deadline: formData.get("deadline") || undefined,
        }

        try {
            await onSubmit(payload)
            onClose()
        } catch (err) {
            console.error(err)
            alert("Failed to save opportunity. Please check details and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4 sticky top-0 bg-white z-10">
                        <div>
                            <CardTitle>{isEditing ? "Edit Opportunity" : "Create Opportunity"}</CardTitle>
                            <CardDescription>
                                {isEditing ? "Update details for this job posting." : "Fill out the details below. Note: New opportunities require Admin approval."}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" type="button" onClick={onClose} disabled={isLoading}>
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title *</Label>
                                <Input id="title" name="title" required defaultValue={initialData?.title} placeholder="e.g. Lead Academy Coach" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Employment Type *</Label>
                                <Input id="type" name="type" required defaultValue={initialData?.type} placeholder="e.g. FULL_TIME, CONTRACT" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sport">Sport *</Label>
                                <Input id="sport" name="sport" required defaultValue={initialData?.sport} placeholder="e.g. Soccer, Basketball" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Input id="category" name="category" required defaultValue={initialData?.category} placeholder="e.g. Coaching, Administration" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location Type *</Label>
                                <Input id="location" name="location" required defaultValue={initialData?.location} placeholder="e.g. On-site, Remote" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" defaultValue={initialData?.city} placeholder="e.g. London" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State / Region</Label>
                                <Input id="state" name="state" defaultValue={initialData?.state} placeholder="e.g. Greater London" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="salaryMin">Min Salary ($)</Label>
                                <Input id="salaryMin" name="salaryMin" type="number" defaultValue={initialData?.salaryMin} placeholder="Optional" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salaryMax">Max Salary ($)</Label>
                                <Input id="salaryMax" name="salaryMax" type="number" defaultValue={initialData?.salaryMax} placeholder="Optional" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={initialData?.description}
                                placeholder="Describe the responsibilities and daily tasks."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements * (Comma-separated)</Label>
                            <textarea
                                id="requirements"
                                name="requirements"
                                required
                                rows={2}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={initialData?.requirements?.join(", ")}
                                placeholder="e.g. UEFA B License, 3+ years experience, Strong communication"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="benefits">Benefits (Comma-separated)</Label>
                            <textarea
                                id="benefits"
                                name="benefits"
                                rows={2}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={initialData?.benefits?.join(", ")}
                                placeholder="e.g. Health Insurance, Relocation Assistance"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deadline">Application Deadline</Label>
                            <Input
                                id="deadline"
                                name="deadline"
                                type="date"
                                defaultValue={initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="border-t pt-4 sticky bottom-0 bg-white z-10 flex justify-end gap-3">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-black text-white hover:bg-black/90" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Save Changes" : "Create Opportunity"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
