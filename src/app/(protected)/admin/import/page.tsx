import { CSVImporter } from "@/components/admin/CSVImporter";
import { FileSpreadsheet, Info } from "lucide-react";

/**
 * Admin Import Page
 * Auth and layout are handled by parent layout.tsx.
 */
export default function AdminImportPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bulk Lead Import</h1>
        <p className="text-muted-foreground max-w-2xl">
          Quickly populate your CRM by uploading a CSV file of contacts. 
          Our system automatically validates phone numbers and handles team assignments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <CSVImporter />
        </div>
        
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Info className="h-5 w-5" />
              <h3 className="font-semibold uppercase text-xs tracking-wider">Guidelines</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4 prose-sm">
              <li><strong>Phone</strong>: Must be in E.164 format (e.g., +15551234567).</li>
              <li><strong>Email</strong>: Optional but must be a valid format if provided.</li>
              <li><strong>Assignee</strong>: Optional email. If left blank, you will be the owner.</li>
              <li><strong>Size</strong>: Keep files under 5MB or 1,000 rows for best performance.</li>
            </ul>
          </div>

          <div className="rounded-xl border bg-muted/50 p-6">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <FileSpreadsheet className="h-5 w-5" />
              <h3 className="font-semibold uppercase text-xs tracking-wider">Format Tips</h3>
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              Using Excel? Save your file as "CSV (Comma delimited)" to ensure compatibility. Avoid "CSV UTF-8" if you encounter character encoding issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
