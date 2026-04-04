import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableActions } from "./TableActions";
import { Lead } from "@/generated/prisma/client";

interface LeadsTableProps {
  leads: Lead[];
}

function formatEnum(value: string) {
  if (!value) return value;
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "WON":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
    case "LOST":
      return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case "NEW":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300";
    case "CONTACTED":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    case "QUALIFIED":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
    case "NEGOTIATING":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-zinc-900/50">
          <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="text-center font-semibold">Status</TableHead>
            <TableHead className="text-center font-semibold">Stage</TableHead>
            <TableHead className="w-[100px] text-right font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No leads found.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="text-primary hover:underline font-semibold"
                  >
                    {lead.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {lead.phone}
                </TableCell>
                <TableCell>
                  <div
                    className={`mx-auto w-fit rounded-md px-2 py-0.5 text-xs font-semibold ${getStatusColor(lead.status)}`}
                  >
                    {formatEnum(lead.status)}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`mx-auto w-fit rounded-md px-2 py-0.5 text-xs font-semibold ${getStageColor(lead.stage)}`}
                  >
                    {formatEnum(lead.stage)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions id={lead.id} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
