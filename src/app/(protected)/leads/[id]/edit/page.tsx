import { LeadForm } from "@/components/leads/LeadForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Lead",
  description: "Update lead details",
};

export default async function EditLeadPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold">Edit Lead</h1>
        <p className="text-sm text-muted-foreground">Update lead details for {lead.name}</p>
      </div>
      <LeadForm initialData={lead} isEdit />
    </div>
  );
}
