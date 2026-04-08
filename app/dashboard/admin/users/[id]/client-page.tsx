'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Trophy,
  DollarSign,
  MessageSquare,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MoreVertical,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  Video,
  Star,
  Users,
  Briefcase,
  Lock,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface UserDetailProps {
  user: any;
}

export default function UserDetailClient({ user }: UserDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CLIENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ATHLETE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setIsUpdatingRole(true);
    try {
      const response = await fetch(`/api/admin/users/${user?.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.info('Role updated', {
          description: `User role changed to ${newRole}`,
        });
        router.refresh();
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      toast.error('Error updating role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleVerifyClient = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user?.id}/verify`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Client verified', {
          description: 'The client has been verified successfully',
        });
        router.refresh();
      }
    } catch (error) {
      toast.error('Error verifying client', {
        description: 'Failed to verify client',
      });
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${user?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('User deleted', {
          description: 'The user has been deleted successfully',
        });
        router.push('/admin/users');
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user', {
        description: 'Failed to delete user',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSendingMessage(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      });

      if (response.ok) {
        toast.success('Message sent', {
          description: 'Your message has been sent to the user',
        });
        setIsSendingMessage(false);
      }
    } catch (error) {
      toast.error('Error sending message', {
        description: 'Failed to send message',
      });
    }
  };

  const handleImpersonate = async () => {
    try {
      const response = await fetch(`/api/admin/impersonate/${user?.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Error impersonating user', {
        description: 'Failed to impersonate user',
      });
    }
  };

  const handleSuspendUser = async () => {
    setIsSuspending(true);
    try {
      const response = await fetch(`/api/admin/users/${user?.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !user?.suspended }),
      });

      if (response.ok) {
        const action = user?.suspended ? 'unsuspended' : 'suspended';
        toast.success(`User ${action}`, {
          description: `The user has been ${action} successfully`,
        });
        setShowSuspendDialog(false);
        router.refresh();
      } else {
        throw new Error('Failed to suspend user');
      }
    } catch (error) {
      toast.error('Error suspending user', {
        description: 'Failed to suspend user',
      });
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image || ''} />
                  <AvatarFallback>{getInitials(user?.name || user?.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold flex items-center gap-2">
                    {user?.name || 'Unnamed User'}
                    <Badge className={getRoleBadgeColor(user?.role)}>
                      {user?.role}
                    </Badge>
                  </h1>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImpersonate}>
                    <Users className="w-4 h-4 mr-2" />
                    Impersonate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
                    <Lock className="w-4 h-4 mr-2" />
                    {user?.suspended ? 'Unsuspend User' : 'Suspend User'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteUser}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Message to {user?.name || user?.email}</DialogTitle>
                    <DialogDescription>
                      This message will be sent directly to the user's inbox.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSendMessage}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="Message subject"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Type your message here..."
                          rows={5}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSendingMessage}>
                        {isSendingMessage ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Suspend User Dialog */}
              <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {user?.suspended ? 'Unsuspend User' : 'Suspend User'}
                    </DialogTitle>
                    <DialogDescription>
                      {user?.suspended
                        ? 'This will restore the user\'s account access. They will be able to log in and use the platform again.'
                        : 'This will prevent the user from logging in or accessing the platform. They will not be able to perform any actions.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      User: <span className="font-medium">{user?.name || user?.email}</span>
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowSuspendDialog(false)}
                      disabled={isSuspending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant={user?.suspended ? 'default' : 'destructive'}
                      onClick={handleSuspendUser}
                      disabled={isSuspending}
                    >
                      {isSuspending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {user?.suspended ? 'Unsuspending...' : 'Suspending...'}
                        </>
                      ) : (
                        user?.suspended ? 'Unsuspend User' : 'Suspend User'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="athlete" disabled={!user?.AthleteProfile}>
              Athlete Profile
            </TabsTrigger>
            <TabsTrigger value="client" disabled={!user?.ClientProfile}>
              Client Profile
            </TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="text-2xl font-bold">
                        {format(new Date(user?.createdAt || new Date()), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-stone-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Applications</p>
                      <p className="text-2xl font-bold">{user?._count.applications}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Donations</p>
                      <p className="text-2xl font-bold">{user?._count.donations}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Messages</p>
                      <p className="text-2xl font-bold">{user?._count.contactSubmissions}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Detailed information about the user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Role</Label>
                      <div className="mt-1">
                        <Select
                          defaultValue={user?.role}
                          onValueChange={handleRoleChange}
                          disabled={isUpdatingRole}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="ATHLETE">Athlete</SelectItem>
                            <SelectItem value="CLIENT">Client</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Verified</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {user?.emailVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">
                              {format(new Date(user?.emailVerified), 'MMM d, yyyy')}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm">Not verified</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Account Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {user?.suspended ? (
                          <>
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium">Suspended</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Active</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Connected Accounts */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Connected Accounts</h4>
                    <div className="space-y-2">
                      {user?.accounts.map((account: any) => (
                        <div key={account.provider} className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-stone-400" />
                          <span className="capitalize">{account.provider}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{account.providerAccountId}</span>
                        </div>
                      ))}
                      {user?.accounts.length === 0 && (
                        <p className="text-sm text-muted-foreground">No connected accounts</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Recent Sessions */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Recent Sessions</h4>
                    <div className="space-y-2">
                      {user?.sessions.map((session: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-stone-400" />
                          <span>Expires: {format(new Date(session.expires), 'MMM d, yyyy')}</span>
                        </div>
                      ))}
                      {user?.sessions.length === 0 && (
                        <p className="text-sm text-muted-foreground">No active sessions</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions & Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage user account and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/admin/messages?userId=${user?.id}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View All Messages
                    </Link>
                  </Button>
                  
                  {user?.ClientProfile && !user?.ClientProfile.verified && (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-green-600"
                      onClick={handleVerifyClient}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Client
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-start text-amber-600"
                    onClick={() => handleRoleChange('ADMIN')}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Make Admin
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600"
                    onClick={() => setShowSuspendDialog(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {user?.suspended ? 'Unsuspend Account' : 'Suspend Account'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user?.applications.slice(0, 5).map((app: any) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <Badge variant="outline">Application</Badge>
                        </TableCell>
                        <TableCell>
                          {app.opportunity?.title}
                        </TableCell>
                        <TableCell>
                          {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Athlete Profile Tab */}
          {user?.AthleteProfile && (
            <TabsContent value="athlete" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                  <CardContent className="pt-6 text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={user?.AthleteProfile.profileImage || ''} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-1">
                      {user?.AthleteProfile.firstName} {user?.AthleteProfile.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user?.AthleteProfile.primarySport}
                    </p>
                    
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span>{user?.AthleteProfile.location || 'Location not set'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span>{user?.AthleteProfile.phone || 'Phone not set'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-stone-400" />
                        <span>{user?.AthleteProfile.currentSchool || 'School not set'}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">
                          {user?.AthleteProfile.profileViews}
                        </p>
                        <p className="text-xs text-muted-foreground">Profile Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">
                          {user?.AthleteProfile.gpa || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">GPA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Athlete Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                          <dd className="font-medium">
                            {user?.AthleteProfile.dateOfBirth 
                              ? format(new Date(user?.AthleteProfile.dateOfBirth), 'MMMM d, yyyy')
                              : 'Not provided'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Gender</dt>
                          <dd className="font-medium capitalize">{user?.AthleteProfile.gender || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Height / Weight</dt>
                          <dd className="font-medium">
                            {user?.AthleteProfile.height} cm / {user?.AthleteProfile.weight} kg
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Experience Level</dt>
                          <dd className="font-medium">{user?.AthleteProfile.experience || 'Not specified'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Position</dt>
                          <dd className="font-medium">{user?.AthleteProfile.position || 'Not specified'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Graduation Year</dt>
                          <dd className="font-medium">{user?.AthleteProfile.graduationYear || 'Not specified'}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">
                        {user?.AthleteProfile.bio || 'No bio provided'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {user?.AthleteProfile.achievements?.map((achievement: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <Trophy className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{achievement}</span>
                          </div>
                        ))}
                        {(!user?.AthleteProfile.achievements || user?.AthleteProfile.achievements.length === 0) && (
                          <p className="text-sm text-muted-foreground">No achievements listed</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Secondary Sports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {user?.AthleteProfile.secondarySports?.map((sport: string, index: number) => (
                          <Badge key={index} variant="outline">{sport}</Badge>
                        ))}
                        {(!user?.AthleteProfile.secondarySports || user?.AthleteProfile.secondarySports.length === 0) && (
                          <p className="text-sm text-muted-foreground">No secondary sports listed</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Video Highlights */}
                  {user?.AthleteProfile.videoHighlights?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Video Highlights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {user?.AthleteProfile.videoHighlights.map((video: string, index: number) => (
                            <div key={index} className="aspect-video bg-stone-100 rounded-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-stone-400" />
                              <span className="text-xs text-muted-foreground ml-2">Video {index + 1}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Client Profile Tab */}
          {user?.ClientProfile && (
            <TabsContent value="client" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                  <CardContent className="pt-6 text-center">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={user?.ClientProfile.logo || ''} />
                      <AvatarFallback>
                        {user?.ClientProfile.organization?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-1">
                      {user?.ClientProfile.organization}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user?.ClientProfile.position}
                    </p>
                    
                    <Badge className={user?.ClientProfile.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {user?.ClientProfile.verified ? 'Verified' : 'Pending Verification'}
                    </Badge>

                    <Separator className="my-4" />

                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-stone-400" />
                        <span>{user?.ClientProfile.phone || 'Phone not set'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span>{user?.ClientProfile.address || 'Address not set'}</span>
                      </div>
                      {user?.ClientProfile.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-stone-400" />
                          <a href={user?.ClientProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Organization</dt>
                          <dd className="font-medium">{user?.ClientProfile.organization}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Position</dt>
                          <dd className="font-medium">{user?.ClientProfile.position}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Member Since</dt>
                          <dd className="font-medium">
                            {format(new Date(user?.ClientProfile.createdAt), 'MMMM d, yyyy')}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Last Updated</dt>
                          <dd className="font-medium">
                            {format(new Date(user?.ClientProfile.updatedAt), 'MMMM d, yyyy')}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">
                        {user?.ClientProfile.bio || 'No bio provided'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>
                  All applications submitted by this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opportunity</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user?.applications.map((app: any) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.opportunity?.title}
                        </TableCell>
                        <TableCell>
                          {app.opportunity?.clientProfile?.organization}
                        </TableCell>
                        <TableCell>
                          {format(new Date(app.appliedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/applications/${app.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                  <CardDescription>
                    Messages sent through contact forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user?.contactSubmissions.map((submission: any) => (
                      <div key={submission.id} className="p-4 bg-stone-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{submission.subject}</h4>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(submission.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {submission.message}
                        </p>
                        {submission.response && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-600 font-medium">Response:</p>
                            <p className="text-sm">{submission.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Donations */}
              <Card>
                <CardHeader>
                  <CardTitle>Donations</CardTitle>
                  <CardDescription>
                    Donation history and tiers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user?.donations.map((donation: any) => (
                      <div key={donation.id} className="p-4 bg-stone-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-medium">${donation.amount}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {donation.tier && (
                          <Badge variant="outline" className="mt-2">
                            {donation.tier.name}
                          </Badge>
                        )}
                        {donation.message && (
                          <p className="text-sm text-muted-foreground mt-2">
                            "{donation.message}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
