import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads",
  description: "Manage your leads",
};
export default function LeadsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Leads</h1>
    </div>
  );
}
