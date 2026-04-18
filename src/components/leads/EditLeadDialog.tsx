"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editLeadSchema, type EditLeadRequest } from "@/services/lead/schema";
import { useEditLead } from "@/lib/tanstack/useLeads";
import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { Lead } from "@/generated/prisma/client";

interface EditLeadDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadDialog({
  lead,
  open,
  onOpenChange,
}: EditLeadDialogProps) {
  const { mutate: updateLead, isPending } = useEditLead(lead.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditLeadRequest>({
    resolver: zodResolver(editLeadSchema),
    defaultValues: {
      name: lead.name,
      email: lead.email ?? undefined,
      phone: lead.phone,
      status: lead.status as LeadStatus,
      stage: lead.stage as LeadStage,
      assignedToId: lead.assignedToId ?? undefined,
    },
  });

  const currentStatus = watch("status");
  const currentStage = watch("stage");

  const onSubmit = (data: EditLeadRequest) => {
    updateLead(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Lead: {lead.name}</DialogTitle>
          <DialogDescription>
            Update the lead's details. Any status or stage changes will be
            logged to the activity timeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Field orientation="vertical">
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field orientation="vertical">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field orientation="vertical">
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
                <FieldError errors={[errors.phone]} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field orientation="vertical">
                <FieldLabel>Status</FieldLabel>
                <Select
                  value={currentStatus}
                  onValueChange={(val) => setValue("status", val as LeadStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LeadStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.status]} />
              </Field>

              <Field orientation="vertical">
                <FieldLabel>Stage</FieldLabel>
                <Select
                  value={currentStage}
                  onValueChange={(val) => setValue("stage", val as LeadStage)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LeadStage).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.stage]} />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
