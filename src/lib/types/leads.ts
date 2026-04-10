import { LeadStage, LeadStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export { LeadStage, LeadStatus };

export const LeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  stage: z.nativeEnum(LeadStage),
  status: z.nativeEnum(LeadStatus),
  assignedToId: z.string().optional().nullable(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
