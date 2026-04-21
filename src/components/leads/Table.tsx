"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TableActions } from "./TableActions";
import { Lead } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadStatus } from "@/generated/prisma/enums";

type LeadWithAssignee = Lead & { assignedTo?: { name: string } | null };

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  userRole?: string;
}

function formatEnum(value: string) {
  if (!value) return value;
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | "success" => {
  switch (status) {
    case "WON":
      return "success";
    case "LOST":
      return "destructive";
    case "OPEN":
      return "secondary";
    default:
      return "outline";
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case "NEW":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    case "CONTACTED":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    case "QUALIFIED":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "NEGOTIATING":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-transparent";
  }
};

export function LeadsTable({ 
  leads, 
  isLoading, 
  selectedIds = [], 
  onSelectionChange,
  userRole 
}: LeadsTableProps) {
  const typedLeads = leads as LeadWithAssignee[];
  const isManagerOrAdmin = userRole === "MANAGER" || userRole === "ADMIN";

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === leads.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(leads.map((l) => l.id));
    }
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm transition-all">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent text-xs uppercase tracking-wider text-muted-foreground">
            {isManagerOrAdmin && (
              <TableHead className="w-[50px] h-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 focus:ring-primary h-4 w-4"
                  checked={leads.length > 0 && selectedIds.length === leads.length}
                  onChange={toggleAll}
                />
              </TableHead>
            )}
            <TableHead className="h-12">Name</TableHead>
            <TableHead className="h-12">Email</TableHead>
            <TableHead className="h-12">Phone</TableHead>
            <TableHead className="text-center h-12">Status</TableHead>
            <TableHead className="text-center h-12">Stage</TableHead>
            {isManagerOrAdmin && <TableHead className="h-12">Assigned To</TableHead>}
            <TableHead className="w-[100px] text-right h-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {isManagerOrAdmin && (
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-4 w-[140px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[180px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-16" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-20" />
                  </div>
                </TableCell>
                {isManagerOrAdmin && (
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : leads.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isManagerOrAdmin ? 8 : 6}
                className="h-32 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="font-medium">No leads found</span>
                  <span className="text-xs">
                    Try adjusting your filters or search.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            typedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                className={cn(
                  "group transition-colors hover:bg-muted/30",
                  selectedIds.includes(lead.id) && "bg-muted/50"
                )}
              >
                {isManagerOrAdmin && (
                  <TableCell className="py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 focus:ring-primary h-4 w-4"
                      checked={selectedIds.includes(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="py-4">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-primary hover:underline font-bold transition-all"
                  >
                    {lead.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground/80 font-medium py-4">
                  {lead.email}
                </TableCell>
                <TableCell className="text-muted-foreground/80 font-medium py-4">
                  {lead.phone}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex justify-center">
                    <Badge
                      variant={getStatusVariant(lead.status)}
                      className="px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px]"
                    >
                      {formatEnum(lead.status)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex justify-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px]",
                        getStageColor(lead.stage),
                      )}
                    >
                      {formatEnum(lead.stage)}
                    </Badge>
                  </div>
                </TableCell>
                {isManagerOrAdmin && (
                  <TableCell className="text-muted-foreground/80 font-medium py-4 text-xs">
                    {lead.assignedTo?.name || "Unassigned"}
                  </TableCell>
                )}
                <TableCell className="text-right py-4">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <TableActions id={lead.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
