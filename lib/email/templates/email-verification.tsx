// lib/email/templates/email-verification.tsx
import { Section, Text, Link, Img } from '@react-email/components';
import { BaseEmail } from './base-email';

interface EmailVerificationProps {
  name: string;
  verificationLink: string;
  expiresIn?: number; // hours
}

export const EmailVerificationEmail = ({
  name,
  verificationLink,
  expiresIn = 24,
}: EmailVerificationProps) => {
  return (
    <BaseEmail previewText={`Verify your email address for Athletic Performance Agency`}>
      {/* Verification Section */}
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
        <Text style={{ fontSize: '16px', color: '#4a4a4a', marginBottom: '20px' }}>
          Hi {name}, please verify your email address to complete your registration.
        </Text>
      </Section>

      {/* Verification Button */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Link
          href={verificationLink}
          style={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: '15px 40px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'inline-block',
          }}
        >
          Verify Email Address
        </Link>
        <Text style={{ color: '#999999', fontSize: '12px', marginTop: '15px' }}>
          This verification link will expire in {expiresIn} hours.
        </Text>
      </Section>

      {/* Troubleshooting */}
      <Section style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px' }}>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>
          Having trouble?
        </Text>
        <Text style={{ color: '#4a4a4a', fontSize: '14px', marginBottom: '10px' }}>
          If the button above doesn't work, copy and paste this link into your browser:
        </Text>
        <Text style={{ color: '#f59e0b', fontSize: '12px', wordBreak: 'break-all' }}>
          {verificationLink}
        </Text>
        <Text style={{ color: '#4a4a4a', fontSize: '14px', marginTop: '15px' }}>
          If you didn't create an account with us, you can safely ignore this email.
        </Text>
      </Section>
    </BaseEmail>
  );
};