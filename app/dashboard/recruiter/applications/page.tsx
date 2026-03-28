
"use client";
import { Application } from "@/app/types/athlete";
import { ApplicationDetailsModal } from "@/components/applications/application-details-modal";
import ApplicationsTable from "@/components/applications/applications-table"
import { useState } from "react";

export default function ClientApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your opportunity applications
          </p>
        </div>

        <ApplicationsTable
          userType="client"
          onViewDetails={handleViewDetails}
        />

        {selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            userType="client"
          />
        )}
      </div>
    </div>
  );
}