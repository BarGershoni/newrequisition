import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Briefcase, CheckCircle2, Check, Send, GitBranch, Megaphone, FileText } from "lucide-react";
import type { Requisition, Opening, HiringTeamMember, ApprovalStep } from "../types";
import { linkedOpenings } from "../types";
import { makeBlankRequisition, cloneRequisition, requisitionFromTemplate } from "../data/requisitions";
import { nextOpeningId } from "../data/openings";
import { DEPARTMENTS, LOCATIONS, EMPLOYMENT_TYPES, LEVELS, REQUISITION_TYPES } from "../data/constants";
import { poppins, Field, TextField, SelectField, SectionCard } from "../components/primitives";
import { BudgetApprovalSection, HiringTeamSection, HiringWorkflowSection } from "./BuildSections";
import { hiringManagerOf } from "../types";
import { StartStep, type StartChoice } from "./StartStep";

let tmSeq = 500;
let apSeq = 500;

// Logical groupings for the Basic information stepper (Phenom DS vertical stepper).
const BASICS_STEPS = [
  { key: "details", title: "Job details", subtitle: "Role & type" },
  { key: "team", title: "Hiring team & workflow", subtitle: "Team members & hiring plan" },
  { key: "approval", title: "Budget & approval", subtitle: "Spend & sign-off" },
];

type Step = "choose" | "basics" | "sent";

