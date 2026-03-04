// app/admin/tokens/page.tsx
import { PasswordResetTokenService } from '@/lib/password-reset-token';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { prisma } from '@/lib/prisma';
async function fetchTokenList() {
    // Fetch token list from your API or database
    return prisma.passwordResetToken.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit to latest 20 tokens for display
    });
}

export const dynamic = 'force-dynamic';

export default async function TokenManagementPage() {
  const stats = await PasswordResetTokenService.getTokenStats();
  const tokens = await fetchTokenList();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Token Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <Key className="w-8 h-8 text-stone-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Used Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{stats?.used || 0}</div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">{stats?.expired || 0}</div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add token list and management UI here */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Token ID</TableCell>
            <TableCell>User Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Expires At</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Map through tokens and display them here */}
            {tokens.map((token) => (
                <TableRow key={token.id}>
                    <TableCell>{token.id}</TableCell>
                    <TableCell>{token.identifier}</TableCell>
                    <TableCell>
                        {token.expires > new Date() ? (
                            <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                Active
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <XCircle className="w-4 h-4 text-red-500 mr-2" />
                                Expired
                            </div>
                        )}
                    </TableCell>
                    <TableCell>{token.createdAt.toLocaleString()}</TableCell>
                    <TableCell>{token.expires.toLocaleString()}</TableCell>
                </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}