// lib/email/templates/email-verification.tsx (updated)
import { Section, Text, Link, Img, Row, Column, Hr } from '@react-email/components';
import { BaseEmail } from './base-email';

interface EmailVerificationProps {
  name: string;
  verificationLink: string;
  code?: string;
  expiresIn?: number; // hours
}

export const EmailVerificationEmail = ({
  name,
  verificationLink,
  code,
  expiresIn = 24,
}: EmailVerificationProps) => {
  return (
    <BaseEmail previewText={`Verify your email address for Athletic Performance Agency`}>
      {/* Header */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Img
          src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80"
          alt="Verify Email"
          width="100%"
          height="auto"
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        />
        <Text style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: '20px 0' }}>
          Verify Your Email Address
        </Text>
        <Text style={{ fontSize: '16px', color: '#4a4a4a', marginBottom: '10px' }}>
          Hi {name}, thanks for joining Athletic Performance Agency!
        </Text>
      </Section>

      {/* Two Verification Options */}
      <Section style={{ marginBottom: '30px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          Choose how to verify:
        </Text>

        {/* Option 1: Click the button */}
        <Section style={{ marginBottom: '25px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b', marginBottom: '10px' }}>
            Option 1: Click the button
          </Text>
          <Link
            href={verificationLink}
            style={{
              backgroundColor: '#f59e0b',
              color: '#ffffff',
              padding: '12px 30px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'inline-block',
            }}
          >
            Verify Email Address
          </Link>
        </Section>

        {/* Option 2: Use verification code */}
        {code && (
          <Section>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b', marginBottom: '10px' }}>
              Option 2: Enter verification code
            </Text>
            <Section style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
              <Text style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '10px' }}>
                Enter this code on the verification page:
              </Text>
              <Section style={{ textAlign: 'center' }}>
                <Text style={{
                  fontFamily: 'monospace',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  letterSpacing: '8px',
                  backgroundColor: '#ffffff',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  border: '1px dashed #f59e0b',
                  display: 'inline-block',
                }}>
                  {code}
                </Text>
              </Section>
            </Section>
          </Section>
        )}
      </Section>

      {/* Verification Link (if button doesn't work) */}
      <Section style={{ marginBottom: '25px' }}>
        <Text style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '10px' }}>
          If the button doesn't work, copy and paste this link:
        </Text>
        <Text style={{ 
          color: '#f59e0b', 
          fontSize: '12px', 
          wordBreak: 'break-all',
          backgroundColor: '#f8fafc',
          padding: '10px',
          borderRadius: '6px',
        }}>
          {verificationLink}
        </Text>
      </Section>

      {/* Expiry Notice */}
      <Section style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
        <Row>
          <Column style={{ width: '10%', verticalAlign: 'middle' }}>
            <Text style={{ fontSize: '20px', margin: '0' }}>⏰</Text>
          </Column>
          <Column style={{ width: '90%' }}>
            <Text style={{ fontSize: '13px', color: '#92400e', margin: '0' }}>
              This verification link and code will expire in {expiresIn} hours.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Didn't request this? */}
      <Hr style={{ borderColor: '#e6e6e6', margin: '25px 0' }} />
      
      <Section>
        <Text style={{ fontSize: '12px', color: '#999999', textAlign: 'center' }}>
          If you didn't create an account with us, you can safely ignore this email.
        </Text>
      </Section>
    </BaseEmail>
  );
};