import { LeadForm } from "@/components/leads/LeadForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Lead",
  description: "Add a new lead to your CRM",
};

export default function NewLeadPage() {
  return (
    <div className="p-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold">New Lead</h1>
        <p className="text-sm text-muted-foreground">Add a new lead to your CRM</p>
      </div>
      <LeadForm />
    </div>
  );
}
