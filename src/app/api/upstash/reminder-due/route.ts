import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { ReminderService } from "@/services/reminder";
import { verifyQstashSignature } from "@/lib/qstash";
import { qstashReminderDueSchema } from "@/services/reminder";

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body for signature verification
    const rawBody = await request.text();

    // 2. Verify QStash signature (skip in development if no signing keys)
    const isProduction = process.env.NODE_ENV === "production";
    const hasSigningKeys =
      process.env.QSTASH_CURRENT_SIGNING_KEY &&
      process.env.QSTASH_NEXT_SIGNING_KEY;

    if (isProduction || hasSigningKeys) {
      try {
        await verifyQstashSignature(request, rawBody);
      } catch (error) {
        console.error("QStash signature verification failed:", error);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // 3. Parse and validate the body
    const body = JSON.parse(rawBody);
    const { reminderId } = qstashReminderDueSchema.parse(body);

    console.log(`[Reminder Webhook] Processing reminder: ${reminderId}`);

    // 4. Idempotency check (Redis)
    const idempotencyKey = `reminder:fired:${reminderId}`;
    const processed = await redis.get(idempotencyKey);
    if (processed) {
      console.log(`[Reminder Webhook] Reminder already processed: ${reminderId}`);
      return NextResponse.json({ status: "success", alreadyProcessed: true });
    }

    // 5. Mark as processed in Redis BEFORE processing (24h TTL)
    await redis.set(idempotencyKey, "processed", "EX", 86400);

    // 6. Fire the reminder (creates notification + updates status)
    console.log(`[Reminder Webhook] Firing reminder: ${reminderId}`);
    await ReminderService.fire(reminderId);
    console.log(`[Reminder Webhook] Reminder fired successfully: ${reminderId}`);

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("[Reminder Webhook] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
