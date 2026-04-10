"use client";

import { useState } from "react";
import { useGetLeads } from "@/lib/tanstack/useLeads";
import { LeadsTable } from "@/components/leads/Table";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { ExportButton } from "@/components/leads/ExportButton";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: leads, isLoading, isError, error } = useGetLeads({
    page,
    pageSize,
  });

  const handleNextPage = () => setPage((p) => p + 1);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));

  if (isError) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-destructive font-semibold">Error loading leads</p>
        <p className="text-muted-foreground text-sm">{(error as any)?.message || "Internal server error"}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your lead pipeline efficiently.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton />
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Lead
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <LeadsTable leads={leads || []} isLoading={isLoading} />
        
        {!isLoading && leads && leads.length > 0 && (
          <div className="flex items-center justify-end space-x-4 px-2">
            <div className="text-sm text-muted-foreground">
              Page {page}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={leads?.length < pageSize}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateLeadDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