export function CreateRequisitionModal({ open, onClose, requisitions, allOpenings, onSendForApproval, onSetupJob }: {
  open: boolean;
  onClose: () => void;
  requisitions: Requisition[];
  allOpenings: Opening[];
  onSendForApproval: (req: Requisition, openings: Opening[]) => void;
  onSetupJob: (req: Requisition, openings: Opening[], initialSection?: number) => void;
}) {
  const [step, setStep] = useState<Step>("choose");
  const [draft, setDraft] = useState<Requisition | null>(null);
  const [draftOpenings, setDraftOpenings] = useState<Opening[]>([]);
  const [basicsStep, setBasicsStep] = useState(0);
  const [basicsVisited, setBasicsVisited] = useState<Set<number>>(new Set([0]));

  if (!open) return null;

  function reset() {
    setStep("choose");
    setDraft(null);
    setDraftOpenings([]);
    setBasicsStep(0);
    setBasicsVisited(new Set([0]));
  }
  function goToBasics(i: number) {
    setBasicsVisited((prev) => new Set([...prev, basicsStep, i]));
    setBasicsStep(i);
  }
  function close() {
    reset();
    onClose();
  }

  function newSeat(req: Requisition, overrides: Partial<Opening> = {}): Opening {
    return {
      id: nextOpeningId(), requisitionId: req.id, title: req.title,
      location: req.location || "Remote", employmentType: req.employmentType || "Full-time",
      targetStartDate: "2026-10-01", status: "Open", source: "new", ...overrides,
    };
  }

  function choose(choice: StartChoice) {
    let req: Requisition;
    let seats: Opening[];
    if (choice.mode === "scratch") {
      req = makeBlankRequisition();
      seats = [newSeat(req)];
    } else if (choice.mode === "template") {
      req = requisitionFromTemplate(choice.template);
      seats = [newSeat(req)];
    } else {
      req = cloneRequisition(choice.requisition);
      const sourceSeats = linkedOpenings(choice.requisition, allOpenings);
      const count = Math.max(sourceSeats.length, 1);
      seats = Array.from({ length: count }, (_, i) =>
        newSeat(req, sourceSeats[i] ? { location: sourceSeats[i].location, employmentType: sourceSeats[i].employmentType, targetStartDate: sourceSeats[i].targetStartDate } : {}),
      );
    }
    setDraft(req);
    setDraftOpenings(seats);
    setBasicsStep(0);
    setBasicsVisited(new Set([0]));
    setStep("basics");
  }

  function update(partial: Partial<Requisition>) {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  // Hiring team — customizable members & roles
  function addMember() {
    tmSeq += 1;
    setDraft((prev) => (prev ? { ...prev, hiringTeam: [...prev.hiringTeam, { id: `tm${tmSeq}`, name: "", role: "Interviewer" }] } : prev));
  }
  function deleteMember(id: string) {
    setDraft((prev) => (prev ? { ...prev, hiringTeam: prev.hiringTeam.filter((m) => m.id !== id) } : prev));
  }
  function changeMember(id: string, field: keyof HiringTeamMember, value: string) {
    setDraft((prev) => (prev ? { ...prev, hiringTeam: prev.hiringTeam.map((m) => (m.id === id ? { ...m, [field]: value } : m)) } : prev));
  }

  // Approval chain
  function addApprover() {
    apSeq += 1;
    setDraft((prev) => (prev ? { ...prev, approvalChain: [...prev.approvalChain, { id: `ap${apSeq}`, approver: "", role: "", state: "Pending" }] } : prev));
  }
  function deleteApprover(id: string) {
    setDraft((prev) => (prev ? { ...prev, approvalChain: prev.approvalChain.filter((a) => a.id !== id) } : prev));
  }
  function changeApprover(id: string, field: keyof ApprovalStep, value: string) {
    setDraft((prev) => (prev ? { ...prev, approvalChain: prev.approvalChain.map((a) => (a.id === id ? { ...a, [field]: value } : a)) } : prev));
  }

  // Number of openings
  function addSeat() {
    setDraftOpenings((prev) => (draft ? [...prev, newSeat(draft)] : prev));
  }
  function removeSeat() {
    setDraftOpenings((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  const canContinue = Boolean(
    draft?.title.trim() && draft?.department && draft?.location &&
    draft && hiringManagerOf(draft.hiringTeam) &&
    draft && draft.approvalChain.some((a) => a.approver),
  );

  function finalSeats(req: Requisition): Opening[] {
    return draftOpenings.map((o) => ({ ...o, requisitionId: req.id, title: req.title || o.title }));
  }

  function send() {
    if (!draft) return;
    const seats = finalSeats(draft);
    const pending: Requisition = {
      ...draft,
      status: "Pending Approval",
      targetHeadcount: seats.length,
      openingIds: seats.map((o) => o.id),
    };
    setDraft(pending);
    setDraftOpenings(seats);
    onSendForApproval(pending, seats);
    setStep("sent");
  }

  function setupJobAt(initialSection: number) {
    if (!draft) return;
    const seats = finalSeats(draft);
    const next: Requisition = { ...draft, targetHeadcount: seats.length, openingIds: seats.map((o) => o.id) };
    onSetupJob(next, seats, initialSection);
    reset();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px]">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className={`relative bg-white rounded-[12px] shadow-2xl overflow-hidden flex flex-col w-full max-w-[900px] ${step === "sent" ? "max-h-[88vh]" : "h-[88vh] max-h-[620px]"}`}>
        {/* Header */}
        <div className="flex items-center gap-[16px] px-[24px] py-[16px]" style={{ borderBottom: "1px solid #e8eaee" }}>
          {step === "basics" && (
            <button onClick={() => setStep("choose")} className="flex items-center justify-center size-[32px] rounded-[8px] hover:bg-[#f3f3f5] transition-colors"><ArrowLeft className="size-[16px] text-[#464f5e]" /></button>
          )}
          <span className="text-[20px] font-semibold text-[#353b46] flex-1" style={poppins}>
            {step === "choose" ? "Create Job" : step === "basics" ? "Basic information" : "Sent for approval"}
          </span>
          <button onClick={close} className="flex items-center justify-center size-[36px] rounded-[10px] hover:bg-[#f3f3f5] transition-colors"><X className="size-[18px] text-[#464f5e]" /></button>
        </div>

        {step === "choose" && <StartStep requisitions={requisitions} onPick={choose} />}

        {step === "basics" && draft && (
          <div className="flex flex-1 min-h-0">
            {/* Left: Phenom DS vertical stepper */}
            <div className="w-[264px] shrink-0 bg-[#f8f9fb] overflow-y-auto p-[20px]" style={{ borderRight: "1px solid #e8eaee" }}>
              <div className="flex flex-col gap-[4px]">
                {BASICS_STEPS.map((s, i) => {
                  const isActive = i === basicsStep;
                  const isCompleted = basicsVisited.has(i) && !isActive;
                  const isLast = i === BASICS_STEPS.length - 1;
                  return (
                    <button key={s.key} onClick={() => goToBasics(i)} className="flex gap-[14px] items-stretch min-h-[52px] text-left w-full">
                      <div className="flex flex-col items-center shrink-0">
                        {isCompleted ? (
                          <div className="flex items-center justify-center rounded-full size-[28px] bg-[#eae8fb] shrink-0" style={{ border: "1px solid #cac1f2" }}>
                            <Check className="size-[14px] text-[#2927b2]" />
                          </div>
                        ) : isActive ? (
                          <div className="flex items-center justify-center rounded-full size-[28px] bg-[#4d3ee0] shrink-0">
                            <span className="text-[15px] font-medium text-white" style={poppins}>{i + 1}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center rounded-full size-[28px] bg-white shrink-0" style={{ border: "1px solid #d1d5dc" }}>
                            <span className="text-[15px] text-[#637085]" style={poppins}>{i + 1}</span>
                          </div>
                        )}
                        {!isLast && <div className="flex-1 w-px mt-[4px]" style={{ backgroundColor: isCompleted ? "#cac1f2" : "#d1d5dc" }} />}
                      </div>
                      <div className="flex flex-1 flex-col gap-[2px] min-w-0 pb-[16px] pt-[3px]">
                        <span className="text-[14px] leading-[20px] tracking-[0.3px] truncate" style={{ ...poppins, color: isActive ? "#2927b2" : "#464f5e", fontWeight: isActive || isCompleted ? 600 : 400 }}>{s.title}</span>
                        <span className="text-[12px] text-[#8c95a8] leading-[16px] truncate" style={poppins}>{s.subtitle}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: active step content */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex-1 overflow-y-auto px-[24px] py-[20px] flex flex-col gap-[16px]">
                {/* Step header */}
                <div className="flex items-start gap-[16px]">
                  <div className="flex flex-1 flex-col gap-[2px] min-w-0">
                    <span className="text-[18px] font-semibold text-[#353b46] leading-[26px]" style={poppins}>{BASICS_STEPS[basicsStep].title}</span>
                    <span className="text-[13px] text-[#637085] tracking-[0.3px]" style={poppins}>{BASICS_STEPS[basicsStep].subtitle}</span>
                  </div>
                  <div className="bg-[#f4f6fa] flex items-center justify-center px-[8px] h-[28px] rounded-[10px] shrink-0" style={{ border: "1px solid #d1d5dc" }}>
                    <span className="text-[12px] font-medium text-[#637085] tracking-[0.4px]" style={poppins}>Step {basicsStep + 1} of {BASICS_STEPS.length}</span>
                  </div>
                </div>

                {/* Step 1 — Job details */}
                {basicsStep === 0 && (
                  <SectionCard title="Job details" description="The core attributes of this requisition." icon={<Briefcase className="size-[16px]" />}>
                    <div className="grid grid-cols-2 gap-[16px]">
                      <Field label="Job title" className="col-span-2">
                        <TextField value={draft.title} onChange={(v) => update({ title: v })} placeholder="e.g. Senior Software Engineer" />
                      </Field>
                      <Field label="Requisition type"><SelectField value={draft.requisitionType} onChange={(v) => update({ requisitionType: v })} options={REQUISITION_TYPES} placeholder="Select type" /></Field>
                      <Field label="Department"><SelectField value={draft.department} onChange={(v) => update({ department: v })} options={DEPARTMENTS} placeholder="Select department" /></Field>
                      <Field label="Primary location"><SelectField value={draft.location} onChange={(v) => update({ location: v })} options={LOCATIONS} placeholder="Select location" /></Field>
                      <Field label="Employment type"><SelectField value={draft.employmentType} onChange={(v) => update({ employmentType: v })} options={EMPLOYMENT_TYPES} /></Field>
                      <Field label="Level"><SelectField value={draft.level} onChange={(v) => update({ level: v })} options={LEVELS} placeholder="Select level" /></Field>
                    </div>
                  </SectionCard>
                )}

                {/* Step 2 — Hiring team & workflow */}
                {basicsStep === 1 && (
                  <>
                    <HiringTeamSection
                      req={draft}
                      onAddMember={addMember}
                      onDeleteMember={deleteMember}
                      onChangeMember={changeMember}
                    />

                    <HiringWorkflowSection req={draft} onChange={update} />
                  </>
                )}

                {/* Step 3 — Budget & approval */}
                {basicsStep === 2 && (
                  <BudgetApprovalSection
                    req={draft}
                    openingCount={draftOpenings.length}
                    onChange={update}
                    onAddApprover={addApprover}
                    onDeleteApprover={deleteApprover}
                    onChangeApprover={changeApprover}
                    onAddSeat={addSeat}
                    onRemoveSeat={removeSeat}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-[24px] py-[14px] bg-white" style={{ borderTop: "1px solid #e8eaee" }}>
                <span className="text-[13px] text-[#637085]" style={poppins}>{draft.id}</span>
                <div className="flex items-center gap-[8px]">
                  {basicsStep > 0 && (
                    <button onClick={() => goToBasics(basicsStep - 1)} className="flex items-center gap-[8px] px-[16px] py-[9px] rounded-[10px] text-[14px] font-medium text-[#464f5e] bg-white border border-[#d1d5dc] hover:bg-[#f8f9fb] transition-colors" style={poppins}>
                      <ArrowLeft className="size-[15px]" /> Back
                    </button>
                  )}
                  {basicsStep < BASICS_STEPS.length - 1 ? (
                    <button onClick={() => goToBasics(basicsStep + 1)} className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-[10px] text-[14px] font-medium text-white bg-[#4d3ee0] hover:bg-[#4434c4] transition-colors" style={poppins}>
                      Next <ArrowRight className="size-[15px]" />
                    </button>
                  ) : (
                    <button onClick={send} disabled={!canContinue} className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-[10px] text-[14px] font-medium text-white bg-[#3c6d68] hover:bg-[#335f5b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={poppins}>
                      <Send className="size-[15px]" /> Send for approval
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "sent" && draft && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-[24px] py-[28px]">
              <div className="flex flex-col items-center text-center mb-[24px]">
                <div className="flex items-center justify-center size-[56px] rounded-full bg-[#e8f5e9] text-[#2e7d32] mb-[14px]">
                  <CheckCircle2 className="size-[30px]" />
                </div>
                <span className="text-[18px] font-semibold text-[#353b46] mb-[6px]" style={poppins}>Sent for approval</span>
                <span className="text-[14px] text-[#637085] max-w-[460px]" style={poppins}>
                  {draft.title} ({draft.id}) has been routed to the approval chain. While you wait, set up the full job.
                </span>
              </div>

              <span className="block text-[12px] font-semibold tracking-[0.6px] text-[#8c95a8] uppercase mb-[10px]" style={poppins}>Next steps</span>
              <div className="flex flex-col gap-[10px]">
                {[
                  {
                    icon: <FileText className="size-[20px]" />,
                    title: "Add job description",
                    desc: "Write the job description and set the matching criteria for sourcing.",
                    onClick: () => setupJobAt(1),
                  },
                  {
                    icon: <GitBranch className="size-[20px]" />,
                    title: "Configure hiring plan",
                    desc: "Set up interviews, scorecards, assessments, and the full pipeline.",
                    onClick: () => setupJobAt(2),
                  },
                  {
                    icon: <Megaphone className="size-[20px]" />,
                    title: "Job posting",
                    desc: "Create and publish this job to internal and external sites.",
                    onClick: () => setupJobAt(4),
                  },
                ].map((s) => (
                  <button
                    key={s.title}
                    onClick={s.onClick}
                    className="group flex items-center gap-[14px] w-full text-left px-[16px] py-[16px] rounded-[12px] border border-[#dcdffb] bg-[#eef0fb] hover:bg-[#e6e9fb] transition-colors"
                  >
                    <div className="flex items-center justify-center size-[40px] rounded-[10px] bg-white text-[#2927b2] shrink-0">
                      {s.icon}
                    </div>
                    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                      <span className="text-[15px] font-semibold text-[#353b46]" style={poppins}>{s.title}</span>
                      <span className="text-[13px] text-[#637085]" style={poppins}>{s.desc}</span>
                    </div>
                    <ArrowRight className="size-[18px] text-[#4d3ee0] shrink-0 transition-transform group-hover:translate-x-[2px]" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-[24px] py-[14px] bg-white" style={{ borderTop: "1px solid #e8eaee" }}>
              <span className="text-[13px] text-[#637085]" style={poppins}>{draft.id}</span>
              <button onClick={close} className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-[10px] text-[14px] font-medium text-[#464f5e] bg-white border border-[#d1d5dc] hover:bg-[#f8f9fb] transition-colors" style={poppins}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
