const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs/promises");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PAYPAL_BASE_URL = process.env.PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

app.use(express.json());
app.use(express.static(path.join(__dirname)));
const TRACKING_DATA_PATH = path.join(__dirname, "data", "tracking.json");

async function readTrackingData() {
  try {
    const raw = await fs.readFile(TRACKING_DATA_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function writeTrackingData(data) {
  await fs.writeFile(TRACKING_DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

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

app.get("/api/tracking/:orderId", async (req, res) => {
  try {
    const orderId = String(req.params.orderId || "").trim();
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const store = await readTrackingData();
    const record = store[orderId];
    if (!record) {
      return res.status(404).json({ error: "Tracking info not found" });
    }
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/tracking/upsert", async (req, res) => {
  try {
    const adminKey = process.env.TRACKING_ADMIN_KEY || "";
    const providedKey = String(req.headers["x-admin-key"] || "");
    if (!adminKey || providedKey !== adminKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orderId = String(req.body.orderId || "").trim();
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const next = {
      orderId,
      carrier: String(req.body.carrier || "").trim(),
      trackingNumber: String(req.body.trackingNumber || "").trim(),
      status: String(req.body.status || "").trim(),
      updatedAt: new Date().toISOString(),
      note: String(req.body.note || "").trim(),
    };

    const store = await readTrackingData();
    store[orderId] = next;
    await writeTrackingData(store);

    return res.json({ ok: true, record: next });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Zoscoop server running at http://localhost:${PORT}`);
});
