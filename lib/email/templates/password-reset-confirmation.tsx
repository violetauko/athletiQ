// lib/email/templates/password-reset-confirmation.tsx
import { Section, Text, Link, Img, Row, Column, Hr } from '@react-email/components';
import { BaseEmail } from './base-email';

interface PasswordResetConfirmationProps {
  name: string;
  loginLink: string;
  ipAddress?: string;
  location?: string;
  browser?: string;
  time?: Date;
}

export const PasswordResetConfirmationEmail = ({
  name,
  loginLink,
  ipAddress = 'Unknown',
  location = 'Unknown',
  browser = 'Unknown',
  time = new Date(),
}: PasswordResetConfirmationProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    });
  };

  return (
    <BaseEmail previewText={`Your password has been successfully reset`}>
      {/* Success Section */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Img
          src="https://athletec.org/logo1.png"
          alt="Password Reset Successful"
          width="100%"
          height="auto"
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        />
        <Text style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', margin: '20px 0' }}>
          Password Reset Successful! ✅
        </Text>
        <Text style={{ fontSize: '16px', color: '#4a4a4a', marginBottom: '10px' }}>
          Hi {name}, your password has been successfully reset.
        </Text>
      </Section>

      {/* Success Message */}
      <Section style={{ backgroundColor: '#d1fae5', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <Row>
          <Column style={{ width: '15%', verticalAlign: 'middle' }}>
            <Text style={{ fontSize: '30px', margin: '0' }}>🎉</Text>
          </Column>
          <Column style={{ width: '85%' }}>
            <Text style={{ fontSize: '16px', color: '#065f46', margin: '0' }}>
              <strong>Your password has been changed!</strong> You can now log in with your new password.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Login Button */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Link
          href={loginLink}
          style={{
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            padding: '15px 40px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'inline-block',
          }}
        >
          Log In to Your Account
        </Link>
      </Section>

      {/* What to do if you didn't request this */}
      <Section style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#991b1b', marginBottom: '10px' }}>
          ⚠️ If you didn't make this change
        </Text>
        <Text style={{ color: '#7f1d1d', fontSize: '14px', marginBottom: '15px' }}>
          If you did not request a password reset, please secure your account immediately:
        </Text>
        <ul style={{ paddingLeft: '20px', margin: '0', color: '#7f1d1d' }}>
          <li style={{ marginBottom: '8px' }}>Contact our support team immediately</li>
          <li style={{ marginBottom: '8px' }}>Check your account activity for any suspicious actions</li>
          <li style={{ marginBottom: '8px' }}>Enable two-factor authentication for extra security</li>
        </ul>
      </Section>

      {/* Request Details */}
      <Section style={{ marginBottom: '25px' }}>
        <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>
          Password Reset Details:
        </Text>
        <Row>
          <Column style={{ width: '30%' }}>
            <Text style={{ color: '#666666', fontSize: '12px', margin: '0' }}>Time:</Text>
          </Column>
          <Column style={{ width: '70%' }}>
            <Text style={{ fontSize: '12px', margin: '0' }}>{formatTime(time)}</Text>
          </Column>
        </Row>
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

      <Hr style={{ borderColor: '#e6e6e6', margin: '25px 0' }} />

      {/* Security Tips */}
      <Section>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          🔐 Security Tips
        </Text>
        <Row>
          <Column style={{ width: '10%', verticalAlign: 'top' }}>
            <Text style={{ fontSize: '16px', margin: '0' }}>•</Text>
          </Column>
          <Column style={{ width: '90%' }}>
            <Text style={{ fontSize: '12px', color: '#4a4a4a', margin: '0' }}>
              Never share your password with anyone
            </Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: '10%', verticalAlign: 'top' }}>
            <Text style={{ fontSize: '16px', margin: '0' }}>•</Text>
          </Column>
          <Column style={{ width: '90%' }}>
            <Text style={{ fontSize: '12px', color: '#4a4a4a', margin: '0' }}>
              Use a unique password for this account
            </Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ width: '10%', verticalAlign: 'top' }}>
            <Text style={{ fontSize: '16px', margin: '0' }}>•</Text>
          </Column>
          <Column style={{ width: '90%' }}>
            <Text style={{ fontSize: '12px', color: '#4a4a4a', margin: '0' }}>
              Enable two-factor authentication for extra security
            </Text>
          </Column>
        </Row>
      </Section>
    </BaseEmail>
  );
};