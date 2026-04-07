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
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith("254") && cleaned.length === 9) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}
