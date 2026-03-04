// lib/email/email-service.ts
import { render } from '@react-email/components';
import React from 'react';

// Import templates
import { DonationConfirmationEmail } from './templates/donation-confirmation';
import { RegistrationConfirmationEmail } from './templates/registration-confirmation';
import { ContactAutoReplyEmail } from './templates/contact-auto-reply';
import { EmailVerificationEmail } from './templates/email-verification';
import nodemailer from 'nodemailer';

// Types
export type EmailTemplate = 
  | 'donation-confirmation'
  | 'registration-confirmation'
  | 'contact-auto-reply'
  | 'email-verification';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

// Create transporter
const createTransporter = () => {
  // For development/testing with ethereal.email
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_EMAIL,
        pass: process.env.ETHEREAL_PASSWORD,
      },
    });
  }

  // Production with Gmail/SendGrid/etc
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Render email template based on type
const renderTemplate = async (template: EmailTemplate, data: Record<string, any>): Promise<string> => {
  let emailComponent: React.ReactElement;

  switch (template) {
    case 'donation-confirmation':
      emailComponent = React.createElement(DonationConfirmationEmail, {
        donorName: data.donorName,
        amount: data.amount,
        tierId: data.tierId,
        donationDate: data.donationDate,
      });
      break;

    case 'registration-confirmation':
      emailComponent = React.createElement(RegistrationConfirmationEmail, {
        name: data.name,
        email: data.email,
        userType: data.userType,
        verificationLink: data.verificationLink,
      });
      break;

    case 'contact-auto-reply':
      emailComponent = React.createElement(ContactAutoReplyEmail, {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
      break;

    case 'email-verification':
      emailComponent = React.createElement(EmailVerificationEmail, {
        name: data.name,
        verificationLink: data.verificationLink,
        expiresIn: data.expiresIn,
      });
      break;

    default:
      throw new Error(`Unknown template: ${template}`);
  }

  return await render(emailComponent);
};

// Main email sending function
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: Error;
}> {
  try {
    const transporter = createTransporter();
    const html = await renderTemplate(options.template, options.data);

    const mailOptions = {
      from: options.from || `"Athletic Performance Agency" <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error as Error,
    };
  }
}

// Bulk email sending
export async function sendBulkEmails(
  emails: EmailOptions[]
): Promise<Array<{ success: boolean; messageId?: string; error?: Error }>> {
  const results = await Promise.allSettled(emails.map(email => sendEmail(email)));
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        error: result.reason,
      };
    }
  });
}

// Utility function to verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration invalid:', error);
    return false;
  }
}