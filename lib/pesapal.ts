const getBaseUrl = () => {
  const env = process.env.PESAPAL_ENVIRONMENT || "production";
  return env === "production"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";
};

export async function getPesapalToken() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Pesapal credentials not found");
  }

  const response = await fetch(`${getBaseUrl()}/api/Auth/RequestToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Failed to get Pesapal token");
  }

  return data.token;
}

export async function registerIPN(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // The IPN URL must be a public URL that Pesapal can reach.
  const ipnUrl = `${appUrl}/api/payment/pesapal/ipn`;

  const response = await fetch(`${getBaseUrl()}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "POST",
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Failed to register IPN");
  }

  return data.ipn_id;
}

export async function submitOrder(token: string, orderData: any) {
  const response = await fetch(`${getBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Failed to submit order to Pesapal");
  }

  return data;
}

export async function getTransactionStatus(token: string, orderTrackingId: string) {
  const response = await fetch(
    `${getBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (response.status!==200 || data.error?.code) {
    console.log("Error getting pesapal status: ",data.error)
    throw new Error(data.error?.message || "Failed to get transaction status");
  }

  return data;
}
