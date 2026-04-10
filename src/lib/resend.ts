import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
}

// Instantiate with a dummy key if missing to prevent initialization crash
// The service layer will still fail gracefully if the key is invalid
export const resend = new Resend(apiKey || "re_dummy_key");
