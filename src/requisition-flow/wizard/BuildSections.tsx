import { useState, useRef, useEffect } from "react";
import { Plus, Minus, Trash2, Link2, LayoutList, Users, DollarSign, Briefcase, CheckCircle2, AlertTriangle, Target, X, GitBranch, CalendarDays, Mail, Send, ChevronDown, ChevronRight, Search, Lock, Sparkles, RefreshCw, UserPlus, Check, Pencil } from "lucide-react";
import type { Requisition, Opening, HiringTeamMember, ApprovalStep, IdealCandidate, MatchProfile } from "../types";
import { hiringManagerOf } from "../types";
import { PhenomDropdown } from "@/app/components/phenom";
import { systemUserOptions } from "@/app/data/systemUsers";
import { unlinkedOpeningOptions } from "../data/openings";
import { DEPARTMENTS, LOCATIONS, EMPLOYMENT_TYPES, LEVELS, SALARY_BANDS, HIRING_TEAM_ROLES, OPENING_STATUSES, OPENING_REASONS, REQUISITION_TYPES, HIRING_WORKFLOWS, YEARS_OF_EXPERIENCE, LOCATION_RADII, EDUCATION_LEVELS } from "../data/constants";
import { poppins, Field, TextField, SelectField, NativeSelect, Button, SectionCard, StatusPill, Avatar } from "../components/primitives";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/components/ui/command";

// ─── Job Details ────────────────────────────────────────────────────────────────

export function JobDetailsSection({ req, onChange }: { req: Requisition; onChange: (p: Partial<Requisition>) => void }) {
  return (
    <SectionCard title="Job details" description="The core attributes of this requisition." icon={<Briefcase className="size-[16px]" />}>
      <div className="grid grid-cols-2 gap-[16px]">
        <Field label="Job title" className="col-span-2">
          <TextField value={req.title} onChange={(v) => onChange({ title: v })} placeholder="e.g. Senior Software Engineer" />
        </Field>
        <Field label="Requisition type"><SelectField value={req.requisitionType} onChange={(v) => onChange({ requisitionType: v })} options={REQUISITION_TYPES} placeholder="Select type" /></Field>
        <Field label="Visibility">
          <button
            type="button"
            role="switch"
            aria-checked={!!req.confidential}
            onClick={() => onChange({ confidential: !req.confidential })}
            className="flex w-full items-center gap-[10px] h-[40px] px-[12px] rounded-[8px] border border-[#d1d5dc] bg-white hover:border-[#8c95a8] transition-colors"
            style={poppins}
          >
            <Lock className="size-[15px] text-[#637085] shrink-0" />
            <span className="text-[14px] text-[#353b46] flex-1 text-left">Confidential</span>
            <span className={`relative inline-flex h-[22px] w-[40px] items-center rounded-full transition-colors shrink-0 ${req.confidential ? "bg-[#4d3ee0]" : "bg-[#d1d5dc]"}`}>
              <span className={`inline-block size-[16px] rounded-full bg-white shadow-sm transition-transform ${req.confidential ? "translate-x-[21px]" : "translate-x-[3px]"}`} />
            </span>
          </button>
        </Field>
        <Field label="Department"><SelectField value={req.department} onChange={(v) => onChange({ department: v })} options={DEPARTMENTS} placeholder="Select department" /></Field>
        <Field label="Primary location"><SelectField value={req.location} onChange={(v) => onChange({ location: v })} options={LOCATIONS} placeholder="Select location" /></Field>
        <Field label="Employment type"><SelectField value={req.employmentType} onChange={(v) => onChange({ employmentType: v })} options={EMPLOYMENT_TYPES} /></Field>
        <Field label="Level"><SelectField value={req.level} onChange={(v) => onChange({ level: v })} options={LEVELS} placeholder="Select level" /></Field>
      </div>
    </SectionCard>
  );
}

// ─── Hiring workflow ──────────────────────────────────────────────────────────────

