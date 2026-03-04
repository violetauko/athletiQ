// Stanbic M-Pesa API utility functions

export async function getStanbicToken(): Promise<string> {
  const tokenUrl = "https://sandbox.connect.stanbicbank.co.ke/api/sandbox/auth/oauth2/token";
  // Assuming the user will provide a Stanbic client ID and secret
  const clientId = process.env.STANBIC_CLIENT_ID;
  const clientSecret = process.env.STANBIC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Stanbic credentials");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // The Swagger specifically states type: oauth2, flow: application, tokenUrl: /auth/oauth2/token
  // Usually this means client_credentials
  const response = await fetch(
    tokenUrl,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "payments"
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Stanbic Auth Error:", errorText);
    throw new Error("Failed to authenticate with Stanbic API");
  }

  const data = await response.json();
  return data.access_token;
}

export function generateStanbicReferenceId(): string {
  // Stanbic requires a unique "dbsReferenceId" (e.g. REW21331DR5F1)
  const prefix = "ATH";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}
