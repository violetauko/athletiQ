// lib/email/templates/base-email.tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import React from 'react';

interface BaseEmailProps {
  previewText: string;
  children: React.ReactNode;
  unsubscribeLink?: string;
}

export const BaseEmail = ({
  previewText,
  children,
  unsubscribeLink,
}: BaseEmailProps) => {
  const mainStyles = {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    padding: '20px 0',
  };

  const containerStyles = {
    backgroundColor: '#ffffff',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    margin: '0 auto',
    maxWidth: '600px',
    padding: '40px 20px',
  };

  const logoContainerStyles = {
    textAlign: 'center' as const,
    marginBottom: '30px',
  };

  const footerStyles = {
    color: '#666666',
    fontSize: '12px',
    lineHeight: '24px',
    marginTop: '30px',
    textAlign: 'center' as const,
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyles}>
        <Container style={containerStyles}>
          {/* Logo */}
          <Section style={logoContainerStyles}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo1.png`}
              alt="Athletic Performance Agency"
              width="200"
              height="auto"
              style={{ margin: '0 auto' }}
            />
          </Section>

          {/* Main Content */}
          {children}

          {/* Footer */}
          <Hr style={{ borderColor: '#e6e6e6', margin: '30px 0 20px' }} />
          
          <Section style={footerStyles}>
            <Row>
              <Column align="center">
                <Text style={{ margin: '0 0 10px' }}>
                  © {new Date().getFullYear()} Athletic Performance Agency. All rights reserved.
                </Text>
                <Text style={{ margin: '0 0 10px' }}>
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/privacy`} style={{ color: '#666666', marginRight: '10px' }}>
                    Privacy Policy
                  </Link>
                  {' • '}
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/terms`} style={{ color: '#666666', marginLeft: '10px' }}>
                    Terms of Service
                  </Link>
                </Text>
                {unsubscribeLink && (
                  <Link href={unsubscribeLink} style={{ color: '#999999', fontSize: '11px' }}>
                    Unsubscribe
                  </Link>
                )}
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};