export function HiringWorkflowSection({ req, onChange }: { req: Requisition; onChange: (p: Partial<Requisition>) => void }) {
  const wf = HIRING_WORKFLOWS.find((w) => w.id === req.workflowId);
  return (
    <SectionCard title="Hiring workflow" description="Select a predefined hiring plan for this job." icon={<GitBranch className="size-[16px]" />}>
      <div className="flex flex-col gap-[16px]">
        <Field label="Workflow">
          <PhenomDropdown
            value={req.workflowId}
            onChange={(v) => onChange({ workflowId: v })}
            options={HIRING_WORKFLOWS.map((w) => ({
              value: w.id,
              label: w.name,
              description: w.summary,
              keywords: w.description,
            }))}
            placeholder="Select a hiring workflow"
            searchPlaceholder="Search workflows…"
          />
        </Field>

        {wf && (
          <div className="rounded-[10px] border border-[#e8eaee] bg-[#f8f9fb] px-[14px] py-[12px]">
            <div className="flex items-center justify-between gap-[12px] mb-[10px]">
              <div className="flex flex-col gap-[1px] min-w-0">
                <span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>{wf.name}</span>
                <span className="text-[12px] text-[#637085] truncate" style={poppins}>{wf.summary}</span>
              </div>
              <span className="shrink-0 inline-flex items-center rounded-full bg-[#eef0fb] text-[#2927b2] text-[11px] font-medium px-[9px] py-[3px] whitespace-nowrap" style={poppins}>{wf.steps.length} stages</span>
            </div>
            <div className="flex flex-wrap items-center gap-[6px]">
              {wf.steps.map((step, i) => (
                <div key={step} className="flex items-center gap-[6px]">
                  <div className="inline-flex items-center gap-[6px] pl-[4px] pr-[10px] py-[3px] rounded-full bg-white border border-[#e3e1f7]">
                    <span className={`flex items-center justify-center size-[17px] rounded-full text-[10px] font-semibold shrink-0 ${i === 0 ? "bg-[#4d3ee0] text-white" : "bg-[#eae8fb] text-[#2927b2]"}`} style={poppins}>{i + 1}</span>
                    <span className="text-[12px] text-[#353b46] whitespace-nowrap" style={poppins}>{step}</span>
                  </div>
                  {i < wf.steps.length - 1 && <ChevronRight className="size-[13px] text-[#c0c6d0] shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─── Matching Criteria (ideal-candidate profile) ─────────────────────────────────

function TagInput({ label, hint, value, onChange, placeholder }: { label: string; hint?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  function add() {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  }
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap items-center gap-[6px] px-3 py-[7px] bg-white border border-[#d1d5dc] rounded-[8px] focus-within:border-[#4d3ee0] focus-within:ring-1 focus-within:ring-[#4d3ee0] transition-colors">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-[5px] bg-[#eae8fb] text-[#2927b2] rounded-[6px] px-[8px] py-[3px] text-[12px] font-medium" style={poppins}>
            {tag}
            <button onClick={() => onChange(value.filter((t) => t !== tag))}><X className="size-[11px]" /></button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          onBlur={add}
          placeholder={value.length === 0 ? placeholder : "Add…"}
          className="flex-1 min-w-[100px] text-[13px] text-[#353b46] placeholder-[#8c95a8] bg-transparent outline-none py-[2px]"
          style={poppins}
        />
      </div>
    </Field>
  );
}

export function IntakeMeetingSection({ req, onChange }: { req: Requisition; onChange: (p: Partial<Requisition>) => void }) {
  const hiringManager = hiringManagerOf(req.hiringTeam);
  const intake = req.intake;
  const invited = intake.status === "Invited" || intake.status === "In progress" || intake.status === "Completed";
  function inviteIntake() {
    onChange({ intake: { ...intake, source: "meeting", status: "Invited", invitedTo: hiringManager } });
  }
  return (
    <SectionCard
      title="Intake meeting"
      description="Align on the role and the ideal candidate with the hiring manager. Approvals aren't required to send an invitation."
      icon={<CalendarDays className="size-[16px]" />}
    >
      <div className="flex items-center justify-between gap-[12px] px-[14px] py-[12px] rounded-[10px] bg-[#f8f9fb] border border-[#e8eaee]">
        <div className="flex items-center gap-[10px] min-w-0">
          <div className="flex items-center justify-center size-[34px] rounded-[8px] bg-[#eef0fb] text-[#2927b2] shrink-0"><CalendarDays className="size-[16px]" /></div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>{hiringManager ? `Intake meeting with ${hiringManager}` : "Intake meeting"}</span>
          </div>
        </div>
        {invited ? (
          <div className="flex items-center gap-[8px] shrink-0">
            <StatusPill status={intake.status} size="sm" />
            <Button variant="subtle" className="!py-[6px]" onClick={inviteIntake}><Send className="size-[14px]" /> Resend</Button>
          </div>
        ) : (
          <Button variant="subtle" className="shrink-0" onClick={inviteIntake} disabled={!hiringManager}><Mail className="size-[15px]" /> Invite for intake meeting</Button>
        )}
      </div>
    </SectionCard>
  );
}

// ─── Matching Criteria (ideal-candidate profile) ─────────────────────────────────

let profileSeq = 700;

function generatedCandidates(req: Requisition): MatchProfile[] {
  const role = req.title?.trim() || "Candidate";
  const loc = req.location || "Remote";
  return [
    { id: "gen-1", name: "Alex Rivera", title: `Senior ${role}`, company: "Northwind Labs", location: loc, source: "From job description" },
    { id: "gen-2", name: "Jordan Chen", title: role, company: "Brightwave", location: loc, source: "From job details" },
    { id: "gen-3", name: "Sam Taylor", title: role, company: "Vertex Group", location: loc, source: "Successful hire — similar role" },
  ];
}

function similarTitlesFor(req: Requisition): string[] {
  const t = req.title?.trim();
  if (!t) return [];
  return [t, `Senior ${t}`, `${t} II`];
}

function skillsFor(ic: IdealCandidate): string[] {
  if (ic.skills && ic.skills.length) return ic.skills;
  if (ic.mustHaveSkills && ic.mustHaveSkills.length) return ic.mustHaveSkills;
  return ["Communication", "Problem solving", "Collaboration"];
}

function generatedCriteria(req: Requisition): Partial<IdealCandidate> {
  const senior = ["Senior", "Lead", "Manager", "Director"].includes(req.level);
  return {
    similarTitles: similarTitlesFor(req),
    skills: req.idealCandidate.mustHaveSkills?.length ? req.idealCandidate.mustHaveSkills : [`Core ${req.department || "role"} skills`, "Communication", "Problem solving"],
    yearsExperience: senior ? "5+ years" : "3+ years",
    locationRadius: req.location === "Remote" ? "Anywhere / Remote" : "Within 25 miles",
    education: "Bachelor's degree",
    profiles: generatedCandidates(req),
  };
}

export function MatchingCriteriaSection({ req, onChange }: { req: Requisition; onChange: (p: Partial<Requisition>) => void }) {
  const ic = req.idealCandidate;
  const setIdeal = (partial: Partial<IdealCandidate>) => onChange({ idealCandidate: { ...ic, ...partial } });

  // Auto-selected values; show generated suggestions until the user adjusts them.
  const similarTitles = ic.similarTitles ?? similarTitlesFor(req);
  const skills = ic.skills ?? skillsFor(ic);
  const yearsExperience = ic.yearsExperience ?? "";
  const locationRadius = ic.locationRadius ?? "";
  const education = ic.education ?? "";

  const candidates = ic.profiles ?? generatedCandidates(req);
  const setCandidates = (next: MatchProfile[]) => setIdeal({ profiles: next });
  function addCandidate() {
    profileSeq += 1;
    setCandidates([...candidates, { id: `mp${profileSeq}`, name: "New candidate", title: req.title?.trim() || "", company: "", location: req.location || "", source: "Manually added" }]);
  }
  function removeCandidate(id: string) {
    setCandidates(candidates.filter((c) => c.id !== id));
  }
  function regenerate() {
    setIdeal(generatedCriteria(req));
  }

  return (
    <SectionCard
      title="Matching criteria"
      description="Auto-generated from the job description and job details — adjust to help the AI sourcing agent find the most relevant candidates."
      icon={<Target className="size-[16px]" />}
      action={<Button variant="subtle" className="!py-[7px]" onClick={regenerate}><RefreshCw className="size-[14px]" /> Regenerate</Button>}
    >
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-[10px] bg-[#eef0fb] border border-[#dcdffb]">
          <Sparkles className="size-[16px] text-[#2927b2] shrink-0" />
          <span className="text-[12px] text-[#637085]" style={poppins}>These criteria were generated from the job description and job details. Edit anything to steer the AI sourcing agent.</span>
        </div>

        <TagInput label="Similar job titles" value={similarTitles} onChange={(v) => setIdeal({ similarTitles: v })} placeholder="Type a job title, press Enter" />
        <TagInput label="Skills" value={skills} onChange={(v) => setIdeal({ skills: v })} placeholder="Type a skill, press Enter" />
        <div className="grid grid-cols-3 gap-[16px]">
          <Field label="Years of experience"><SelectField value={yearsExperience} onChange={(v) => setIdeal({ yearsExperience: v })} options={YEARS_OF_EXPERIENCE} placeholder="Select" /></Field>
          <Field label="Location radius"><SelectField value={locationRadius} onChange={(v) => setIdeal({ locationRadius: v })} options={LOCATION_RADII} placeholder="Select" /></Field>
          <Field label="Education"><SelectField value={education} onChange={(v) => setIdeal({ education: v })} options={EDUCATION_LEVELS} placeholder="Select" /></Field>
        </div>

        {/* Ideal candidates */}
        <div className="flex flex-col gap-[10px] pt-[6px]" style={{ borderTop: "1px solid #eceef2" }}>
          <div className="flex items-center justify-between gap-[12px] pt-[10px]">
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>Ideal candidates</span>
              <span className="text-[12px] text-[#637085]" style={poppins}>Auto-selected from the job description, job details, and successful hires from similar past roles.</span>
            </div>
            <Button variant="subtle" className="!py-[7px] shrink-0" onClick={addCandidate}><UserPlus className="size-[14px]" /> Add candidate</Button>
          </div>

          {candidates.length < 3 && (
            <div className="flex items-center gap-[8px] px-[12px] py-[9px] rounded-[10px] bg-[#fff8e1] border border-[#ffe0a3]">
              <AlertTriangle className="size-[15px] text-[#e65100] shrink-0" />
              <span className="text-[12px] text-[#637085]" style={poppins}>Recommended: include at least 3 ideal candidates so the sourcing agent has enough signal.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-[10px]">
            {candidates.map((c) => (
              <div key={c.id} className="flex items-start gap-[10px] p-[12px] rounded-[10px] border border-[#e8eaee] bg-white">
                <Avatar name={c.name} size={36} />
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-[#353b46] truncate" style={poppins}>{c.name}</span>
                  <span className="text-[12px] text-[#637085] truncate" style={poppins}>{c.title}{c.company ? ` · ${c.company}` : ""}</span>
                  {c.location && <span className="text-[11px] text-[#8c95a8] truncate" style={poppins}>{c.location}</span>}
                  <span className="inline-flex items-center gap-[4px] text-[11px] font-medium text-[#4d3ee0] mt-[2px]" style={poppins}><Sparkles className="size-[11px]" /> {c.source}</span>
                </div>
                <button onClick={() => removeCandidate(c.id)} className="flex items-center justify-center size-[28px] rounded-[8px] text-[#637085] hover:bg-[#fce4ec] hover:text-[#c62828] transition-colors shrink-0"><X className="size-[14px]" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Budget · Headcount · Approval chain ─────────────────────────────────────────

export function BudgetApprovalSection({ req, openingCount, onChange, onAddApprover, onDeleteApprover, onChangeApprover, onAddSeat, onRemoveSeat }: {
  req: Requisition;
  openingCount: number;
  onChange: (p: Partial<Requisition>) => void;
  onAddApprover: () => void;
  onDeleteApprover: (id: string) => void;
  onChangeApprover: (id: string, field: keyof ApprovalStep, value: string) => void;
  /** when provided, headcount becomes an editable stepper that adds/removes seats */
  onAddSeat?: () => void;
  onRemoveSeat?: () => void;
}) {
  const usedApprovers = new Set(req.approvalChain.map((a) => a.approver).filter(Boolean));
  const editableHeadcount = Boolean(onAddSeat && onRemoveSeat);
  return (
    <div className="flex flex-col gap-[16px]">
      <SectionCard title="Budget & headcount" description={editableHeadcount ? "Set the headcount, salary band, and total budget." : "Headcount is derived from the linked openings."} icon={<DollarSign className="size-[16px]" />}>
        <div className="grid grid-cols-3 gap-[16px]">
          <Field label="Salary band"><SelectField value={req.salaryBand} onChange={(v) => onChange({ salaryBand: v })} options={SALARY_BANDS} placeholder="Select band" /></Field>
          <Field label="Total budget"><TextField value={req.budget} onChange={(v) => onChange({ budget: v })} placeholder="e.g. $280,000" /></Field>
          <Field label="Headcount" hint={editableHeadcount ? "(seats to fill)" : "(from openings)"}>
            {editableHeadcount ? (
              <div className="flex items-center gap-[2px] p-[3px] rounded-[8px] bg-[#f8f9fb] border border-[#d1d5dc] w-fit">
                <button onClick={onRemoveSeat} disabled={openingCount <= 1} className="flex items-center justify-center size-[30px] rounded-[6px] text-[#464f5e] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Minus className="size-[15px]" /></button>
                <span className="w-[36px] text-center text-[15px] font-semibold text-[#353b46]" style={poppins}>{openingCount}</span>
                <button onClick={onAddSeat} className="flex items-center justify-center size-[30px] rounded-[6px] text-[#464f5e] hover:bg-white transition-colors"><Plus className="size-[15px]" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-[8px] px-3 py-[9px] bg-[#f8f9fb] border border-[#d1d5dc] rounded-[8px]">
                <LayoutList className="size-[15px] text-[#637085]" />
                <span className="text-[14px] font-medium text-[#353b46]" style={poppins}>{openingCount} {openingCount === 1 ? "seat" : "seats"}</span>
              </div>
            )}
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Approval chain"
        description="Who signs off before this requisition can open."
        icon={<CheckCircle2 className="size-[16px]" />}
        action={<Button variant="subtle" onClick={onAddApprover} className="!py-[7px]"><Plus className="size-[14px]" /> Add approver</Button>}
      >
        {req.approvalChain.length === 0 ? (
          <div className="text-center py-[24px]"><span className="text-[13px] text-[#637085]" style={poppins}>No approvers yet. Add at least one to route for approval.</span></div>
        ) : (
          <div className="flex flex-col gap-[8px]">
            {req.approvalChain.map((a, i) => (
              <div key={a.id} className="flex items-center gap-[10px]">
                <span className="flex items-center justify-center size-[24px] rounded-full bg-[#eae8fb] text-[#2927b2] text-[12px] font-semibold shrink-0" style={poppins}>{i + 1}</span>
                <div className="flex-1"><PhenomDropdown value={a.approver} onChange={(v) => onChangeApprover(a.id, "approver", v)} options={systemUserOptions(usedApprovers, a.approver)} placeholder="Select approver" /></div>
                <div className="w-[200px]"><TextField value={a.role} onChange={(v) => onChangeApprover(a.id, "role", v)} placeholder="Role / title" /></div>
                <StatusPill status={a.state} size="sm" />
                <button onClick={() => onDeleteApprover(a.id)} className="flex items-center justify-center size-[32px] rounded-[8px] text-[#637085] hover:bg-[#fce4ec] hover:text-[#c62828] transition-colors shrink-0"><Trash2 className="size-[15px]" /></button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Org structure & Hiring team ─────────────────────────────────────────────────

export function HiringTeamSection({ req, onAddMember, onDeleteMember, onChangeMember }: {
  req: Requisition;
  onAddMember: () => void;
  onDeleteMember: (id: string) => void;
  onChangeMember: (id: string, field: keyof HiringTeamMember, value: string) => void;
}) {
  const usedNames = new Set(req.hiringTeam.map((m) => m.name).filter(Boolean));
  return (
    <SectionCard
      title="Org structure & hiring team"
      description="Team members assigned to this job's hiring team."
      icon={<Users className="size-[16px]" />}
      action={<Button variant="subtle" onClick={onAddMember} className="!py-[7px]"><Plus className="size-[14px]" /> Add member</Button>}
    >
      <div className="flex flex-col gap-[8px]">
        {req.hiringTeam.map((m) => (
          <div key={m.id} className="flex items-center gap-[10px]">
            <Avatar name={m.name} size={32} />
            <div className="flex-1"><PhenomDropdown value={m.name} onChange={(v) => onChangeMember(m.id, "name", v)} options={systemUserOptions(usedNames, m.name)} placeholder="Select team member" /></div>
            <div className="w-[220px]"><SelectField value={m.role} onChange={(v) => onChangeMember(m.id, "role", v)} options={HIRING_TEAM_ROLES} /></div>
            <button onClick={() => onDeleteMember(m.id)} className="flex items-center justify-center size-[32px] rounded-[8px] text-[#637085] hover:bg-[#fce4ec] hover:text-[#c62828] transition-colors shrink-0"><Trash2 className="size-[15px]" /></button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Openings ────────────────────────────────────────────────────────────────────

interface OpeningOption { value: string; label: string; description?: string; keywords?: string }

function AddOpeningControl({ linkOptions, onAddNew, onLinkExisting }: {
  linkOptions: OpeningOption[];
  onAddNew: () => void;
  onLinkExisting: (openingId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center justify-center gap-[8px] px-[16px] py-[9px] rounded-[10px] text-[14px] font-medium tracking-[0.3px] text-white bg-[#4d3ee0] hover:bg-[#4434c4] transition-colors shadow-sm" style={poppins}>
          <Plus className="size-[16px]" /> Add opening <ChevronDown className="size-[14px] opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 border-[#d1d5dc] rounded-[8px] shadow-lg" style={poppins}>
        {/* Create new — always available */}
        <button
          type="button"
          onClick={() => { onAddNew(); setOpen(false); }}
          className="flex items-center gap-[10px] w-full text-left px-[12px] py-[11px] hover:bg-[#f8f9fb] transition-colors"
          style={{ borderBottom: "1px solid #e8eaee" }}
        >
          <div className="flex items-center justify-center size-[30px] rounded-[8px] bg-[#e8f5e9] text-[#2e7d32] shrink-0"><Plus className="size-[16px]" /></div>
          <div className="flex flex-col gap-[1px] flex-1 min-w-0">
            <span className="text-[13px] font-medium text-[#353b46]">Create a new opening</span>
            <span className="text-[12px] text-[#637085] truncate">Add a brand-new seat to this requisition</span>
          </div>
        </button>

        {/* Link an existing opening */}
        {linkOptions.length > 0 ? (
          <Command filter={(itemValue, search) => (itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}>
            <div className="flex items-center gap-2 border-b border-[#e8eaee] px-3">
              <Search className="w-3.5 h-3.5 text-[#637085] shrink-0" />
              <CommandInput placeholder="Search existing openings…" className="h-9 border-0 shadow-none focus:ring-0 text-[13px] text-[#353b46] placeholder:text-[#8c95a8]" />
            </div>
            <CommandList className="max-h-[240px]">
              <CommandEmpty className="py-6 text-center text-[13px] text-[#637085]">No matching openings.</CommandEmpty>
              <CommandGroup heading="Link an existing opening" className="p-1">
                {linkOptions.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={`${o.label} ${o.description ?? ""} ${o.keywords ?? ""}`}
                    onSelect={() => { onLinkExisting(o.value); setOpen(false); }}
                    className="flex items-center gap-2 rounded-[6px] px-2 py-2 cursor-pointer aria-selected:bg-[#eae8fb] aria-selected:text-[#2927b2]"
                  >
                    <div className="flex items-center justify-center size-[28px] rounded-[8px] bg-[#eef0fb] text-[#2927b2] shrink-0"><Link2 className="size-[14px]" /></div>
                    <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-[#353b46] truncate">{o.label}</span>
                      {o.description && <span className="text-[12px] text-[#637085] truncate">{o.description}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <div className="px-[12px] py-[12px] text-[12px] text-[#8c95a8]" style={poppins}>No unlinked openings available to link.</div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function OpeningsSection({ openings, allOpenings, onAddNew, onLinkExisting, onChange, onDelete }: {
  openings: Opening[];
  allOpenings: Opening[];
  onAddNew: () => void;
  onLinkExisting: (openingId: string) => void;
  onChange: (rowId: string, field: keyof Opening, value: string) => void;
  onDelete: (rowId: string) => void;
}) {
  const usedIds = new Set(openings.map((o) => o.id));
  const linkOptions = unlinkedOpeningOptions(allOpenings, usedIds, "");

  const [manageMode, setManageMode] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevIdsRef = useRef<string[]>(openings.map((o) => o.id));
  useEffect(() => {
    const cur = openings.map((o) => o.id);
    const added = cur.filter((id) => !prevIdsRef.current.includes(id));
    if (added.length) setNewIds((prev) => new Set([...prev, ...added]));
    prevIdsRef.current = cur;
  }, [openings]);

  function toggleManage() {
    setManageMode((m) => {
      if (m) setNewIds(new Set());
      return !m;
    });
  }
  function doneEditing(id: string) {
    setNewIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  return (
    <SectionCard
      title="Openings"
      description="Each requisition needs at least one seat. Add new seats or link existing unlinked ones."
      icon={<LayoutList className="size-[16px]" />}
      action={
        <div className="flex items-center gap-[8px]">
          {openings.length > 0 && (
            <Button variant={manageMode ? "subtle" : "ghost"} onClick={toggleManage}>
              {manageMode ? <><Check className="size-[15px]" /> Done</> : <><Pencil className="size-[15px]" /> Manage openings</>}
            </Button>
          )}
          <AddOpeningControl linkOptions={linkOptions} onAddNew={onAddNew} onLinkExisting={onLinkExisting} />
        </div>
      }
    >
      {openings.length === 0 ? (
        <div className="flex items-center gap-[10px] justify-center py-[24px] text-[#c62828]">
          <AlertTriangle className="size-[16px]" />
          <span className="text-[13px]" style={poppins}>At least one opening is required.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {openings.map((o) => {
            const filled = o.status === "Filled";
            const editable = manageMode || newIds.has(o.id);

            if (!editable) {
              const meta = [o.location, o.employmentType, o.reason].filter(Boolean).join(" · ");
              const sub = [
                o.targetStartDate ? `Target start ${o.targetStartDate}` : "",
                o.hcmPositionLink ? `HCM: ${o.hcmPositionLink}` : "",
                filled && o.assignedHire ? `Hire: ${o.assignedHire}` : "",
              ].filter(Boolean).join(" · ");
              return (
                <div key={o.id} className="flex items-center gap-[12px] p-[14px] rounded-[12px] border border-[#e8eaee] bg-white">
                  <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>{o.id}</span>
                      <span className={`text-[10px] font-medium px-[6px] py-[1px] rounded-[4px] ${o.source === "existing" ? "bg-[#e3f2fd] text-[#1565c0]" : "bg-[#e8f5e9] text-[#2e7d32]"}`} style={poppins}>{o.source === "existing" ? "linked" : "new"}</span>
                      <StatusPill status={o.status} size="sm" />
                    </div>
                    {meta && <span className="text-[12px] text-[#637085] truncate" style={poppins}>{meta}</span>}
                    {sub && <span className="text-[11px] text-[#8c95a8] truncate" style={poppins}>{sub}</span>}
                  </div>
                </div>
              );
            }

            return (
              <div key={o.id} className="flex flex-col gap-[12px] p-[14px] rounded-[12px] border border-[#cac1f2] bg-white">
                <div className="flex items-center gap-[10px]">
                  <div className="flex items-center gap-[8px] flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>{o.id}</span>
                    <span className={`text-[10px] font-medium px-[6px] py-[1px] rounded-[4px] ${o.source === "existing" ? "bg-[#e3f2fd] text-[#1565c0]" : "bg-[#e8f5e9] text-[#2e7d32]"}`} style={poppins}>{o.source === "existing" ? "linked" : "new"}</span>
                  </div>
                  <div className="w-[150px]"><NativeSelect value={o.status} onChange={(v) => onChange(o.id, "status", v)} options={OPENING_STATUSES} /></div>
                  {!manageMode && (
                    <Button variant="subtle" className="!py-[6px]" onClick={() => doneEditing(o.id)}><Check className="size-[14px]" /> Done</Button>
                  )}
                  <button onClick={() => onDelete(o.id)} className="flex items-center justify-center size-[32px] rounded-[8px] text-[#637085] hover:bg-[#fce4ec] hover:text-[#c62828] transition-colors shrink-0"><Trash2 className="size-[15px]" /></button>
                </div>
                <div className="grid grid-cols-2 gap-[12px]">
                  <Field label="Location"><SelectField value={o.location} onChange={(v) => onChange(o.id, "location", v)} options={LOCATIONS} /></Field>
                  <Field label="Employment type"><SelectField value={o.employmentType} onChange={(v) => onChange(o.id, "employmentType", v)} options={EMPLOYMENT_TYPES} /></Field>
                  <Field label="Target start date">
                    <input type="date" value={o.targetStartDate} onChange={(e) => onChange(o.id, "targetStartDate", e.target.value)} className="w-full px-3 py-[9px] bg-white border border-[#d1d5dc] rounded-[8px] text-[14px] text-[#353b46] focus:outline-none focus:border-[#4d3ee0] focus:ring-1 focus:ring-[#4d3ee0]" style={poppins} />
                  </Field>
                  <Field label="Reason"><SelectField value={o.reason ?? ""} onChange={(v) => onChange(o.id, "reason", v)} options={OPENING_REASONS} placeholder="Select reason" /></Field>
                  <Field label="HCM position link" className="col-span-2"><TextField value={o.hcmPositionLink ?? ""} onChange={(v) => onChange(o.id, "hcmPositionLink", v)} placeholder="Paste the HCM position link or ID" /></Field>
                  {filled && (
                    <Field label="Assigned hire" className="col-span-2"><TextField value={o.assignedHire ?? ""} onChange={(v) => onChange(o.id, "assignedHire", v)} placeholder="Who was hired for this seat?" /></Field>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Review ──────────────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-[8px]" style={{ borderBottom: "1px solid #f3f3f5" }}>
      <span className="text-[13px] text-[#637085]" style={poppins}>{label}</span>
      <span className="text-[13px] font-medium text-[#353b46] text-right" style={poppins}>{value || "—"}</span>
    </div>
  );
}

export function ReviewSection({ req, openings, issues }: { req: Requisition; openings: Opening[]; issues: string[] }) {
  const configured = req.hiringPlan.modules.filter((m) => m.configured).length;
  return (
    <div className="flex flex-col gap-[16px]">
      {issues.length > 0 && (
        <div className="flex flex-col gap-[6px] px-[16px] py-[14px] rounded-[12px] bg-[#fff3e0] border border-[#ffe0a3]">
          <div className="flex items-center gap-[8px]"><AlertTriangle className="size-[16px] text-[#e65100]" /><span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>Resolve before sending for approval</span></div>
          <ul className="list-disc pl-[28px]">
            {issues.map((it) => <li key={it} className="text-[13px] text-[#637085]" style={poppins}>{it}</li>)}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 gap-[16px]">
        <SectionCard title="Requisition" icon={<Briefcase className="size-[16px]" />}>
          <SummaryRow label="Title" value={req.title} />
          <SummaryRow label="Department" value={req.department} />
          <SummaryRow label="Location" value={req.location} />
          <SummaryRow label="Level" value={req.level} />
          <SummaryRow label="Employment" value={req.employmentType} />
          <SummaryRow label="Salary band" value={req.salaryBand} />
        </SectionCard>
        <div className="flex flex-col gap-[16px]">
          <SectionCard title="Team & openings" icon={<Users className="size-[16px]" />}>
            <SummaryRow label="Hiring manager" value={hiringManagerOf(req.hiringTeam)} />
            <SummaryRow label="Team size" value={`${req.hiringTeam.filter((m) => m.name).length} members`} />
            <SummaryRow label="Openings" value={`${openings.length} ${openings.length === 1 ? "seat" : "seats"}`} />
            <SummaryRow label="Approval chain" value={`${req.approvalChain.length} step${req.approvalChain.length === 1 ? "" : "s"}`} />
          </SectionCard>
          <SectionCard title="Intake & hiring plan" icon={<CheckCircle2 className="size-[16px]" />}>
            <SummaryRow label="Intake" value={req.intake.status} />
            <SummaryRow label="Hiring plan" value={`${configured}/${req.hiringPlan.modules.length} modules configured`} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
