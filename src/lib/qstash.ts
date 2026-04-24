import { Client, Receiver } from "@upstash/qstash";
import { NextRequest } from "next/server";

if (!process.env.QSTASH_TOKEN) {
  console.warn("QSTASH_TOKEN is missing in environment variables.");
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN || "placeholder",
});

const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export const verifyQstashSignature = async (
  request: NextRequest,
  rawBody: string,
) => {
  const signature = request.headers.get("Upstash-Signature");
  if (!signature) {
    throw new Error("Missing Upstash-Signature header");
  }
  return await qstashReceiver.verify({ signature, body: rawBody });
};

export const reminderCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL}/api/upstash/reminder-due`;
