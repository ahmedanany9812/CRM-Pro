import { SectionCards } from "@/components/dashboard/section-cards";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview to your crm activity
        </p>
      </div>
      <SectionCards />
    </div>
  );
}
