import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OpportunityDetail } from "@/lib/types/types";
import { Eye, Download, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";

type SortableField =
  | "firstName"
  | "position"
  | "status"
  | "appliedAt"
  | "updatedAt"
  | "dateOfBirth";

const ApplicationsViewTable = ({ opportunity }:{opportunity: OpportunityDetail}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortableField>("appliedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const isExternalUrl = (url: string) => {
    return url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:"));
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

  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedApplications = [...opportunity.Application].sort((a, b) => {
    let aVal: string | number = a[sortField];
    let bVal: string | number = b[sortField];
    
    if (sortField === "appliedAt" || sortField === "updatedAt" || sortField === "dateOfBirth") {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    }
    
    if (typeof aVal === "string" && sortField !== "appliedAt" && sortField !== "updatedAt" && sortField !== "dateOfBirth") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusBadgeVariant = (status: string): "secondary" | "destructive" | "outline" | "default" | undefined => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "secondary";
      case "accepted":
      case "approved":
        return "default";
      case "rejected":
      case "declined":
        return "destructive";
      case "under review":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString:string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("firstName")}
              >
                Athlete {sortField === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("position")}
              >
                Position {sortField === "position" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Physical</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("appliedAt")}
              >
                Applied {sortField === "appliedAt" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications.map((app) => (
              <Fragment key={app.id}>
                <TableRow 
                  key={app.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)}
                >
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedRow === app.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-30 overflow-clip">
                      <p className="font-medium">{app.firstName} {app.lastName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline">{app.position || "N/A"}</Badge>
                        </TooltipTrigger>
                        {app.experience && (
                          <TooltipContent>
                            <p>{app.experience} years experience</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {app.email && <p className="truncate max-w-[150px]">{app.email}</p>}
                      {app.phone && <p className="text-xs text-muted-foreground">{app.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {app.height && app.weight && (
                      <div className="text-sm">
                        <p>{app.height} cm / {app.weight} kg</p>
                        {app.dateOfBirth && (
                          <p className="text-xs text-muted-foreground">
                            Age: {new Date().getFullYear() - new Date(app.dateOfBirth).getFullYear()}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status || "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatDate(app.appliedAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {formatDate(app.updatedAt)}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
                
                {expandedRow === app.id && (
                  <TableRow key={`${app.id}-details`}>
                    <TableCell colSpan={7} className="bg-muted/30 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Personal & Contact */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Personal Information</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm overflow-clip">
                            <div>
                              <p className="text-muted-foreground">Full Name</p>
                              <p className="font-medium">{app.firstName} {app.lastName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Date of Birth</p>
                              <p>{formatDate(app.dateOfBirth)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="truncate">{app.email}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Phone</p>
                              <p>{app.phone}</p>
                            </div>
                          </div>

                          <h4 className="font-semibold">Address</h4>
                          <p className="text-sm">
                            {app.address}<br />
                            {app.city}, {app.state}
                          </p>

                          <h4 className="font-semibold">Athlete Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Team</p>
                              <p>{app.currentTeam || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Experience</p>
                              <p>{app.experience} years</p>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Application Details */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Application Details</h4>
                          
                          {app.coverLetter && (
                            <div>
                              <p className="text-muted-foreground mb-1">Cover Letter</p>
                              <p className="text-sm bg-background p-3 rounded-md border">
                                {app.coverLetter}
                              </p>
                            </div>
                          )}

                          {app.stats && (
                            <div>
                              <p className="text-muted-foreground mb-1">Statistics</p>
                              <p className="text-sm bg-background p-3 rounded-md border">
                                {app.stats}
                              </p>
                            </div>
                          )}

                          {app.achievements && (
                            <div>
                              <p className="text-muted-foreground mb-1">Achievements</p>
                              <p className="text-sm bg-background p-3 rounded-md border">
                                {app.achievements}
                              </p>
                            </div>
                          )}

                          {app.notes && (
                            <div>
                              <p className="text-muted-foreground mb-1">Notes</p>
                              <p className="text-sm italic">{app.notes}</p>
                            </div>
                          )}

                          {/* Documents Section */}
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2">Documents</h4>
                            <div className="flex flex-wrap gap-2">
                              {app.resumeFileName && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2"
                                  onClick={() => handleFileOpen(app.resumeFileName!)}
                                >
                                  <FileText className="h-4 w-4" />
                                  Resume
                                </Button>
                              )}
                              {app.portfolioFileNames && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2"
                                  onClick={() => handleFileOpen(app.portfolioFileNames!)}
                                >
                                  <FileText className="h-4 w-4" />
                                  Portfolio
                                </Button>
                              )}
                              {app.additionalDocsFileNames && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2"
                                  onClick={() => handleFileOpen(app.additionalDocsFileNames!)}
                                >
                                  <FileText className="h-4 w-4" />
                                  Additional Doc
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Full Profile
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Download All
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ApplicationsViewTable;