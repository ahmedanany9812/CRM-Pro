import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
}

export const resend = new Resend(apiKey || "re_dummy_key");
