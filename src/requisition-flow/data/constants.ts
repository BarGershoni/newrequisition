import type { HiringPlanModule, HiringWorkflow } from "../types";

export const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];
export const LOCATIONS = ["New York, NY", "San Francisco, CA", "Austin, TX", "Chicago, IL", "Boston, MA", "Remote", "Hybrid"];
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Temporary"];
export const LEVELS = ["Entry", "Mid", "Senior", "Lead", "Manager", "Director"];
export const REQUISITION_TYPES = ["New headcount", "Backfill", "Replacement", "Conversion", "Evergreen"];
export const SALARY_BANDS = ["Band I · $50k–70k", "Band II · $70k–90k", "Band III · $90k–120k", "Band IV · $120k–150k", "Band V · $150k–200k"];
export const HIRING_TEAM_ROLES = ["Hiring Manager", "Recruiter", "Recruiting Coordinator", "Interviewer", "Sourcer", "HR Business Partner"];
export const OPENING_STATUSES = ["Open", "Filled", "On Hold", "Cancelled"];
export const OPENING_REASONS = ["New headcount", "Backfill", "Replacement", "Conversion", "Reorganization"];
export const APPLICATION_FORMS = ["Standard application", "Quick apply (resume only)", "Detailed application", "Internal mobility form", "Executive application"];
export const YEARS_OF_EXPERIENCE = ["No minimum", "1+ years", "2+ years", "3+ years", "5+ years", "8+ years", "10+ years"];
export const LOCATION_RADII = ["Exact location only", "Within 10 miles", "Within 25 miles", "Within 50 miles", "Within 100 miles", "Anywhere / Remote"];
export const EDUCATION_LEVELS = ["No requirement", "High school", "Associate degree", "Bachelor's degree", "Master's degree", "Doctorate"];

// Predefined hiring workflows — the end-to-end hiring plan for this requisition.
export const HIRING_WORKFLOWS: HiringWorkflow[] = [
  {
    id: "wf-quick",
    name: "Quick screen",
    summary: "Screening · 1 interview · Offer",
    description: "A lightweight plan for straightforward roles with a short evaluation loop.",
    steps: ["Application screening", "Recruiter phone screen", "Hiring manager interview", "Offer approval"],
  },
  {
    id: "wf-standard",
    name: "Standard",
    summary: "Screening · 2 interviews · 1 assessment · Offer",
    description: "The default plan for most full-time roles — balanced depth without extra rounds.",
    steps: ["Application screening", "Recruiter screen", "Hiring manager interview", "Skills assessment", "Team panel", "Reference check", "Offer approval"],
  },
  {
    id: "wf-technical",
    name: "Technical",
    summary: "Screening · 3 interviews · 2 assessments · Offer",
    description: "For engineering and technical IC roles with structured evaluation at each stage.",
    steps: ["Application screening", "Recruiter screen", "Technical phone screen", "Take-home exercise", "System design interview", "Team panel", "Reference check", "Offer approval"],
  },
  {
    id: "wf-executive",
    name: "Executive",
    summary: "Screening · 4 interviews · Case study · References · Offer",
    description: "Leadership and senior hires with stakeholder alignment and extended diligence.",
    steps: ["Application screening", "Executive recruiter screen", "Hiring manager interview", "Case presentation", "Leadership panel", "Culture & values interview", "Reference & background check", "Compensation review", "Offer approval"],
  },
  {
    id: "wf-sales",
    name: "Sales",
    summary: "Screening · Role play · 2 interviews · References · Offer",
    description: "Quota-carrying roles with pipeline simulation and deal-style evaluation.",
    steps: ["Application screening", "Recruiter screen", "Role-play exercise", "Hiring manager interview", "VP interview", "Reference check", "Offer approval"],
  },
  {
    id: "wf-design",
    name: "Design",
    summary: "Screening · Portfolio review · 2 interviews · Design exercise · Offer",
    description: "Product and UX hires with portfolio critique and a practical design challenge.",
    steps: ["Application screening", "Recruiter screen", "Portfolio review", "Design critique interview", "Cross-functional panel", "Design exercise", "Offer approval"],
  },
  {
    id: "wf-campus",
    name: "Campus / early career",
    summary: "Screening · Group exercise · 2 interviews · Offer",
    description: "University and early-career programs with cohort-friendly evaluation.",
    steps: ["Application screening", "Resume screen", "Group exercise", "Hiring manager interview", "Team meet & greet", "Offer approval"],
  },
  {
    id: "wf-contractor",
    name: "Contractor",
    summary: "Screening · 1 interview · Compliance · Offer",
    description: "Short-term and contract engagements with a fast path to start.",
    steps: ["Application screening", "Recruiter screen", "Hiring manager interview", "Compliance & paperwork", "Contract offer"],
  },
];

export const DEFAULT_WORKFLOW_ID = "wf-standard";

import type { PostingAudience } from "../types";

export interface PostingChannel {
  key: string;
  label: string;
  description: string;
  audience: PostingAudience;
}

export const POSTING_CHANNELS: PostingChannel[] = [
  // External — candidate-facing, public
  { key: "career-site", label: "Career site", description: "Your public careers page", audience: "External" },
  { key: "linkedin", label: "LinkedIn", description: "Professional network feed", audience: "External" },
  { key: "indeed", label: "Indeed", description: "Job aggregator", audience: "External" },
  { key: "glassdoor", label: "Glassdoor", description: "Reviews & jobs", audience: "External" },
  // Internal — employees only
  { key: "internal-board", label: "Internal job board", description: "Employee-only listings", audience: "Internal" },
  { key: "referrals", label: "Employee referrals", description: "Internal referral portal", audience: "Internal" },
  { key: "intranet", label: "Company intranet", description: "Homepage & announcements", audience: "Internal" },
  { key: "slack", label: "Slack announcement", description: "#jobs channel broadcast", audience: "Internal" },
];

export function channelsForAudience(audience: PostingAudience): PostingChannel[] {
  return POSTING_CHANNELS.filter((c) => c.audience === audience);
}

export const POSTING_LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Japanese"];

// The Hiring Plan modules — one plan per req, identical for all candidates.
export function defaultHiringPlanModules(): HiringPlanModule[] {
  return [
    { key: "pipeline", label: "Pipeline", description: "Stages candidates move through", configured: false, summary: "Not configured" },
    { key: "screening", label: "Screening questionnaires", description: "Knockout & pre-qualifying questions", configured: false, summary: "Not configured" },
    { key: "assessments", label: "Assessments", description: "Tests & take-home exercises", configured: false, summary: "Not configured" },
    { key: "scorecards", label: "Scorecards", description: "Structured evaluation criteria", configured: false, summary: "Not configured" },
    { key: "interview-plan", label: "Interview plan", description: "Rounds, interviewers & kits", configured: false, summary: "Not configured" },
    { key: "scheduling", label: "Scheduling", description: "Availability & auto-booking", configured: false, summary: "Not configured" },
    { key: "offer-approval", label: "Offer approval", description: "Offer routing & sign-off", configured: false, summary: "Not configured" },
    { key: "automations", label: "Automations", description: "Triggers, nudges & comms", configured: false, summary: "Not configured" },
  ];
}
