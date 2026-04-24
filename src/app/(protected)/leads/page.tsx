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

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { Search, X } from "lucide-react";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");

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
    search: search || undefined,
    stage: stage === "ALL" ? undefined : (stage as LeadStage),
    status: status === "ALL" ? undefined : (status as LeadStatus),
  });

  const leads = leadsData?.leads || [];
  const pagination = leadsData?.pagination;

  const handleNextPage = () => setPage((p) => p + 1);
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));

  const resetFilters = () => {
    setSearch("");
    setStage("ALL");
    setStatus("ALL");
    setPage(1);
  };

  if (isError) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-destructive font-semibold">Error loading leads</p>
        <p className="text-muted-foreground text-sm">{(error as any)?.message || "Internal server error"}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const currentFilters = {
    search,
    stage: stage === "ALL" ? undefined : stage,
    status: status === "ALL" ? undefined : status,
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your lead pipeline efficiently.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton filters={currentFilters} />
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Create Lead
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-background"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={stage} onValueChange={(v) => { setStage(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stages</SelectItem>
              {Object.values(LeadStage).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(LeadStatus).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || stage !== "ALL" || status !== "ALL") && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2 h-10 text-muted-foreground">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
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
          page={page}
          total={pagination?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
        />
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
