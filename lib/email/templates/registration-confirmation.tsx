// lib/email/templates/registration-confirmation.tsx
import { Section, Text, Link, Row, Column, Img } from '@react-email/components';
import { BaseEmail } from './base-email';

interface RegistrationConfirmationProps {
  name: string;
  email: string;
  userType: 'athlete' | 'client' | 'fan';
  verificationLink?: string;
}

export const RegistrationConfirmationEmail = ({
  name,
  email,
  userType,
  verificationLink,
}: RegistrationConfirmationProps) => {
  const getUserTypeMessage = () => {
    switch (userType) {
      case 'athlete':
        return 'Start creating your athlete profile and get discovered by top organizations.';
      case 'client':
        return 'Begin posting opportunities and finding the perfect talent for your organization.';
      case 'fan':
        return 'Follow your favorite athletes and stay updated with their journey.';
    }
  };

  return (
    <BaseEmail previewText={`Welcome to Athletic Performance Agency, ${name}!`}>
      {/* Welcome Section */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Img
          src="https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=600&q=80"
          alt="Welcome"
          width="100%"
          height="auto"
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        />
        <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '20px 0' }}>
          Welcome to the Team, {name}! 🎉
        </Text>
        <Text style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '10px' }}>
          Your {userType} account has been successfully created.
        </Text>
      </Section>

      {/* Account Details */}
      <Section style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          Account Details
        </Text>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '30%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Name:</Text>
          </Column>
          <Column style={{ width: '70%' }}>
            <Text style={{ fontWeight: 'bold', margin: '0' }}>{name}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '30%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Email:</Text>
          </Column>
          <Column style={{ width: '70%' }}>
            <Text style={{ margin: '0' }}>{email}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '30%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Account Type:</Text>
          </Column>
          <Column style={{ width: '70%' }}>
            <Text style={{ textTransform: 'capitalize', margin: '0' }}>{userType}</Text>
          </Column>
        </Row>
      </Section>

      {/* Next Steps */}
      <Section style={{ marginBottom: '30px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          Next Steps
        </Text>
        <Text style={{ color: '#4a4a4a', marginBottom: '10px' }}>
          {getUserTypeMessage()}
        </Text>
      </Section>

      {/* Verification Link */}
      {verificationLink && (
        <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Text style={{ color: '#4a4a4a', marginBottom: '15px' }}>
            Please verify your email address to activate your account:
          </Text>
          <Link
            href={verificationLink}
            style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              padding: '12px 30px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            Verify Email Address
          </Link>
        </Section>
      )}

      {/* Login Link */}
      <Section style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL}/login`}
          style={{ color: '#f59e0b', textDecoration: 'underline' }}
        >
          Login to your account
        </Link>
      </Section>
    </BaseEmail>
  );
};