import type { Requisition, HiringPlan, Intake, JobContent, JobContentLocale } from "../types";
import { emptyLocale } from "../types";
import { defaultHiringPlanModules, DEFAULT_WORKFLOW_ID } from "./constants";
import { REQUISITION_TEMPLATES, hiringPlanFromTemplate, type RequisitionTemplate } from "./templates";

const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const DEFAULT_BENEFITS =
  "Competitive salary and equity, comprehensive medical/dental/vision, 401(k) match, flexible PTO, learning budget, and a remote-friendly culture.";

function makeContent(language: string, parts: Partial<JobContentLocale> = {}): JobContent {
  return { primaryLanguage: language, locales: [{ ...emptyLocale(language), ...parts }] };
}

function completedIntake(): Intake {
  return { status: "Completed", source: "meeting", invitedTo: "", scheduledFor: "", notes: "" };
}

const SAMPLE_REQUISITIONS_RAW: Omit<Requisition, "content">[] = [
  {
    id: "REQ-2026-001", title: "Senior Product Analyst", department: "Product", location: "New York, NY",
    employmentType: "Full-time", level: "Senior", requisitionType: "New headcount", status: "Open",
    description: "Drive analytics across the product org, partnering with PMs to turn data into decisions.",
    idealCandidate: {
      summary: "Analytical partner who is fluent in SQL and product metrics.",
      mustHaveSkills: ["SQL", "Product analytics", "Experimentation"], niceToHaveSkills: ["Python", "dbt"],
      experience: "5+ years in product analytics",
    },
    salaryBand: "Band IV · $120k–150k", budget: "$280,000", targetHeadcount: 2,
    approvalChain: [
      { id: "a1", approver: "Rachel Patel", role: "VP Operations", state: "Approved" },
      { id: "a2", approver: "Morgan Lee", role: "Finance Manager", state: "Approved" },
    ],
    hiringTeam: [
      { id: "tm1", name: "Sarah Chen", role: "Hiring Manager" },
      { id: "tm2", name: "Jessica Wang", role: "Recruiter" },
    ],
    workflowId: "wf-standard",
    hiringPlan: { origin: "copied", originLabel: "Product Analyst 2025", modules: defaultHiringPlanModules() },
    intake: completedIntake(), openingIds: ["OPN-001", "OPN-002"], createdDate: "Jun 15, 2026",
  },
  {
    id: "REQ-2026-002", title: "UX Designer II", department: "Design", location: "San Francisco, CA",
    employmentType: "Full-time", level: "Mid", requisitionType: "Backfill", status: "Approved",
    description: "Own end-to-end UX for a core product surface.",
    idealCandidate: {
      summary: "Product designer with a strong systems portfolio.",
      mustHaveSkills: ["Figma", "User research", "Design systems"], niceToHaveSkills: ["Motion"],
      experience: "3+ years",
    },
    salaryBand: "Band III · $90k–120k", budget: "$130,000", targetHeadcount: 1,
    approvalChain: [{ id: "a1", approver: "Emily Johnson", role: "Design Lead", state: "Approved" }],
    hiringTeam: [
      { id: "tm1", name: "Emily Johnson", role: "Hiring Manager" },
      { id: "tm2", name: "Marcus Brown", role: "Recruiter" },
    ],
    workflowId: "wf-standard",
    hiringPlan: hiringPlanFromTemplate(REQUISITION_TEMPLATES.find((t) => t.id === "t06")!),
    intake: completedIntake(), openingIds: ["OPN-003"], createdDate: "Jun 14, 2026",
  },
  {
    id: "REQ-2026-003", title: "Senior Software Engineer", department: "Engineering", location: "Austin, TX",
    employmentType: "Full-time", level: "Senior", requisitionType: "New headcount", status: "Pending Approval",
    description: "Senior IC building backend services and mentoring the team.",
    idealCandidate: {
      summary: "Technical leader strong in distributed systems.",
      mustHaveSkills: ["System design", "TypeScript", "Distributed systems"], niceToHaveSkills: ["Kubernetes"],
      experience: "6+ years",
    },
    salaryBand: "Band V · $150k–200k", budget: "$510,000", targetHeadcount: 3,
    approvalChain: [
      { id: "a1", approver: "David Kim", role: "Senior Engineering Manager", state: "Approved" },
      { id: "a2", approver: "Morgan Lee", role: "Finance Manager", state: "Pending" },
    ],
    hiringTeam: [
      { id: "tm1", name: "David Kim", role: "Hiring Manager" },
      { id: "tm2", name: "Olivia Martinez", role: "Recruiter" },
    ],
    workflowId: "wf-technical",
    hiringPlan: hiringPlanFromTemplate(REQUISITION_TEMPLATES.find((t) => t.id === "t02")!),
    intake: completedIntake(), openingIds: ["OPN-004", "OPN-005", "OPN-006"], createdDate: "Jun 12, 2026",
  },
];

