import { RemindersPageClient } from "@/components/reminders/reminders-page-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reminders | Whispyr CRM",
  description: "Manage your follow-ups and scheduled tasks.",
};

export default function RemindersPage() {
  return <RemindersPageClient />;
}
