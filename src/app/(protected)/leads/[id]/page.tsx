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
import { 
  Loader2, ArrowLeft, Mail, Phone, Calendar, User, Edit2, UserPlus, 
  CheckCircle2, Clock, UserMinus, Copy, TrendingUp, History, Sparkles, XCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EditLeadDialog } from "@/components/leads/EditLeadDialog";
import { Timeline } from "@/components/leads/lead-details/Timeline";
import { LeadReminders } from "@/components/leads/lead-details/LeadReminders";
import { AI } from "@/components/leads/lead-details/AI";
import { Files } from "@/components/leads/lead-details/Files";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

export default function LeadDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: lead, isLoading, isError } = useGetLead(id);
  const { data: users } = useGetUsers();
  const editLeadMutation = useEditLead(id);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

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
          <Card className="shadow-sm border-muted/60 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-muted/50">
                {/* Email Item */}
                <div className="group flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-muted-foreground/10 text-muted-foreground group-hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Email Address</span>
                      <span className="text-sm font-bold text-foreground truncate max-w-[180px]">{lead.email || "No email"}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary" 
                    title="Copy Email"
                    onClick={() => handleCopy(lead.email || "", "Email")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Phone Item */}
                <div className="group flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-muted-foreground/10 text-muted-foreground group-hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Phone Number</span>
                      <span className="text-sm font-bold text-foreground">{lead.phone}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary" 
                    title="Copy Phone"
                    onClick={() => handleCopy(lead.phone, "Phone")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Date Created */}
                <div className="flex items-center gap-4 p-4 hover:bg-muted/5 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-muted-foreground/10 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Creation Date</span>
                    <span className="text-sm font-bold text-foreground">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Agent Assigned */}
                <div className="flex items-center gap-4 p-4 hover:bg-muted/5 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-muted-foreground/10 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-wide">Lead Assignee</span>
                    <span className="text-sm font-bold text-foreground">
                      {(lead as any).assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
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
              {/* Pipeline Progress */}
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Pipeline Progress
                      </CardTitle>
                    </div>
                    <Badge 
                      variant={lead.status === "WON" ? "success" : lead.status === "LOST" ? "destructive" : "secondary"}
                      className={cn(
                        "font-bold uppercase tracking-wider text-[10px] border-none",
                        lead.status === "OPEN" && "bg-primary/10 text-primary"
                      )}
                    >
                      {lead.status === "OPEN" ? "Active Lead" : `Lead ${lead.status}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-8 space-y-8">
                  <div className="relative flex justify-between w-full px-4">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
                    
                    {["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATING", "FINAL"].map((step, idx) => {
                      const stages = ["NEW", "CONTACTED", "QUALIFIED", "NEGOTIATING"];
                      const currentStageIdx = stages.indexOf(lead.stage);
                      const isCompleted = idx <= currentStageIdx || (idx === 4 && lead.status !== "OPEN");
                      const isCurrent = idx === currentStageIdx && lead.status === "OPEN";
                      const isFinal = idx === 4;
                      
                      // Special handling for the final circle
                      let circleIcon = <span className="text-xs font-bold">{idx + 1}</span>;
                      let circleClass = "";
                      
                      if (isFinal) {
                        if (lead.status === "WON") {
                          circleIcon = <CheckCircle2 className="h-5 w-5" />;
                          circleClass = "bg-green-500 border-green-200 text-white";
                        } else if (lead.status === "LOST") {
                          circleIcon = <XCircle className="h-5 w-5" />;
                          circleClass = "bg-red-500 border-red-200 text-white";
                        }
                      } else if (isCompleted && !isCurrent) {
                        circleIcon = <CheckCircle2 className="h-5 w-5" />;
                      }

                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-sm",
                            isCompleted ? "bg-primary border-primary/20 text-primary-foreground" : "bg-background border-muted text-muted-foreground",
                            isCurrent && "ring-4 ring-primary/20 scale-110",
                            circleClass
                          )}>
                            {circleIcon}
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isCompleted ? (isFinal ? (lead.status === "WON" ? "text-green-600" : "text-red-600") : "text-primary") : "text-muted-foreground"
                          )}>
                            {isFinal ? (lead.status === "OPEN" ? "WON / LOST" : lead.status) : step}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons for Final Stages */}
                  {lead.stage === "NEGOTIATING" && lead.status === "OPEN" && (
                    <div className="flex items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-[10px] h-9 px-6 shadow-lg shadow-green-500/20"
                        onClick={() => editLeadMutation.mutate({ status: "WON" })}
                        disabled={editLeadMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                        Mark as Won
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="font-bold uppercase tracking-widest text-[10px] h-9 px-6 shadow-lg shadow-red-500/20"
                        onClick={() => editLeadMutation.mutate({ status: "LOST" })}
                        disabled={editLeadMutation.isPending}
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5" />
                        Mark as Lost
                      </Button>
                    </div>
                  )}

                  {/* Feedback for Completed Leads */}
                  {lead.status !== "OPEN" && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest",
                        lead.status === "WON" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                      )}>
                        {lead.status === "WON" ? <TrendingUp className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        Lead was closed as {lead.status}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-6">
                {/* Assignment Control */}
                <Card className="shadow-sm border-muted/60 overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b py-3">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <UserPlus className="h-3.5 w-3.5" />
                      Lead Ownership
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Left: Agent Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                            {((lead as any).assignedTo?.name || "U")[0]}
                          </div>
                          {(lead as any).assignedToId && (
                            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-background shadow-sm" title="Active Assignee" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">Currently Assigned</span>
                          <span className="text-xl font-bold text-foreground">
                            {(lead as any).assignedTo?.name || "Unassigned"}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">Primary Sales Agent</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-3 w-full md:w-[320px]">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase text-muted-foreground/70">Reassign Agent</Label>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={lead.assignedToId || "unassigned"} 
                              onValueChange={handleAssignmentChange}
                              disabled={editLeadMutation.isPending}
                            >
                              <SelectTrigger className="flex-1 bg-muted/5 border-muted-foreground/10 hover:bg-muted/10 transition-colors h-10 text-sm font-medium">
                                <SelectValue placeholder="Select Agent..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned" className="text-muted-foreground italic">No Agent</SelectItem>
                                {users?.map((user: any) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {lead.assignedToId && (
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-10 w-10 shrink-0 border-muted-foreground/10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all"
                                onClick={() => handleAssignmentChange("unassigned")}
                                title="Release Lead"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b py-3">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <History className="h-3.5 w-3.5" />
                    Activity Timeline
                  </CardTitle>
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
              <Files leadId={id} />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <Card className="border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b py-3">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Insights & Analysis
                  </CardTitle>
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
