import { z } from "zod";

export const csvLeadRowSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone must be a valid E.164 number (e.g., +15551234567)",
    ),
  name: z.string().min(1, "Name is required").max(100).trim(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  assigneeEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export type CSVLeadRow = z.infer<typeof csvLeadRowSchema>;

export const importRequestSchema = z.object({
  rows: z.array(csvLeadRowSchema),
});

export type ImportRequest = z.infer<typeof importRequestSchema>;

export interface RowValidationResult {
  rowNumber: number;
  valid: boolean;
  data: CSVLeadRow | null;
  errors: Record<string, string[]> | null;
}

export interface ImportSummary {
  importedCount: number;
  totalProcessed: number;
  errors: string[];
}
