import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Send, Save, Briefcase, LayoutList, GitBranch, FileText, Megaphone } from "lucide-react";
import type { Requisition, Opening, HiringTeamMember, ApprovalStep as ApprovalStepType, JobContent, Posting } from "../types";
import { hiringManagerOf } from "../types";
import { nextOpeningId } from "../data/openings";
import { poppins, StatusPill } from "../components/primitives";
import { JobDetailsSection, HiringTeamSection, HiringWorkflowSection, BudgetApprovalSection, IntakeMeetingSection, MatchingCriteriaSection, OpeningsSection } from "../wizard/BuildSections";
import { HiringPlanReview } from "../wizard/HiringPlanReview";
import { JobContentSection } from "../wizard/JobContentSection";
import { PostingSection } from "../posting/PostingManager";

const SECTIONS = [
  { key: "details", label: "Job Details", subtitle: "Details, team, budget & approvals", icon: <Briefcase className="size-[16px]" /> },
  { key: "content", label: "Job Description & Matching Criteria", subtitle: "Posted content + ideal candidate", icon: <FileText className="size-[16px]" /> },
  { key: "plan", label: "Hiring Plan", subtitle: "Interviews, scorecards, assessments", icon: <GitBranch className="size-[16px]" /> },
  { key: "openings", label: "Openings", subtitle: "Seats to fill", icon: <LayoutList className="size-[16px]" /> },
  { key: "posting", label: "Job posting", subtitle: "Internal & external sites", icon: <Megaphone className="size-[16px]" /> },
];

let tmCounter = 200;
let apCounter = 200;

