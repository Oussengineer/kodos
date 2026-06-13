import { Router } from "express";
import twilio from "twilio";

const router = Router();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (twilioAccountSid && twilioAuthToken) {
  twilioClient = twilio(twilioAccountSid, twilioAuthToken);
  console.log("Twilio client initialized for SMS verification");
} else {
  console.log("Twilio not configured — SMS verification will be skipped. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to enable.");
}

const codeStore = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/send", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  if (!twilioClient) {
    const code = generateCode();
    codeStore.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 });
    console.log(`[SMS MOCK] Verification code for ${phone}: ${code}`);
    return res.json({ sent: true, mock: true, message: "SMS not configured. Check server logs for code." });
  }

  const code = generateCode();
  codeStore.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 });

  try {
    await twilioClient.messages.create({
      body: `Your Kodos verification code is: ${code}`,
      to: phone,
      from: twilioPhoneNumber,
    });
    res.json({ sent: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send SMS: " + err.message });
  }
});

router.post("/verify", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and code required" });

  const stored = codeStore.get(phone);
  if (!stored) return res.status(400).json({ error: "No code sent to this number" });
  if (Date.now() > stored.expires) {
    codeStore.delete(phone);
    return res.status(400).json({ error: "Code expired, request a new one" });
  }
  if (stored.code !== code) return res.status(400).json({ error: "Invalid code" });

  codeStore.delete(phone);
  res.json({ verified: true });
});

export default router;
