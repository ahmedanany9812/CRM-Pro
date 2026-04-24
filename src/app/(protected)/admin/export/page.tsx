import { ExportButton } from "@/components/leads/ExportButton";
import { FileDown, ShieldCheck, Database, Info, FileSpreadsheet } from "lucide-react";

/**
 * Admin Export Page
 */
export default function AdminExportPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Export Tools</h1>
        <p className="text-muted-foreground max-w-2xl">
          Securely extract your CRM data to standard CSV format for bulk reporting and analysis.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Step 1: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold">Step 1: Dataset Selection</h2>
          </div>
          
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Comprehensive Leads Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Includes all fields: contact info, pipeline stages, status, and ownership.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Included Data</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      Full Contact Profiles
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      Pipeline Stage & Status
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      Assignee Email Addresses
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      Historical Creation Dates
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary">File Specifications</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2 font-medium text-foreground">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      CSV (RFC 4180)
                    </li>
                    <li className="flex items-center gap-2 font-medium text-foreground">
                      <Info className="h-4 w-4 text-primary" />
                      UTF-8 Encoding
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Your export will be role-scoped automatically.
                </div>
                <div className="flex flex-col gap-1 items-end w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Ready for extraction</span>
                  <ExportButton />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Guidelines */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 2: Compliance</h2>
          
          <Card className="p-6 border-amber-500/20 bg-amber-500/5 shadow-none">
            <div className="flex items-center gap-2 mb-3 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Security Notice</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All data extraction activities are logged with your user ID and timestamp. By performing this export, you agree to handle the data according to your organization&apos;s privacy policy.
            </p>
          </Card>

          <div className="p-6 rounded-xl border border-primary/5 bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3">Usage Tips</h3>
            <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <li>• Use <strong>Excel</strong> or <strong>Google Sheets</strong> for immediate analysis.</li>
              <li>• The <strong>Phone</strong> column is formatted for global SMS/Call compatibility.</li>
              <li>• Large exports may take up to 30 seconds to generate.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border bg-card shadow-sm ${className}`}>
      {children}
    </div>
  );
}
