import Papa from "papaparse";
import { csvLeadRowSchema, RowValidationResult } from "./schema";

/**
 * Parses a CSV file into an array of objects.
 */
export function parseCSV(file: File) {
  return new Promise<Record<string, string>[]>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parsing warnings:", results.errors);
        }
        resolve(results.data as Record<string, string>[]);
      },
      error: (error) => reject(new Error("Failed to parse CSV file: " + error.message)),
    });
  });
}

/**
 * Validates an array of raw CSV rows against the lead schema.
 */
export function validateRows(rows: Record<string, string>[]): RowValidationResult[] {
  return rows.map((row, index) => {
    const result = csvLeadRowSchema.safeParse(row);

    if (result.success) {
      return {
        rowNumber: index + 2, // +1 for header, +1 for 0-indexing
        valid: true,
        data: result.data,
        errors: null,
      };
    }

    return {
      rowNumber: index + 2,
      valid: false,
      data: null,
      errors: result.error.flatten().fieldErrors,
    };
  });
}

/**
 * Builds a CSV string from an array of objects.
 */
export function buildCSVString(
  data: Record<string, unknown>[],
  headers?: string[]
): string {
  if (data.length === 0) return "";
  const columns = headers ?? Object.keys(data[0]);
  const headerRow = columns.map(escapeField).join(",");
  const dataRows = data.map((row) =>
    columns.map((col) => escapeField(String(row[col] ?? ""))).join(",")
  );
  return [headerRow, ...dataRows].join("\n");
}

function escapeField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates a template CSV string for lead imports.
 */
export function generateTemplateCSV(): string {
  const templateRows = [
    {
      phone: "+201234567890",
      name: "Ahmed Anany",
      email: "ahmed@example.com",
      assigneeEmail: "agent@crm.com",
    },
    {
      phone: "+15550199223",
      name: "Jane Smith",
      email: "jane.smith@corporation.co.uk",
      assigneeEmail: "",
    },
  ];
  return buildCSVString(templateRows, ["phone", "name", "email", "assigneeEmail"]);
}
