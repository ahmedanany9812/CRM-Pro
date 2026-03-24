import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lead } from "@/generated/prisma/client";

const leads: Lead[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    status: "OPEN",
    stage: "NEW",
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    status: "WON",
    stage: "NEW",
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Acme Corp",
    email: "contact@acmecorp.com",
    phone: "+1122334455",
    status: "LOST",
    stage: "QUALIFIED",
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    phone: "+1555666777",
    status: "OPEN",
    stage: "NEGOTIATING",
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "+1999888777",
    status: "WON",
    stage: "CONTACTED",
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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

export function LeadsTable() {
  return (
    <Table>
      <TableHeader className="bg-gray-50">
        <TableRow>
          <TableHead className="text-muted-foreground">Name</TableHead>
          <TableHead className="text-muted-foreground">Email</TableHead>
          <TableHead className="text-muted-foreground">Phone</TableHead>
          <TableHead className="text-center text-muted-foreground">
            Status
          </TableHead>
          <TableHead className="text-center text-muted-foreground">
            Stage
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {lead.email}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {lead.phone}
            </TableCell>
            <TableCell align="center">
              <p
                className={`p-0.5 font-medium text-sm text-center rounded-sm ${getStatusColor(lead.status)}`}
              >
                {formatEnum(lead.status)}
              </p>
            </TableCell>
            <TableCell align="center">
              <p
                className={`p-1 font-medium text-sm text-center rounded-sm ${getStageColor(lead.stage)}`}
              >
                {formatEnum(lead.stage)}
              </p>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
