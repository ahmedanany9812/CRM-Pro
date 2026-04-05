import { 
  generateLeadBriefSchema, 
  saveLeadBriefSchema, 
  generateCallFollowUpRequestSchema 
} from "./schema";
import { 
  generateLeadBrief, 
  getLastLeadBrief, 
  saveLeadBrief, 
  generateCallFollowup 
} from "./service";

export const AIService = {
  generateLeadBrief,
  saveLeadBrief,
  getLastLeadBrief,
  generateCallFollowup,
} as const;

export const AISchema = {
  generateLeadBrief: generateLeadBriefSchema,
  saveLeadBrief: saveLeadBriefSchema,
  generateCallFollowup: generateCallFollowUpRequestSchema,
} as const;

export * from "./schema";
