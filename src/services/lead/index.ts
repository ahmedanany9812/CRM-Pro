import {
  listLeads,
  createLead,
  getLead,
  updateLead,
  deleteLead,
  bulkReassignLeads,
} from "./service";

export const LeadService = {
  listLeads,
  createLead,
  getLead,
  updateLead,
  deleteLead,
  bulkReassignLeads,
} as const;
