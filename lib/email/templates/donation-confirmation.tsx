// lib/email/templates/donation-confirmation.tsx
import { Section, Text, Link, Row, Column, Img } from '@react-email/components';
import { BaseEmail } from './base-email';

interface DonationConfirmationProps {
  donorName: string;
  amount: number;
  tierId?: string;
  donationDate?: Date;
}

export const DonationConfirmationEmail = ({
  donorName,
  amount,
  tierId,
  donationDate = new Date(),
}: DonationConfirmationProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTierBenefits = (tierId?: string) => {
    const tiers: Record<string, string[]> = {
      'bronze': ['Name on website', 'Monthly newsletter'],
      'silver': ['All Bronze benefits', 'Exclusive content', 'Virtual meet & greet'],
      'gold': ['All Silver benefits', 'Signed merchandise', 'VIP event access'],
    };
    return tierId ? tiers[tierId.toLowerCase()] : [];
  };

  return (
    <BaseEmail previewText={`Thank you for your $${amount} donation to Athletic Performance Agency!`}>
      {/* Hero Section */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80"
          alt="Thank you"
          width="100%"
          height="auto"
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        />
        <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '20px 0' }}>
          Thank You, {donorName}! 🏆
        </Text>
        <Text style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '10px' }}>
          Your generous donation of <strong style={{ color: '#f59e0b' }}>${amount}</strong> will make a real difference.
        </Text>
      </Section>

      {/* Donation Details */}
      <Section style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          Donation Details
        </Text>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '50%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Amount:</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={{ fontWeight: 'bold', margin: '0' }}>${amount}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '50%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Date:</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={{ margin: '0' }}>{formatDate(donationDate)}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '50%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Transaction ID:</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={{ fontFamily: 'monospace', margin: '0' }}>
              {Math.random().toString(36).substring(2, 15).toUpperCase()}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Tier Benefits */}
      {tierId && (
        <Section style={{ marginBottom: '30px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
            Your {tierId.charAt(0).toUpperCase() + tierId.slice(1)} Tier Benefits
          </Text>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            {getTierBenefits(tierId).map((benefit, index) => (
              <li key={index} style={{ marginBottom: '8px', color: '#4a4a4a' }}>
                {benefit}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Call to Action */}
      <Section style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL}/donors/impact`}
          style={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            padding: '12px 30px',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
          }}
        >
          See Your Impact
        </Link>
      </Section>
    </BaseEmail>
  );
};