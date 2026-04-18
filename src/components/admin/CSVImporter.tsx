"use client";

import { useState } from "react";
import {
  parseCSV,
  validateRows,
  generateTemplateCSV,
} from "@/services/import-export/helpers";
import { RowValidationResult } from "@/services/import-export/schema";
import { useImport } from "@/lib/tanstack/useImportExport";
import { Button } from "@/components/ui/button";
import {
  FileUp,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";

type ImportState = "idle" | "parsing" | "validated" | "importing";

export function CSVImporter() {
  const [state, setState] = useState<ImportState>("idle");
  const [results, setResults] = useState<RowValidationResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const importMutation = useImport();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    setState("parsing");
    try {
      const rows = await parseCSV(file);
      const validationResults = validateRows(rows);
      setResults(validationResults);
      setState("validated");

      const validCount = validationResults.filter(
        (r: RowValidationResult) => r.valid,
      ).length;
      const invalidCount = validationResults.filter(
        (r: RowValidationResult) => !r.valid,
      ).length;

      setShowPreview(validCount <= 50);

      if (invalidCount > 0) {
        toast.warning(
          `Parsed ${validationResults.length} rows: ${validCount} valid, ${invalidCount} invalid`,
        );
      } else {
        toast.success(`Successfully parsed ${validationResults.length} rows`);
      }
    } catch (error) {
      toast.error("Failed to parse CSV file. Please check the format.");
      setState("idle");
    }

    e.target.value = "";
  };

  const handleImport = async () => {
    const validRows = results
      .filter((r: RowValidationResult) => r.valid && r.data !== null)
      .map((r: RowValidationResult) => r.data!);

    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setState("importing");
    try {
      const data = await importMutation.mutateAsync({ rows: validRows });
      toast.success(
        `Imported ${data.importedCount} rows successfully!` +
          (data.errors.length > 0
            ? ` Encountered ${data.errors.length} errors.`
            : ""),
      );
      setResults([]);
      setState("idle");
    } catch (error: any) {
      toast.error(error.message || "Import failed");
      setState("validated");
    }
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplateCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "whispyr_leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setResults([]);
    setState("idle");
  };

  const validCount = results.filter((r) => r.valid).length;
  const invalidResults = results.filter((r) => !r.valid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Step 1: Upload Your CSV</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {state === "idle" && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-12 transition-colors hover:bg-muted/50">
          <FileUp className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Click the button below to select your lead spreadsheet.
            <br />
            Supported format: .csv
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Button size="lg">Select CSV File</Button>
          </div>
        </div>
      )}

      {state === "parsing" && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 p-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">
            Parsing and validating your file...
          </p>
        </div>
      )}

      {(state === "validated" || state === "importing") && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between rounded-xl border bg-green-500/5 p-6 border-green-500/20">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Ready to Import</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                These {validCount} rows match our format exactly and will be
                added to the CRM.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {validCount}
                </span>
                <span className="text-sm text-muted-foreground">
                  Lead candidates
                </span>
              </div>
            </div>

            <div
              className={`flex flex-col justify-between rounded-xl border p-6 ${invalidResults.length > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/50 border-muted"}`}
            >
              <div
                className={`flex items-center gap-3 mb-2 ${invalidResults.length > 0 ? "text-amber-600" : "text-muted-foreground"}`}
              >
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold text-lg">
                  {invalidResults.length > 0
                    ? "Formatting Errors"
                    : "No Errors"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {invalidResults.length > 0
                  ? `${invalidResults.length} rows have issues and will be skipped. Review the list below.`
                  : "Every row in your file is perfectly formatted! Zero issues detected."}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-3xl font-bold ${invalidResults.length > 0 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  {invalidResults.length}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  Validation errors
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex w-full items-center justify-between border-b px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Preview {validCount} Valid Leads
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  Ready
                </Badge>
                {showPreview ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </button>
            {showPreview && (
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Row</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results
                      .filter((r) => r.valid && r.data)
                      .slice(0, 10)
                      .map((res) => (
                        <TableRow key={res.rowNumber}>
                          <TableCell className="font-medium">
                            #{res.rowNumber}
                          </TableCell>
                          <TableCell>{res.data?.phone}</TableCell>
                          <TableCell>{res.data?.name}</TableCell>
                          <TableCell>{res.data?.email}</TableCell>
                          <TableCell className="text-muted-foreground italic">
                            {res.data?.assigneeEmail || "Unassigned"}
                          </TableCell>
                        </TableRow>
                      ))}
                    {validCount > 10 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 bg-muted/20 text-muted-foreground text-xs italic"
                        >
                          Showing first 10 of {validCount} valid rows...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>

          {invalidResults.length > 0 && (
            <div className="rounded-xl border bg-card">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Errors to Fix
                </h3>
                <Badge variant="outline">{invalidResults.length} issues</Badge>
              </div>
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Row</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invalidResults.map((res) =>
                      Object.entries(res.errors || {}).map(([field, msgs]) => (
                        <TableRow key={`${res.rowNumber}-${field}`}>
                          <TableCell className="font-medium">
                            #{res.rowNumber}
                          </TableCell>
                          <TableCell className="capitalize font-semibold text-amber-600">
                            {field}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {msgs.join(", ")}
                          </TableCell>
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={reset}
              disabled={state === "importing"}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Discard File
            </Button>
            <Button
              size="lg"
              onClick={handleImport}
              disabled={state === "importing" || validCount === 0}
              className="px-8 gap-2"
            >
              {state === "importing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Perform Import ({validCount} Leads)
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
