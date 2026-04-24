"use client";

import { useAttachments, useUploadAttachment, useDeleteAttachment } from "@/lib/tanstack/useAttachments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileIcon, Loader2, Plus, Trash2, AlertCircle, FolderOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export function Files({ leadId }: { leadId: string }) {
  const { data: attachments, isLoading, error } = useAttachments(leadId);
  const uploadMutation = useUploadAttachment(leadId);
  const deleteMutation = useDeleteAttachment(leadId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMutation.mutate(file, {
      onSuccess: () => {
        toast.success("File uploaded successfully");
        if (e.target) e.target.value = ""; // Reset input
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to upload file");
      },
    });
  };

  const handleDelete = (attachmentId: string) => {
    deleteMutation.mutate(attachmentId, {
      onSuccess: () => {
        toast.success("Attachment deleted");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete attachment");
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border shadow-sm border-destructive/20 bg-destructive/5 text-center">
        <CardContent className="flex flex-col items-center justify-center py-10 text-destructive">
          <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
          <p className="font-semibold">Failed to load attachments</p>
          <p className="text-sm opacity-80">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b py-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <FolderOpen className="h-3.5 w-3.5" />
          Files & Attachments
        </CardTitle>
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            onChange={handleFileUpload}
            disabled={uploadMutation.isPending}
          />
          <Button
            variant="outline"
            size="sm"
            asChild
            disabled={uploadMutation.isPending}
          >
            <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Upload File
            </label>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!attachments || attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No files yet</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
              Upload documents, contracts, or images related to this lead.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="py-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg">
                    <FileIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium leading-none mb-1">
                      {file.fileName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB •{" "}
                      {formatDistanceToNow(new Date(file.createdAt))} ago • By{" "}
                      {file.uploadedBy.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(file.downloadUrl, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Attachment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove the file from storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
