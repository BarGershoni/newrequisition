import type { HiringPlan, IdealCandidate } from "../types";
import { defaultHiringPlanModules } from "./constants";

export interface RequisitionTemplate {
  id: string;
  name: string;
  department: string;
  family: string;
  level: string;
  employmentType: string;
  description: string;
  idealCandidate: IdealCandidate;
  /** which hiring-plan modules come pre-configured by this template */
  configuredModuleKeys: string[];
}

export const REQUISITION_TEMPLATES: RequisitionTemplate[] = [
  {
    id: "t01", name: "Software Engineer", department: "Engineering", family: "Engineering", level: "Mid", employmentType: "Full-time",
    description: "Individual contributor building product features and infrastructure across the stack.",
    idealCandidate: {
      summary: "Pragmatic full-stack engineer who ships reliable features and collaborates well.",
      mustHaveSkills: ["JavaScript/TypeScript", "REST APIs", "Git", "Testing"],
      niceToHaveSkills: ["React", "Cloud (AWS/GCP)", "CI/CD"],
      experience: "3+ years building production software",
    },
    configuredModuleKeys: ["pipeline", "screening", "scorecards", "interview-plan"],
  },
  {
    id: "t02", name: "Senior Software Engineer", department: "Engineering", family: "Engineering", level: "Senior", employmentType: "Full-time",
    description: "Senior IC with technical leadership and cross-team influence.",
    idealCandidate: {
      summary: "Technical leader who drives architecture and mentors others.",
      mustHaveSkills: ["System design", "TypeScript", "Distributed systems", "Code review"],
      niceToHaveSkills: ["Kubernetes", "Observability", "Tech leadership"],
      experience: "6+ years, including ownership of large systems",
    },
    configuredModuleKeys: ["pipeline", "screening", "assessments", "scorecards", "interview-plan", "offer-approval"],
  },
  {
    id: "t04", name: "Product Manager", department: "Product", family: "Product", level: "Mid", employmentType: "Full-time",
    description: "Owns a product area — discovery, roadmap, and delivery.",
    idealCandidate: {
      summary: "Outcome-driven PM who balances user needs with business goals.",
      mustHaveSkills: ["Product discovery", "Roadmapping", "Data analysis", "Stakeholder management"],
      niceToHaveSkills: ["SQL", "Experimentation", "B2B SaaS"],
      experience: "4+ years in product management",
    },
    configuredModuleKeys: ["pipeline", "screening", "scorecards", "interview-plan", "scheduling"],
  },
  {
    id: "t06", name: "UX Designer", department: "Design", family: "Design", level: "Mid", employmentType: "Full-time",
    description: "End-to-end UX for a product area — research, wireframes, and delivery.",
    idealCandidate: {
      summary: "Systems thinker with a strong portfolio across research and visual design.",
      mustHaveSkills: ["Figma", "User research", "Prototyping", "Design systems"],
      niceToHaveSkills: ["Motion", "Front-end basics", "Accessibility"],
      experience: "3+ years in product design",
    },
    configuredModuleKeys: ["pipeline", "assessments", "scorecards", "interview-plan"],
  },
  {
    id: "t08", name: "Account Executive", department: "Sales", family: "Sales", level: "Mid", employmentType: "Full-time",
    description: "Closes new business and manages the full sales cycle.",
    idealCandidate: {
      summary: "Consultative closer with a track record of hitting quota.",
      mustHaveSkills: ["Pipeline management", "Negotiation", "CRM hygiene", "Discovery"],
      niceToHaveSkills: ["MEDDIC", "SaaS sales", "Outbound"],
      experience: "3+ years in B2B sales",
    },
    configuredModuleKeys: ["pipeline", "screening", "scorecards", "interview-plan", "automations"],
  },
  {
    id: "t09", name: "Data Scientist", department: "Engineering", family: "Data", level: "Mid", employmentType: "Full-time",
    description: "Builds models and insights from data to drive product and business decisions.",
    idealCandidate: {
      summary: "Rigorous analyst who turns data into decisions and ships models.",
      mustHaveSkills: ["Python", "SQL", "Statistics", "ML fundamentals"],
      niceToHaveSkills: ["Experimentation", "MLOps", "Data viz"],
      experience: "3+ years in data science or analytics",
    },
    configuredModuleKeys: ["pipeline", "assessments", "scorecards", "interview-plan"],
  },
];

const TEMPLATE_MODULE_SUMMARIES: Record<string, string> = {
  pipeline: "6-stage pipeline preset",
  screening: "3 knockout questions",
  assessments: "1 take-home exercise",
  scorecards: "Role-based scorecard",
  "interview-plan": "4-round interview loop",
  scheduling: "Auto-scheduling on",
  "offer-approval": "2-step offer approval",
  automations: "Stage-change nudges",
};

export function hiringPlanFromTemplate(template: RequisitionTemplate): HiringPlan {
  const modules = defaultHiringPlanModules().map((m) => {
    const configured = template.configuredModuleKeys.includes(m.key);
    return configured
      ? { ...m, configured: true, summary: TEMPLATE_MODULE_SUMMARIES[m.key] || "Configured" }
      : m;
  });
  return { origin: "template", originLabel: template.name, modules };
}
