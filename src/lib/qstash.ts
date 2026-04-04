import { Client } from "@upstash/qstash";

if (!process.env.QSTASH_TOKEN) {
  console.warn("QSTASH_TOKEN is missing in environment variables.");
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN || "placeholder",
});
