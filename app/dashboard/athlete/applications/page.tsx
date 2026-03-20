import ApplicationsTable from "@/components/applications/applications-table"


export default function AthleteApplicationsPage() {
    return (
        <div className="min-h-screen py-4 md:py-8">
            <div className="container mx-auto h-full">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">My Applications</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Track and manage your job applications
                    </p>
                </div>

                <ApplicationsTable userType="athlete" />
            </div>
        </div>
    )
}