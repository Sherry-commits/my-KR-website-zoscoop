const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PAYPAL_BASE_URL = process.env.PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/api/paypal/config", (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  if (!clientId) {
    return res.status(500).json({ error: "PAYPAL_CLIENT_ID is missing" });
  }
  return res.json({ clientId });
});

async function generateAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal token error: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const amount = String(req.body.amount || "35.99");
    const accessToken = await generateAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data });
    }
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;
    if (!orderID) {
      return res.status(400).json({ error: "orderID is required" });
    }

    const accessToken = await generateAccessToken();
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data });
    }
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Zoscoop server running at http://localhost:${PORT}`);
});