export function RequisitionConfigPage({ initialReq, initialOpenings, allOpenings, initialSection = 0, postings, onSaveDraft, onSubmit, onCancel, onSavePosting, onDeletePosting }: {
  initialReq: Requisition;
  initialOpenings: Opening[];
  allOpenings: Opening[];
  initialSection?: number;
  postings: Posting[];
  onSaveDraft: (req: Requisition, openings: Opening[]) => void;
  onSubmit: (req: Requisition, openings: Opening[]) => void;
  onCancel: () => void;
  onSavePosting: (posting: Posting) => void;
  onDeletePosting: (postingId: string) => void;
}) {
  const [draft, setDraft] = useState<Requisition>(initialReq);
  const [draftOpenings, setDraftOpenings] = useState<Opening[]>(initialOpenings);
  const [section, setSection] = useState(initialSection);
  const [visited, setVisited] = useState<Set<number>>(new Set([initialSection]));

  function update(partial: Partial<Requisition>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }
  function updateContent(content: JobContent) {
    setDraft((prev) => ({ ...prev, content }));
  }

  function addMember() {
    tmCounter += 1;
    update({ hiringTeam: [...draft.hiringTeam, { id: `tm${tmCounter}`, name: "", role: "Interviewer" }] });
  }
  function deleteMember(id: string) {
    update({ hiringTeam: draft.hiringTeam.filter((m) => m.id !== id) });
  }
  function changeMember(id: string, field: keyof HiringTeamMember, value: string) {
    update({ hiringTeam: draft.hiringTeam.map((m) => (m.id === id ? { ...m, [field]: value } : m)) });
  }

  function addApprover() {
    apCounter += 1;
    update({ approvalChain: [...draft.approvalChain, { id: `ap${apCounter}`, approver: "", role: "", state: "Pending" }] });
  }
  function deleteApprover(id: string) {
    update({ approvalChain: draft.approvalChain.filter((a) => a.id !== id) });
  }
  function changeApprover(id: string, field: keyof ApprovalStepType, value: string) {
    update({ approvalChain: draft.approvalChain.map((a) => (a.id === id ? { ...a, [field]: value } : a)) });
  }

  function addNewSeat() {
    setDraftOpenings((prev) => [...prev, {
      id: nextOpeningId(), requisitionId: draft.id, title: draft.title,
      location: draft.location || "Remote", employmentType: draft.employmentType || "Full-time",
      targetStartDate: "2026-10-01", status: "Open", source: "new",
    }]);
  }
  function linkExisting(openingId: string) {
    const existing = allOpenings.find((o) => o.id === openingId);
    if (!existing || draftOpenings.some((o) => o.id === openingId)) return;
    setDraftOpenings((prev) => [...prev, { ...existing, requisitionId: draft.id, title: draft.title, source: "existing" }]);
  }
  function changeOpening(rowId: string, field: keyof Opening, value: string) {
    setDraftOpenings((prev) => prev.map((o) => (o.id === rowId ? { ...o, [field]: value } : o)));
  }
  function deleteOpening(rowId: string) {
    setDraftOpenings((prev) => prev.filter((o) => o.id !== rowId));
  }

  function issues(): string[] {
    const out: string[] = [];
    if (!draft.title.trim()) out.push("Add a job title.");
    if (!draft.department) out.push("Select a department.");
    if (!draft.location) out.push("Select a primary location.");
    if (draftOpenings.length === 0) out.push("Add at least one opening.");
    if (!hiringManagerOf(draft.hiringTeam)) out.push("Assign a hiring manager.");
    if (draft.approvalChain.filter((a) => a.approver).length === 0) out.push("Add at least one approver.");
    const primary = draft.content.locales.find((l) => l.language === draft.content.primaryLanguage);
    if (!primary || !primary.description.trim()) out.push("Add a job description in the primary language.");
    return out;
  }

  function goTo(i: number) {
    setSection(i);
    setVisited((prev) => new Set([...prev, i]));
  }

  const validation = issues();
  const isLast = section === SECTIONS.length - 1;

  // Has this requisition already been routed for approval, and have any edits been made since?
  const alreadySent = initialReq.status === "Pending Approval";
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(initialReq) ||
    JSON.stringify(draftOpenings) !== JSON.stringify(initialOpenings);
  const sendLabel = alreadySent && dirty ? "Resend for approval" : "Send for approval";
  // Disabled when invalid, or already sent with no pending edits to resubmit.
  const sendDisabled = validation.length > 0 || (alreadySent && !dirty);

  function finalReq(status: Requisition["status"]): Requisition {
    return { ...draft, status, targetHeadcount: draftOpenings.length, openingIds: draftOpenings.map((o) => o.id) };
  }
  function finalOpenings(): Opening[] {
    return draftOpenings.map((o) => ({ ...o, requisitionId: draft.id, title: draft.title || o.title }));
  }

  return (
    <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
      {/* Page header */}
      <div className="bg-white shrink-0 px-[24px] py-[14px] flex items-center gap-[16px]" style={{ borderBottom: "1px solid #d1d5dc" }}>
        <button onClick={onCancel} className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[10px] text-[14px] font-medium text-[#464f5e] hover:bg-[#f3f3f5] transition-colors" style={poppins}>
          <ArrowLeft className="size-[15px]" /> Requisitions
        </button>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[18px] font-semibold text-[#353b46] truncate" style={poppins}>{draft.title || "Untitled requisition"}</span>
          <span className="text-[12px] text-[#637085]" style={poppins}>{draft.id} · {draft.department || "No department"}</span>
        </div>
        <StatusPill status={draft.status} />
        <button onClick={() => onSaveDraft(finalReq("Draft"), finalOpenings())} className="flex items-center gap-[8px] px-[14px] py-[9px] rounded-[10px] text-[14px] font-medium text-[#464f5e] bg-white border border-[#d1d5dc] hover:bg-[#f8f9fb] transition-colors" style={poppins}>
          <Save className="size-[15px]" /> Save draft
        </button>
        <button
          onClick={() => onSubmit(finalReq("Pending Approval"), finalOpenings())}
          disabled={sendDisabled}
          title={alreadySent && !dirty ? "Already sent for approval — make an edit to resend." : undefined}
          className="flex items-center gap-[8px] px-[16px] py-[9px] rounded-[10px] text-[14px] font-medium text-white bg-[#3c6d68] hover:bg-[#335f5b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={poppins}
        >
          <Send className="size-[15px]" /> {sendLabel}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Section nav */}
        <div className="w-[260px] shrink-0 bg-[#f8f9fb] p-[14px] overflow-y-auto" style={{ borderRight: "1px solid #e8eaee" }}>
          <div className="flex flex-col gap-[2px]">
            {SECTIONS.map((s, i) => {
              const active = section === i;
              const done = visited.has(i) && i !== section;
              return (
                <button key={s.key} onClick={() => goTo(i)} className={`flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] text-left transition-colors ${active ? "bg-white shadow-sm border border-[#e8eaee]" : "hover:bg-white/60"}`}>
                  <div className={`flex items-center justify-center size-[28px] rounded-[8px] shrink-0 ${active ? "bg-[#4d3ee0] text-white" : done ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#e8eaee] text-[#637085]"}`}>
                    {done ? <Check className="size-[14px]" /> : s.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[13px] font-medium tracking-[0.3px] ${active ? "text-[#2927b2]" : "text-[#353b46]"}`} style={poppins}>{s.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-[28px]">
            <div className="max-w-[860px] mx-auto">
              {section === 0 && (
                <div className="flex flex-col gap-[16px]">
                  <JobDetailsSection req={draft} onChange={update} />
                  <HiringTeamSection req={draft} onAddMember={addMember} onDeleteMember={deleteMember} onChangeMember={changeMember} />
                  <HiringWorkflowSection req={draft} onChange={update} />
                  <BudgetApprovalSection req={draft} openingCount={draftOpenings.length} onChange={update} onAddApprover={addApprover} onDeleteApprover={deleteApprover} onChangeApprover={changeApprover} />
                </div>
              )}
              {section === 1 && (
                <div className="flex flex-col gap-[16px]">
                  <IntakeMeetingSection req={draft} onChange={update} />
                  <JobContentSection content={draft.content} onChange={updateContent} />
                  <MatchingCriteriaSection req={draft} onChange={update} />
                </div>
              )}
              {section === 2 && <HiringPlanReview req={draft} onToggleModule={(key) => update({ hiringPlan: { ...draft.hiringPlan, modules: draft.hiringPlan.modules.map((m) => m.key === key ? { ...m, configured: !m.configured, summary: !m.configured ? "Configured" : "Not configured" } : m) } })} />}
              {section === 3 && <OpeningsSection openings={draftOpenings} allOpenings={allOpenings} onAddNew={addNewSeat} onLinkExisting={linkExisting} onChange={changeOpening} onDelete={deleteOpening} />}
              {section === 4 && (
                <PostingSection
                  req={draft}
                  postings={postings}
                  onSave={onSavePosting}
                  onDelete={onDeletePosting}
                  onAudienceContentChange={(audience, field, value) =>
                    update({ postingContent: { ...draft.postingContent, [audience]: { ...(draft.postingContent?.[audience] ?? {}), [field]: value } } })
                  }
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-[28px] py-[14px] bg-white" style={{ borderTop: "1px solid #e8eaee" }}>
            <button onClick={() => goTo(Math.max(0, section - 1))} disabled={section === 0} className="flex items-center gap-[8px] px-[16px] py-[9px] rounded-[10px] text-[14px] font-medium text-[#464f5e] hover:bg-[#f3f3f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed" style={poppins}>
              <ArrowLeft className="size-[15px]" /> Back
            </button>
            {isLast ? (
              <button onClick={() => onSaveDraft(finalReq(draft.status), finalOpenings())} className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-[10px] text-[14px] font-medium text-white bg-[#4d3ee0] hover:bg-[#4434c4] transition-colors" style={poppins}>
                <Send className="size-[15px]" /> Publish
              </button>
            ) : (
              <button onClick={() => goTo(Math.min(SECTIONS.length - 1, section + 1))} className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-[10px] text-[14px] font-medium text-white bg-[#4d3ee0] hover:bg-[#4434c4] transition-colors" style={poppins}>
                Next <ArrowRight className="size-[15px]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
