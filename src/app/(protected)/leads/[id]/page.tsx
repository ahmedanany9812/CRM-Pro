"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetLead, useEditLead } from "@/lib/tanstack/useLeads";
import { useGetUsers } from "@/lib/tanstack/useUsers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail, Phone, Calendar, User, Edit2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";
import { Timeline } from "@/components/leads/lead-details/Timeline";
import { LeadReminders } from "@/components/leads/lead-details/LeadReminders";
import { AI } from "@/components/leads/lead-details/AI";

export default function LeadDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: lead, isLoading, isError } = useGetLead(id);
  const { data: users } = useGetUsers();
  const editLeadMutation = useEditLead(id);

  const handleAssignmentChange = async (userId: string) => {
    try {
      await editLeadMutation.mutateAsync({
        assignedToId: userId === "unassigned" ? null : userId
      });
    } catch (error) {
      console.error("Failed to update lead assignment:", error);
    }
  };

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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="ai">AI Insights</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">Assignment</CardTitle>
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignee" className="text-sm font-medium">Assigned Counselor</Label>
                      <Select 
                        value={lead.assignedToId || "unassigned"} 
                        onValueChange={handleAssignmentChange}
                        disabled={editLeadMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select counselor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/50 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">Activity Log</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Track every interaction and status change for {lead.name}.
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Timeline leadId={id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders" className="mt-6">
              <LeadReminders leadId={id} />
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

            <TabsContent value="ai" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Sales Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <AI leadId={id} />
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
