"use client";

import { useState } from "react";
import { useGetLeads } from "@/lib/tanstack/useLeads";
import { LeadsTable } from "@/components/leads/Table";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { CreateLeadDialog } from "@/components/leads/CreateLeadDialog";
import { ExportButton } from "@/components/leads/ExportButton";
import { ReassignDialog } from "@/components/leads/ReassignDialog";
import { useQuery } from "@tanstack/react-query";
import { api, StandardResponse } from "@/lib/api-client";
import { Users } from "lucide-react";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
 
  const { data: profile } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await api.get<StandardResponse<any>>("/admin/profile");
      return response.data;
    },
  });


  const { data: leadsData, isLoading, isError, error } = useGetLeads({
    page,
    pageSize,
  });

  const leads = leadsData?.leads || [];
  const pagination = leadsData?.pagination;

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

      <div className="space-y-6 relative">
        {selectedIds.length > 0 && (
          <div className="sticky top-4 z-50 flex items-center justify-between bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-4 duration-300">
            <span className="text-sm font-medium">
              {selectedIds.length} leads selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReassignOpen(true)}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Reassign
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="hover:bg-primary-foreground/10"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <LeadsTable 
          leads={leads || []} 
          isLoading={isLoading} 
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          userRole={profile?.role}
        />
        
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
                disabled={!pagination || page === pagination.pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateLeadDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      
      <ReassignDialog
        selectedLeadIds={selectedIds}
        open={isReassignOpen}
        onOpenChange={setIsReassignOpen}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}
