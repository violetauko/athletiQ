"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Ruler,
  Weight,
  Briefcase,
  Trophy,
  FileText,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Application, ApplicationStatus } from "@/app/types/athlete";
import { updateApplicationStatus } from "@/lib/applications";

interface ApplicationDetailsModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  userType: "client" | "athlete";
}

const statusColors: Record<ApplicationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWING: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-blue-300 text-blue-800",
  INTERVIEWED: "bg-blue-500 text-blue-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
  userType,
}: ApplicationDetailsModalProps) {
  const [notes, setNotes] = useState(application.notes || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: ApplicationStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateApplicationStatus(application.id, status, notes);
      if (result.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        // Refresh or update the application data
        onClose();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const isExternalUrl = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:");
  };

  const handleFileOpen = async (url: string) => {
    if (!url) return;
    
    if (isExternalUrl(url)) {
      window.open(url, "_blank");
      return;
    }

    // Legacy filename resolution
    const resolveToastId = toast.loading("Resolving legacy document link...");
    try {
      const response = await fetch(`/api/documents/resolve?filename=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error("Document not found");
      }
      const data = await response.json();
      toast.success("Document found", { id: resolveToastId });
      window.open(data.url, "_blank");
    } catch (error) {
      console.error("Failed to resolve document:", error);
      toast.error("This document was uploaded using an older version of the system and may be unavailable.", { id: resolveToastId });
    }
  };

  const handleDownloadFile = (url: string) => {
    handleFileOpen(url);
  };

  const handlePreviewFile = (url: string) => {
    handleFileOpen(url);
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "PPP");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Application Details</span>
            <Badge className={statusColors[application.status]}>
              {application.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opportunity Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opportunity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <h3 className="font-semibold text-xl">{application?.Opportunity?.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {application?.Opportunity?.type}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {application?.Opportunity?.location}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Athlete Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Athlete Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {application.firstName} {application.lastName}
                    </span>
                  </div>
                  {application.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                        {application.email}
                      </a>
                    </div>
                  )}
                  {application.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${application.phone}`} className="text-blue-600 hover:underline">
                        {application.phone}
                      </a>
                    </div>
                  )}
                  {application.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Born: {formatDate(application.dateOfBirth)}</span>
                    </div>
                  )}
                  {application.city && application.state && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{application.city}, {application.state}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {(application.height || application.weight) && (
                    <>
                      {application.height && (
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span>{application.height} cm</span>
                        </div>
                      )}
                      {application.weight && (
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <span>{application.weight} kg</span>
                        </div>
                      )}
                    </>
                  )}
                  {application.position && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>Position: {application.position}</span>
                    </div>
                  )}
                  {application.experience && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>{application.experience} years experience</span>
                    </div>
                  )}
                  {application.currentTeam && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Current Team:</span>
                      <span>{application.currentTeam}</span>
                    </div>
                  )}
                </div>
              </div>

              {application.achievements && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Achievements
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.achievements}
                  </p>
                </div>
              )}

              {application.stats && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Statistics</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.stats}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.coverLetter && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Cover Letter
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {application.resumeFileName && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewFile(application.resumeFileName!)}
                      className="flex-1 justify-start"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Resume
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(application.resumeFileName!)}
                      className="w-10 px-0 flex items-center justify-center"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {application.portfolioFileNames && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewFile(application.portfolioFileNames!)}
                      className="flex-1 justify-start"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Portfolio
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(application.portfolioFileNames!)}
                      className="w-10 px-0 flex items-center justify-center"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {application.additionalDocsFileNames && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewFile(application.additionalDocsFileNames!)}
                      className="flex-1 justify-start"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Additional Docs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(application.additionalDocsFileNames!)}
                      className="w-10 px-0 flex items-center justify-center"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Management (Client Only) */}
          {userType === "client" && application.status !== "ACCEPTED" && application.status !== "REJECTED" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Notes (optional)
                  </label>
                  <Textarea
                    placeholder="Add notes about this application..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleStatusUpdate("ACCEPTED")}
                    disabled={isUpdating}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Accept Application
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("REJECTED")}
                    disabled={isUpdating}
                    variant="destructive"
                    className="flex-1"
                  >
                    Reject Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground text-right space-y-1">
            <p>Applied: {formatDate(application.appliedAt)}</p>
            {application.updatedAt !== application.appliedAt && (
              <p>Last updated: {formatDate(application.updatedAt)}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}