export const SAMPLE_REQUISITIONS: Requisition[] = SAMPLE_REQUISITIONS_RAW.map((r) => ({
  ...r,
  content: makeContent("English", {
    description: r.description,
    responsibilities: "Lead key initiatives in your area, collaborate cross-functionally, and own delivery end to end.",
    requirements: r.idealCandidate.mustHaveSkills.join(", "),
    benefits: DEFAULT_BENEFITS,
  }),
}));

let reqCounter = SAMPLE_REQUISITIONS.length;
export function nextRequisitionId(): string {
  reqCounter += 1;
  return `REQ-2026-0${String(reqCounter).padStart(2, "0")}`;
}

function blankIntake(): Intake {
  return { status: "Not started", source: null, invitedTo: "", scheduledFor: "", notes: "" };
}

function blankHiringPlan(): HiringPlan {
  return { origin: "scratch", originLabel: "", modules: defaultHiringPlanModules() };
}

export function makeBlankRequisition(): Requisition {
  return {
    id: nextRequisitionId(), title: "", department: "", location: "", employmentType: "Full-time",
    level: "", requisitionType: "New headcount", status: "Draft", description: "",
    idealCandidate: { summary: "", mustHaveSkills: [], niceToHaveSkills: [], experience: "" },
    salaryBand: "", budget: "", targetHeadcount: 1,
    approvalChain: [{ id: "ap1", approver: "Rachel Patel", role: "VP Operations", state: "Pending" }],
    hiringTeam: [
      { id: "tm1", name: "", role: "Hiring Manager" },
      { id: "tm2", name: "", role: "Recruiter" },
    ],
    workflowId: DEFAULT_WORKFLOW_ID,
    hiringPlan: blankHiringPlan(), intake: blankIntake(),
    content: makeContent("English"),
    openingIds: [], createdDate: today(),
  };
}

export function requisitionFromTemplate(template: RequisitionTemplate): Requisition {
  const base = makeBlankRequisition();
  return {
    ...base,
    title: template.name,
    department: template.department,
    employmentType: template.employmentType,
    level: template.level,
    description: template.description,
    idealCandidate: { ...template.idealCandidate },
    hiringPlan: hiringPlanFromTemplate(template),
    // intake starts not linked — the user sends an intake meeting invitation
    intake: blankIntake(),
    content: makeContent("English", {
      description: template.description,
      responsibilities: "Own the core responsibilities of this role and collaborate across the team.",
      requirements: template.idealCandidate.mustHaveSkills.join(", "),
      benefits: DEFAULT_BENEFITS,
    }),
  };
}

export function cloneRequisition(source: Requisition): Requisition {
  const base = makeBlankRequisition();
  return {
    ...base,
    title: source.title,
    department: source.department,
    location: source.location,
    employmentType: source.employmentType,
    level: source.level,
    requisitionType: source.requisitionType,
    description: source.description,
    idealCandidate: {
      summary: source.idealCandidate.summary,
      experience: source.idealCandidate.experience,
      mustHaveSkills: [...source.idealCandidate.mustHaveSkills],
      niceToHaveSkills: [...source.idealCandidate.niceToHaveSkills],
    },
    salaryBand: source.salaryBand,
    budget: source.budget,
    targetHeadcount: source.targetHeadcount,
    hiringTeam: source.hiringTeam.map((m, i) => ({ ...m, id: `tm${i + 1}` })),
    workflowId: source.workflowId,
    hiringPlan: {
      origin: "copied",
      originLabel: `${source.title} (${source.id})`,
      modules: source.hiringPlan.modules.map((m) => ({ ...m })),
    },
    // intake starts not linked — the user sends an intake meeting invitation
    intake: blankIntake(),
    content: {
      primaryLanguage: source.content.primaryLanguage,
      locales: source.content.locales.map((l) => ({ ...l })),
    },
  };
}
