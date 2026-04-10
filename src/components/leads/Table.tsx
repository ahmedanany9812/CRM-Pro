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

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
}

function formatEnum(value: string) {
  if (!value) return value;
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const getStatusVariant = (status: string): any => {
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

export function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm transition-all">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-bold text-foreground h-12">Name</TableHead>
            <TableHead className="font-bold text-foreground h-12">Email</TableHead>
            <TableHead className="font-bold text-foreground h-12">Phone</TableHead>
            <TableHead className="text-center font-bold text-foreground h-12">Status</TableHead>
            <TableHead className="text-center font-bold text-foreground h-12">Stage</TableHead>
            <TableHead className="w-[100px] text-right font-bold text-foreground h-12">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground/50" />
              </TableCell>
            </TableRow>
          ) : leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="font-medium">No leads found</span>
                  <span className="text-xs">Try adjusting your filters or search.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow 
                key={lead.id} 
                className="group transition-colors hover:bg-muted/30"
              >
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
                        getStageColor(lead.stage)
                      )}
                    >
                      {formatEnum(lead.stage)}
                    </Badge>
                  </div>
                </TableCell>
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
