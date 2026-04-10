import { ExportButton } from "@/components/leads/ExportButton";
import { FileDown, ShieldCheck, Database } from "lucide-react";

/**
 * Admin Export Page
 */
export default function AdminExportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Export Tools</h1>
        <p className="text-muted-foreground max-w-2xl">
          Securely extra your CRM data to standard CSV format. 
          Use these tools for bulk reporting, offline analysis, or cross-system synchronization.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Leads Export</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download all leads currently in the system, including their last status, stage, and primary contacts.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
              <li>Full RFC 4180 compatibility</li>
              <li>Includes assignee information</li>
              <li>Automatic UTF-8 encoding</li>
            </ul>
          </div>
          <div className="pt-6 mt-auto border-t">
            <ExportButton />
          </div>
        </div>

        <div className="rounded-xl border bg-muted/30 p-6 flex flex-col justify-center items-center text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-muted-foreground">Compliance & Security</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              All exports are logged for audit purposes. High-volume exports may be subject to review by system administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
