import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, MapPin, User, Mail, GraduationCap, Award } from "lucide-react"

interface ApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
}

export function ApplicationModal({ isOpen, onClose, application }: ApplicationModalProps) {
    if (!isOpen || !application) return null

    const { athlete, opportunity } = application

    // Format date safely
    const formattedDob = athlete.dateOfBirth ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(athlete.dateOfBirth)) : 'Unknown'
    const formattedApplied = application.appliedAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(application.appliedAt)) : 'Unknown'

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-3xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4 sticky top-0 bg-white z-10">
                    <div>
                        <CardTitle>Application Review</CardTitle>
                        <CardDescription>
                            {athlete.firstName} {athlete.lastName} applied for <strong>{opportunity?.title}</strong> on {formattedApplied}
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-8 pt-6">
                    {/* Athlete Cover Letter & Notes */}
                    <section className="space-y-3 bg-stone-50 p-6 rounded-lg border">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Mail className="h-5 w-5 text-blue-600" /> Cover Letter
                        </h3>
                        {application.coverLetter ? (
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{application.coverLetter}</p>
                        ) : (
                            <p className="text-muted-foreground italic text-sm">No cover letter provided.</p>
                        )}

                        {application.notes && (
                            <div className="mt-4 pt-4 border-t border-stone-200">
                                <h4 className="text-sm font-semibold mb-1">Additional Notes</h4>
                                <p className="text-sm text-stone-600 italic">"{application.notes}"</p>
                            </div>
                        )}
                    </section>

                    {/* Athlete Profile Data */}
                    <section className="space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-green-600" /> Applicant Profile
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Personal Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Gender</span>
                                            <span className="font-medium">{athlete.gender}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Date of Birth</span>
                                            <span className="font-medium">{formattedDob}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Location</span>
                                            <span className="font-medium flex items-center gap-1">
                                                {athlete.location || 'N/A'} <MapPin className="h-3 w-3 text-stone-400" />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Physical Stats</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Height</span>
                                            <span className="font-medium">{athlete.height ? `${athlete.height} cm` : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Weight</span>
                                            <span className="font-medium">{athlete.weight ? `${athlete.weight} kg` : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Award className="h-3 w-3" /> Sports Experience
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Primary Sport</span>
                                            <span className="font-medium">{athlete.primarySport}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Position</span>
                                            <span className="font-medium">{athlete.position || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-1">
                                            <span className="text-stone-500">Experience Level</span>
                                            <Badge variant="secondary" className="font-normal">{athlete.experience || 'N/A'}</Badge>
                                        </div>
                                    </div>
                                </div>

                                {athlete.currentSchool && (
                                    <div>
                                        <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <GraduationCap className="h-3 w-3" /> Academics
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b pb-1">
                                                <span className="text-stone-500">School</span>
                                                <span className="font-medium">{athlete.currentSchool}</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-1">
                                                <span className="text-stone-500">Grad Year / GPA</span>
                                                <span className="font-medium">{athlete.graduationYear || '?'} / {athlete.gpa || '?'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {athlete.achievements && athlete.achievements.length > 0 && (
                            <div>
                                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Key Achievements</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {athlete.achievements.map((ach: string, i: number) => (
                                        <li key={i} className="text-sm">{ach}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {athlete.bio && (
                            <div>
                                <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Athlete Bio</h4>
                                <p className="text-sm border-l-2 border-stone-200 pl-3 italic">{athlete.bio}</p>
                            </div>
                        )}
                    </section>

                </CardContent>
                <CardFooter className="border-t pt-4 sticky bottom-0 bg-white z-10 flex justify-between">
                    <Badge variant="outline" className={`
            ${application.status === 'PENDING' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            application.status === 'SHORTLISTED' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                application.status === 'ACCEPTED' ? 'border-green-200 text-green-700 bg-green-50' :
                                    'border-stone-200 text-stone-700 bg-stone-50'}
          `}>
                        Current Status: {application.status}
                    </Badge>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Close Review</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
