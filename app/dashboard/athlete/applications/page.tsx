import ApplicationsTable from "@/components/applications/applications-table"


export default function AthleteApplicationsPage() {
    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto max-w-7xl h-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">My Applications</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage your job applications
                    </p>
                </div>

                <ApplicationsTable userType="athlete" />
            </div>
        </div>
    )
}