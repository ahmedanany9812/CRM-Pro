"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ExportButton({ filters }: { filters?: any }) {
  const [isExporting, setIsExporting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleExport = async () => {
    if (!needsConfirmation) {
      setNeedsConfirmation(true);
      return;
    }

    setIsExporting(true);
    setNeedsConfirmation(false);
    
    try {
      // Simulate a small delay for better "vocal" feedback
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Build export URL with filters
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.stage) params.append("stage", filters.stage);
      if (filters?.status) params.append("status", filters.status);
      
      const url = `/api/leads/export${params.toString() ? `?${params.toString()}` : ""}`;
      window.location.href = url;
      
      toast.success("Lead export initiated successfully");
    } catch (error) {
      toast.error("Failed to start export");
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  return (
    <Button
      variant={needsConfirmation ? "default" : "outline"}
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        "gap-2 transition-all duration-300",
        needsConfirmation && "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
      )}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing CSV...
        </>
      ) : needsConfirmation ? (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Confirm & Download
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export Leads
        </>
      )}
    </Button>
  );
}
