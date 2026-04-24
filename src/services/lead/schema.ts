import { z } from "zod";
import { LeadStage, LeadStatus } from "@/generated/prisma/enums";

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  stage: z.nativeEnum(LeadStage).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
});

export type ListLeadsParams = z.infer<typeof listLeadsQuerySchema>;

export const createLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  note: z.string().optional(),
});

export type CreateLeadRequest = z.infer<typeof createLeadSchema>;

export const editLeadSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  stage: z.nativeEnum(LeadStage).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
});

export type EditLeadRequest = z.infer<typeof editLeadSchema>;

export const leadIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type LeadIdParams = z.infer<typeof leadIdParamsSchema>;
