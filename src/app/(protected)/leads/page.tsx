import { LeadsTable } from "@/components/leads/Table";
import { LeadsFilters } from "@/components/leads/TableFilters";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads",
  description: "Manage your leads",
};
export default function LeadsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-sm text-muted-foreground">Manage to your Leads</p>
      </div>
      <LeadsFilters />
      <LeadsTable />
    </div>
  );
}
