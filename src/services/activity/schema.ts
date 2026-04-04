import { z } from "zod";
import { ActivityType, LeadStatus, LeadStage } from "@/generated/prisma/enums";

const leadStatusSchema = z.enum([LeadStatus.OPEN, LeadStatus.WON, LeadStatus.LOST]);
const leadStageSchema = z.enum([LeadStage.NEW, LeadStage.CONTACTED, LeadStage.QUALIFIED, LeadStage.NEGOTIATING]);

export const createActivitySchema = z
  .object({
    leadId: z.string().uuid(),
    actorId: z.string().uuid(),
    type: z.nativeEnum(ActivityType),
    meta: z
      .object({
        from: z.unknown(),
        to: z.unknown(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      ["STATUS_CHANGE", "STAGE_CHANGE", "ASSIGNMENT_CHANGE"].includes(data.type)
    ) {
      if (!data.meta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Meta is required for ${data.type}`,
          path: ["meta"],
        });
        return;
      }

      switch (data.type) {
        case ActivityType.STATUS_CHANGE:
          leadStatusSchema.parse(data.meta.from);
          leadStatusSchema.parse(data.meta.to);
          break;
        case ActivityType.STAGE_CHANGE:
          leadStageSchema.parse(data.meta.from);
          leadStageSchema.parse(data.meta.to);
          break;
        case ActivityType.ASSIGNMENT_CHANGE:
          z.string().parse(data.meta.from);
          z.string().parse(data.meta.to);
          break;
        default:
          break;
      }
    }
  });

export const createManyActivitiesSchema = z.array(createActivitySchema);

export const getLeadActivitiesSchema = z.object({
  leadId: z.string().uuid(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const createCallAttemptSchema = z.object({
  outcome: z.enum([
    "NO_ANSWER",
    "ANSWERED",
    "WRONG_NUMBER",
    "BUSY",
    "CALL_BACK_LATER",
  ]),
  notes: z.string().max(5000).optional(),
});

export type CreateActivityRequest = z.infer<typeof createActivitySchema>;
export type GetLeadActivitiesRequest = z.infer<typeof getLeadActivitiesSchema>;
export type CreateNoteRequest = z.infer<typeof createNoteSchema>;
export type CreateCallAttemptRequest = z.infer<typeof createCallAttemptSchema>;

export type ActivitySummaryItem = {
  id: string;
  type: ActivityType;
  content: string | null;
  createdAt: Date | string;
  actor: {
    name: string;
  };
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export type ListLeadActivitiesResponseData = {
  activities: ActivitySummaryItem[];
  pagination: PaginationMeta;
};
