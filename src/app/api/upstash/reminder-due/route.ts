import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { ReminderService } from "@/services/reminder";
import { NotificationService } from "@/services/notification";
import { ReminderStatus } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reminderId } = body;

    if (!reminderId) {
      return NextResponse.json({ error: "Missing reminderId" }, { status: 400 });
    }

    // 1. Idempotency Check (Redis)
    const idempotencyKey = `reminder:fired:${reminderId}`;
    const processed = await redis.get(idempotencyKey);
    if (processed) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // 2. Fetch Reminder
    const reminder = await ReminderService.get(reminderId);
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    // If it's already fired or cancelled, skip
    if (reminder.status !== ReminderStatus.PENDING) {
      return NextResponse.json({ success: true, status: reminder.status });
    }

    // 3. Process Fire (Transactional)
    await prisma.$transaction(async (tx) => {
      // Mark as processed in Redis (24h TTL)
      await redis.set(idempotencyKey, "processed", "EX", 86400);

      // Create Notification
      await NotificationService.create({
        title: "Reminder Due",
        body: reminder.title,
        recipientId: reminder.assignedToId,
        leadId: reminder.leadId,
      }, tx);

      // Mark Reminder as FIRED
      await ReminderService.updateStatus(reminderId, ReminderStatus.FIRED, tx);
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in reminder webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
