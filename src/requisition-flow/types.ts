// ─── Requisition Flow — Domain Model ────────────────────────────────────────────
// Three independent records joined by reference (not nesting), plus Intake feeder.
//
//   Requisition ──owns 1:1──▶ HiringPlan
//   Requisition ──has >=1───▶ Opening   (Opening.requisitionId may be null = unlinked seat)
//   Requisition ──0..N──────▶ Posting   (advertises the req, fans out to channel x language)
//   Requisition ──0..1──────▶ Intake    (feeds job + ideal-candidate fields)

// ─── Lifecycle enums (each record has its own state machine) ────────────────────

export type RequisitionStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Open"
  | "Filled"
  | "Closed"
  | "Cancelled";

export type OpeningStatus = "Open" | "Filled" | "On Hold" | "Cancelled";

export type PostingStatus = "Draft" | "Published" | "Paused" | "Closed";

export type PostingAudience = "Internal" | "External";

export type IntakeStatus = "Not started" | "Invited" | "In progress" | "Completed";

export type IntakeSource = "meeting" | "agent" | "form";

export type ApprovalState = "Pending" | "Approved" | "Rejected";

// ─── Opening — a seat ───────────────────────────────────────────────────────────

export interface Opening {
  id: string;
  /** null = unlinked seat (exists without a requisition) */
  requisitionId: string | null;
  title: string;
  location: string;
  employmentType: string;
  targetStartDate: string;
  status: OpeningStatus;
  /** how the seat entered this requisition draft */
  source: "new" | "existing";
  /** why this seat exists — new headcount, backfill, etc. */
  reason?: string;
  /** link/ID to the position record in the HCM system */
  hcmPositionLink?: string;
  /** who was hired into this seat (only relevant when status is "Filled") */
  assignedHire?: string;
}

// ─── Requisition sub-shapes ─────────────────────────────────────────────────────

export interface HiringTeamMember {
  id: string;
  name: string;
  role: string;
}

export interface ApprovalStep {
  id: string;
  approver: string;
  role: string;
  state: ApprovalState;
}

/** An ideal candidate the AI sourcing agent uses as a target to find similar candidates. */
export interface MatchProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  /** why this candidate was selected, e.g. "From job description" | "Successful hire — similar role" */
  source: string;
}

export interface IdealCandidate {
  summary: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  experience: string;
  /** matching criteria used by the AI sourcing agent (optional; generated when absent) */
  similarTitles?: string[];
  skills?: string[];
  yearsExperience?: string;
  locationRadius?: string;
  education?: string;
  /** auto-selected ideal candidates for the sourcing agent (optional; generated when absent) */
  profiles?: MatchProfile[];
}

export interface HiringPlanModule {
  key: string;
  label: string;
  description: string;
  configured: boolean;
  summary: string;
}

export interface HiringPlan {
  origin: "scratch" | "template" | "copied";
  /** label of the template / requisition the plan came from */
  originLabel: string;
  modules: HiringPlanModule[];
}

/** A predefined hiring plan workflow — screening through offer. */
export interface HiringWorkflow {
  id: string;
  name: string;
  /** one-line label for the dropdown, e.g. "Screening · 2 interviews · Offer" */
  summary: string;
  /** fuller preview copy shown below the dropdown */
  description: string;
  /** ordered stages a candidate moves through */
  steps: string[];
}

export interface Intake {
  status: IntakeStatus;
  source: IntakeSource | null;
  invitedTo: string;
  scheduledFor: string;
  notes: string;
}

// ─── Candidate-facing job content (what gets posted), per language ───────────────

export interface JobContentLocale {
  language: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  /** content was machine-translated from the primary language (cleared once edited) */
  autoTranslated?: boolean;
}

export interface JobContent {
  primaryLanguage: string;
  locales: JobContentLocale[];
}

// ─── Requisition — the central record ───────────────────────────────────────────

export interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  level: string;
  /** why this req exists — new headcount, backfill, etc. */
  requisitionType: string;
  /** confidential job — restricted visibility, hidden from public listings */
  confidential?: boolean;
  /** evergreen job — always-open pipeline, not tied to a single fill */
  evergreen?: boolean;
  status: RequisitionStatus;

  // job content (filled by intake)
  description: string;
  idealCandidate: IdealCandidate;

  // budget · headcount · approval chain
  salaryBand: string;
  budget: string;
  targetHeadcount: number;
  approvalChain: ApprovalStep[];

  // org structure & hiring team
  hiringTeam: HiringTeamMember[];
  /** selected predefined hiring workflow (interview & assessment plan) */
  workflowId: string;

  // owned + relations
  hiringPlan: HiringPlan;
  intake: Intake;
  /** candidate-facing description & benefits, in one or more languages */
  content: JobContent;
  /** per-audience overrides of the posted content — inherits from `content`, shared across all postings of that audience */
  postingContent?: { External?: PostingContentOverride; Internal?: PostingContentOverride };
  /** references to top-level Opening records */
  openingIds: string[];

  createdDate: string;
}

// ─── Posting — the advertisement (post-approval, req-level) ──────────────────────

export interface PostingVariant {
  id: string;
  channel: string;
  language: string;
  status: PostingStatus;
}

/** Overridable posted-content fields (inherit from the requisition's job description). */
export interface PostingContentOverride {
  description?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
}

export interface Posting {
  id: string;
  requisitionId: string;
  title: string;
  audience: PostingAudience;
  status: PostingStatus;
  variants: PostingVariant[];
  /** the application form candidates fill out for this posting (per posting) */
  applicationFormId?: string;
  /** brand career sites to publish to (external "Career site" channel; a company may run several brands) */
  careerSites?: string[];
}

// ─── Derived helpers ────────────────────────────────────────────────────────────

export function hiringManagerOf(team: HiringTeamMember[]): string {
  return team.find((m) => m.role === "Hiring Manager")?.name || team[0]?.name || "";
}

export function recruiterOf(team: HiringTeamMember[]): string {
  return (
    team.find((m) => m.role === "Recruiter")?.name ||
    team.find((m) => m.role !== "Hiring Manager")?.name ||
    ""
  );
}

export function linkedOpenings(req: Requisition, openings: Opening[]): Opening[] {
  return openings.filter((o) => req.openingIds.includes(o.id));
}

export function filledCount(req: Requisition, openings: Opening[]): number {
  return linkedOpenings(req, openings).filter((o) => o.status === "Filled").length;
}

export function postingsOf(req: Requisition, postings: Posting[]): Posting[] {
  return postings.filter((p) => p.requisitionId === req.id);
}

export function emptyLocale(language: string): JobContentLocale {
  return { language, description: "", responsibilities: "", requirements: "", benefits: "" };
}

export function localeCompleteness(locale: JobContentLocale): number {
  const fields = [locale.description, locale.responsibilities, locale.requirements, locale.benefits];
  return fields.filter((f) => f.trim().length > 0).length / fields.length;
}
