"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Direct browser download via location.href
      // Since it's a GET request with Content-Disposition header, 
      // the browser will handle the file saving.
      window.location.href = "/api/leads/export";
      
      // We show a success toast. Not perfectly synchronized with the file download
      // finishing, but good for user feedback.
      toast.success("Lead export started");
    } catch (error) {
      toast.error("Failed to start export");
    } finally {
      // Set a small delay before hiding loader to smooth the UX
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport} 
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
}
