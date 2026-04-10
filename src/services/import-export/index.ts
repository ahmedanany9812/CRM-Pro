import { processImport, processExport } from "./service";
import { importRequestSchema } from "./schema";
import { parseCSV, validateRows, generateTemplateCSV } from "./helpers";

export const ImportExportService = {
  import: {
    process: processImport,
  },
  export: {
    process: processExport,
  },
} as const;

export const ImportExportSchema = {
  import: {
    request: importRequestSchema,
  },
} as const;

export const ImportExportHelpers = {
  parseCSV,
  validateRows,
  generateTemplateCSV,
} as const;
