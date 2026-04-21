import { authenticateUser, AuthenticationError } from "@/utils/authenticateUser";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  try {
    const profile = await authenticateUser();
    return <DashboardPageClient role={profile.role} />;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      redirect(`/login?message=${encodeURIComponent(error.message)}`);
    }
    // For other unexpected errors, we can still redirect or let them bubble up
    redirect("/login?message=An unexpected authentication error occurred");
  }
}
