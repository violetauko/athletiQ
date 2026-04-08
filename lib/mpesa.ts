// M-Pesa API utility functions for STK Push
// Uses the Daraja Sandbox API for development

export async function getMpesaToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing MPESA credentials");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(
    `${process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Mpesa Auth Error:", errorText);
    throw new Error("Failed to authenticate with M-Pesa");
  }

  const data = await response.json();
  return data.access_token;
}

export function generateMpesaPassword(shortcode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

export function generateTimestamp() {
  const date = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// Ensure phone number starts with 254
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  let cleaned = phone.replace(/\D/g, '');

  // Handle different formats
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned; // Already in correct format
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '254' + cleaned.slice(1); // Remove leading 0 and add 254
  } else if (cleaned.startsWith('+254') && cleaned.length === 13) {
    return cleaned.slice(1); // Remove + and keep 254
  } else if (cleaned.length === 9) {
    return '254' + cleaned; // Add 254 prefix
  } else if (cleaned.length === 12 && !cleaned.startsWith('254')) {
    // Invalid format, but try to fix
    console.warn(`Unexpected phone format: ${phone}, using as-is: ${cleaned}`);
    return cleaned;
  }

  console.warn(`Unable to format phone number: ${phone}, result: ${cleaned}`);
  return cleaned;
}

// Test M-Pesa connection
export async function testMpesaConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getMpesaToken();
    return { success: true, message: "M-Pesa connection successful" };
  } catch (error) {
    return { success: false, message: `M-Pesa connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
