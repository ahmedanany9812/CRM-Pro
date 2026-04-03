"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetLead } from "@/lib/tanstack/useLeads";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Mail, Phone, Calendar, User, Edit2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";

export default function LeadDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: lead, isLoading, isError } = useGetLead(id);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive">Lead not found</h2>
          <p className="mt-2 text-muted-foreground">The lead you are looking for does not exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
            <div className="mt-1 flex items-center space-x-2">
              <Badge variant={lead.status === "WON" ? "success" : lead.status === "LOST" ? "destructive" : "secondary"}>
                {lead.status}
              </Badge>
              <Badge variant="outline">{lead.stage}</Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
           <Button variant="outline" className="gap-2" onClick={() => setIsEditOpen(true)}>
             <Edit2 className="h-4 w-4" />
             Edit Details
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Quick Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Assigned to: {lead.assignedToId || "Unassigned"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Detailed overview and notes for {lead.name} will appear here. 
                    This lead is currently in the <strong>{lead.stage}</strong> stage with an <strong>{lead.status}</strong> status.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">
                    Timeline feature coming in Session 3. This will show all status changes, notes, and interactions.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reminders</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                   <p className="text-muted-foreground text-sm">No active reminders for this lead.</p>
                   <Button variant="link">Add a reminder</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attached Files</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                   <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditLeadDialog 
        lead={lead} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </div>
  );
}
