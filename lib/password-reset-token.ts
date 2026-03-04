// lib/auth/password-reset-token.ts
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { addHours, isAfter } from 'date-fns';

export interface CreateTokenOptions {
  identifier: string; // email or userId
  userId?: string;
  expiresInHours?: number;
}

export interface TokenValidationResult {
  valid: boolean;
  token?: any;
  error?: string;
  identifier?: string;
}

export class PasswordResetTokenService {
  /**
   * Generate a secure random token
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a user-friendly code (for multi-channel verification)
   */
  static generateCode(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  /**
   * Create a new password reset token
   */
  static async createToken({ 
    identifier, 
    userId, 
    expiresInHours = 1 
  }: CreateTokenOptions) {
    try {
      // Delete any existing tokens for this identifier
      await prisma.passwordResetToken.deleteMany({
        where: { identifier }
      });

      // Generate token and code
      const token = this.generateToken();
      const code = this.generateCode();
      const expires = addHours(new Date(), expiresInHours);

      // Create new token
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          identifier,
          token,
          expires,
          userId,
          // You can store the code in a separate field if needed
          // For now, we'll combine it with the token or store separately
        },
      });

      return {
        ...resetToken,
        code, // Return code separately for email/SMS
      };
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw new Error('Failed to create reset token');
    }
  }

  /**
   * Validate a reset token
   */
  static async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!resetToken) {
        return {
          valid: false,
          error: 'Invalid reset token',
        };
      }

      // Check if token is expired
      if (isAfter(new Date(), resetToken.expires)) {
        await this.deleteToken(token);
        return {
          valid: false,
          error: 'Reset token has expired',
        };
      }

      // Check if token was already used
      if (resetToken.usedAt) {
        return {
          valid: false,
          error: 'Reset token has already been used',
        };
      }

      return {
        valid: true,
        token: resetToken,
        identifier: resetToken.identifier,
      };
    } catch (error) {
      console.error('Error validating reset token:', error);
      return {
        valid: false,
        error: 'Failed to validate token',
      };
    }
  }

  /**
   * Validate a reset code (for multi-channel verification)
   */
  static async validateCode(email: string, code: string): Promise<TokenValidationResult> {
    try {
      // Find token by email and code
      // This assumes you've stored the code somewhere
      // You might want to add a code field to the model
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          identifier: email,
          // code: code, // Add this field if you want code-based verification
        },
      });

      if (!resetToken) {
        return {
          valid: false,
          error: 'Invalid reset code',
        };
      }

      // Validate code (implement your code validation logic)
      // This is a placeholder - implement based on your needs
      const isValidCode = true; // Replace with actual code validation

      if (!isValidCode) {
        return {
          valid: false,
          error: 'Invalid reset code',
        };
      }

      return this.validateToken(resetToken.token);
    } catch (error) {
      console.error('Error validating reset code:', error);
      return {
        valid: false,
        error: 'Failed to validate code',
      };
    }
  }

  /**
   * Mark token as used
   */
  static async markTokenAsUsed(token: string): Promise<void> {
    try {
      await prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
    } catch (error) {
      console.error('Error marking token as used:', error);
      throw new Error('Failed to mark token as used');
    }
  }

  /**
   * Delete a specific token
   */
  static async deleteToken(token: string): Promise<void> {
    try {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
    } catch (error) {
      console.error('Error deleting token:', error);
      throw new Error('Failed to delete token');
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.passwordResetToken.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      });
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw new Error('Failed to clean up expired tokens');
    }
  }

  /**
   * Get token by identifier (email)
   */
  static async getTokenByIdentifier(identifier: string) {
    try {
      return await prisma.passwordResetToken.findFirst({
        where: {
          identifier,
          usedAt: null,
          expires: {
            gt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Error getting token by identifier:', error);
      return null;
    }
  }

  /**
   * Generate reset links and codes
   */
  static generateResetLinks(token: string, code: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    return {
      tokenLink: `${baseUrl}/reset-password/${token}`,
      codeLink: `${baseUrl}/reset-password?code=${code}`,
      directLink: `${baseUrl}/reset-password?token=${token}`,
    };
  }

  /**
   * Get token statistics
   */
  static async getTokenStats() {
    try {
      const [total, used, expired, active] = await Promise.all([
        prisma.passwordResetToken.count(),
        prisma.passwordResetToken.count({ where: { usedAt: { not: null } } }),
        prisma.passwordResetToken.count({ where: { expires: { lt: new Date() } } }),
        prisma.passwordResetToken.count({
          where: {
            usedAt: null,
            expires: { gt: new Date() },
          },
        }),
      ]);

      return {
        total,
        used,
        expired,
        active,
      };
    } catch (error) {
      console.error('Error getting token stats:', error);
      return null;
    }
  }
}