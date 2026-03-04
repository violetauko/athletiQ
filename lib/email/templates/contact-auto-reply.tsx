// lib/email/templates/contact-auto-reply.tsx
import { Section, Text, Link, Row, Column, Img } from '@react-email/components';
import { BaseEmail } from './base-email';

interface ContactAutoReplyProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactAutoReplyEmail = ({
  name,
  email,
  subject,
  message,
}: ContactAutoReplyProps) => {
  return (
    <BaseEmail previewText={`Thank you for contacting Athletic Performance Agency, ${name}`}>
      {/* Thank You Section */}
      <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Img
          src="https://images.unsplash.com/photo-1526948128573-703a78a2cb7d?w=600&q=80"
          alt="Thank you"
          width="100%"
          height="auto"
          style={{ borderRadius: '8px', marginBottom: '20px' }}
        />
        <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', margin: '20px 0' }}>
          Thank You for Reaching Out!
        </Text>
        <Text style={{ fontSize: '18px', color: '#4a4a4a', marginBottom: '10px' }}>
          Hi {name}, we've received your message and will get back to you within 7 days.
        </Text>
      </Section>

      {/* Message Summary */}
      <Section style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          Your Message Summary
        </Text>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '20%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Subject:</Text>
          </Column>
          <Column style={{ width: '80%' }}>
            <Text style={{ fontWeight: 'bold', margin: '0' }}>{subject}</Text>
          </Column>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Column style={{ width: '20%' }}>
            <Text style={{ color: '#666666', margin: '0' }}>Message:</Text>
          </Column>
          <Column style={{ width: '80%' }}>
            <Text style={{ margin: '0', fontStyle: 'italic' }}>"{message}"</Text>
          </Column>
        </Row>
      </Section>

      {/* What to Expect */}
      <Section style={{ marginBottom: '30px' }}>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '15px' }}>
          What to Expect Next
        </Text>
        <ul style={{ paddingLeft: '20px', margin: '0' }}>
          <li style={{ marginBottom: '8px', color: '#4a4a4a' }}>
            Our team will review your message within 24 hours
          </li>
          <li style={{ marginBottom: '8px', color: '#4a4a4a' }}>
            You'll receive a personalized response from the relevant department
          </li>
          <li style={{ marginBottom: '8px', color: '#4a4a4a' }}>
            For urgent matters, you can call us at +1 (555) 123-4567
          </li>
        </ul>
      </Section>

      {/* FAQ Link */}
      <Section style={{ textAlign: 'center', marginTop: '20px' }}>
        <Text style={{ color: '#4a4a4a', marginBottom: '10px' }}>
          In the meantime, you might find answers in our FAQ:
        </Text>
        <Link
          href={`${process.env.NEXT_PUBLIC_APP_URL}/faq`}
          style={{ color: '#f59e0b', textDecoration: 'underline' }}
        >
          Visit FAQ Page
        </Link>
      </Section>
    </BaseEmail>
  );
};