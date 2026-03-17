// lib/email/templates/forgot-password.tsx
import { Section, Text, Link, Img, Row, Column, Hr } from '@react-email/components';
import { BaseEmail } from './base-email';

interface ForgotPasswordProps {
  name: string;
  resetLink: string;
  expiresIn?: number; // hours
  ipAddress?: string;
  location?: string;
  browser?: string;
}

export const ForgotPasswordEmail = ({
  name,
  resetLink,
  expiresIn = 1,
  ipAddress = 'Unknown',
  location = 'Unknown',
  browser = 'Unknown',
}: ForgotPasswordProps) => {
  return (
    <BaseEmail previewText={`Reset your password for Athletic Performance Agency`}>
      {/* Header Section */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Img
          src="https://athletec.org/logo1.png"
          alt="Password Reset"
          width="100%"
          height="auto"
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        />
        <Text style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: '20px 0' }}>
          Reset Your Password
        </Text>
        <Text style={{ fontSize: '16px', color: '#4a4a4a', marginBottom: '10px' }}>
          Hi {name}, we received a request to reset your password.
        </Text>
      </Section>

      {/* Security Notice */}
      <Section style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
        <Row>
          <Column style={{ width: '10%', verticalAlign: 'top' }}>
            <Text style={{ fontSize: '24px', margin: '0' }}>🔒</Text>
          </Column>
          <Column style={{ width: '90%' }}>
            <Text style={{ fontSize: '14px', color: '#92400e', margin: '0' }}>
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support immediately.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Reset Button */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Link
          href={resetLink}
          style={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: '15px 40px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'inline-block',
            boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)',
          }}
        >
          Reset Password
        </Link>
        <Text style={{ color: '#999999', fontSize: '12px', marginTop: '15px' }}>
          This password reset link will expire in {expiresIn} hour{expiresIn > 1 ? 's' : ''}.
        </Text>
      </Section>

      {/* Troubleshooting */}
      <Section style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          Having trouble with the button?
        </Text>
        <Text style={{ color: '#4a4a4a', fontSize: '14px', marginBottom: '10px' }}>
          If the button above doesn't work, copy and paste this link into your browser:
        </Text>
        <Text style={{ color: '#f59e0b', fontSize: '12px', wordBreak: 'break-all', marginBottom: '15px' }}>
          {resetLink}
        </Text>
        <Hr style={{ borderColor: '#e6e6e6', margin: '15px 0' }} />
        <Text style={{ color: '#4a4a4a', fontSize: '12px', margin: '0' }}>
          Or go to: {process.env.NEXT_PUBLIC_APP_URL}/reset-password and enter this code:
        </Text>
        <Text style={{ 
          fontFamily: 'monospace', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#1a1a1a',
          backgroundColor: '#ffffff',
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '8px',
          textAlign: 'center',
        }}>
          {resetLink.split('token=')[1]?.substring(0, 8) || 'XXXX-XXXX'}
        </Text>
      </Section>

      {/* Request Details */}
      <Section style={{ marginBottom: '25px' }}>
        <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>
          This request was made from:
        </Text>
        <Row>
          <Column style={{ width: '30%' }}>
            <Text style={{ color: '#666666', fontSize: '12px', margin: '0' }}>IP Address:</Text>
          </Column>
          <Column style={{ width: '70%' }}>
            <Text style={{ fontSize: '12px', margin: '0' }}>{ipAddress}</Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: '30%' }}>
            <Text style={{ color: '#666666', fontSize: '12px', margin: '0' }}>Location:</Text>
          </Column>
          <Column style={{ width: '70%' }}>
            <Text style={{ fontSize: '12px', margin: '0' }}>{location}</Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: '30%' }}>
            <Text style={{ color: '#666666', fontSize: '12px', margin: '0' }}>Browser:</Text>
          </Column>
          <Column style={{ width: '70%' }}>
            <Text style={{ fontSize: '12px', margin: '0' }}>{browser}</Text>
          </Column>
        </Row>
      </Section>

      {/* Support Info */}
      <Section style={{ textAlign: 'center', marginTop: '20px' }}>
        <Text style={{ color: '#4a4a4a', fontSize: '14px', marginBottom: '10px' }}>
          Need help? Contact our support team
        </Text>
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL}/support`}
          style={{ color: '#f59e0b', fontSize: '14px', textDecoration: 'underline' }}
        >
          Contact Support
        </Link>
      </Section>
    </BaseEmail>
  );
};