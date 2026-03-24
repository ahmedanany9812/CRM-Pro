import {
  Table,
  TableBody,
  TableCaption,
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
    status: "OPEN",
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
    status: "OPEN",
    stage: "NEW",
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
    stage: "NEW",
    assignedToId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "+1999888777",
    status: "OPEN",
    stage: "NEW",
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

export function LeadsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Stage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.phone}</TableCell>
            <TableCell>{formatEnum(lead.status)}</TableCell>
            <TableCell>{formatEnum(lead.stage)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
