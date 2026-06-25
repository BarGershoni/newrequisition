import { useState } from "react";
import { CalendarDays, Bot, Mail, CheckCircle2, X, Send, Sparkles } from "lucide-react";
import type { Requisition, Intake, IntakeSource, IdealCandidate } from "../types";
import { poppins, Field, TextField, TextAreaField, Button, StatusPill, SectionCard } from "../components/primitives";

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

const SOURCES: { key: IntakeSource; label: string; description: string; icon: React.ReactNode }[] = [
  { key: "meeting", label: "Intake meeting", description: "Schedule a live kickoff with the hiring manager", icon: <CalendarDays className="size-[18px]" /> },
  { key: "agent", label: "Intake agent", description: "Let the AI agent gather requirements", icon: <Bot className="size-[18px]" /> },
  { key: "form", label: "Intake form", description: "Invite the hiring manager to fill it in async", icon: <Mail className="size-[18px]" /> },
];

const AGENT_SUGGESTION: { description: string; idealCandidate: IdealCandidate } = {
  description: "We are hiring to expand the team's capacity and ship a key initiative this year. The role partners cross-functionally and owns delivery in its area.",
  idealCandidate: {
    summary: "A self-directed contributor who communicates clearly and raises the bar for the team.",
    mustHaveSkills: ["Core domain expertise", "Collaboration", "Ownership"],
    niceToHaveSkills: ["Mentoring", "Cross-functional experience"],
    experience: "3+ years in a comparable role",
  },
};

export function IntakeGate({ req, hiringManager, onChange, onIntakeChange }: {
  req: Requisition;
  hiringManager: string;
  onChange: (partial: Partial<Requisition>) => void;
  onIntakeChange: (partial: Partial<Intake>) => void;
}) {
  const intake = req.intake;
  const ic = req.idealCandidate;
  const hasInfo = intake.status === "Completed";

  function setIdeal(partial: Partial<IdealCandidate>) {
    onChange({ idealCandidate: { ...ic, ...partial } });
  }

  function pickSource(source: IntakeSource) {
    onIntakeChange({ source, status: source === "form" ? "Not started" : "In progress" });
  }

  function invite() {
    onIntakeChange({ status: "Invited", invitedTo: hiringManager });
  }

  function markReceived() {
    onIntakeChange({ status: "Completed" });
  }

  function runAgent() {
    onChange({ description: AGENT_SUGGESTION.description, idealCandidate: AGENT_SUGGESTION.idealCandidate });
    onIntakeChange({ status: "Completed", source: "agent" });
  }

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Status banner */}
      <div className={`flex items-center gap-[12px] px-[16px] py-[14px] rounded-[12px] border ${hasInfo ? "bg-[#e8f5e9] border-[#c8e6c9]" : "bg-[#fff8e1] border-[#ffe0a3]"}`}>
        {hasInfo ? <CheckCircle2 className="size-[20px] text-[#2e7d32] shrink-0" /> : <Sparkles className="size-[20px] text-[#e65100] shrink-0" />}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[14px] font-semibold text-[#353b46]" style={poppins}>
            {hasInfo ? "Job information provided" : "We need the job details from the hiring manager"}
          </span>
          <span className="text-[13px] text-[#637085]" style={poppins}>
            {hasInfo
              ? `Captured via ${intake.source ?? "intake"}. Review and refine below before building the requisition.`
              : "Capture the role and ideal-candidate profile via an intake meeting, the intake agent, or by inviting the hiring manager to complete the intake form."}
          </span>
        </div>
        <StatusPill status={intake.status} />
      </div>

      {/* Source selection (when not completed) */}
      {!hasInfo && (
        <SectionCard title="How do you want to gather the intake?" description="Pick one — all three feed the same requisition fields.">
          <div className="grid grid-cols-3 gap-[12px]">
            {SOURCES.map((s) => {
              const active = intake.source === s.key;
              return (
                <button key={s.key} onClick={() => pickSource(s.key)} className={`flex flex-col items-start gap-[8px] p-[14px] rounded-[10px] border text-left transition-colors ${active ? "bg-[#eae8fb] border-[#cac1f2]" : "bg-white border-[#d1d5dc] hover:bg-[#f8f9fb]"}`}>
                  <div className={`flex items-center justify-center size-[34px] rounded-[8px] ${active ? "bg-[#4d3ee0] text-white" : "bg-[#e8eaee] text-[#637085]"}`}>{s.icon}</div>
                  <span className={`text-[13px] font-semibold ${active ? "text-[#2927b2]" : "text-[#353b46]"}`} style={poppins}>{s.label}</span>
                  <span className="text-[12px] text-[#637085]" style={poppins}>{s.description}</span>
                </button>
              );
            })}
          </div>

          {/* Source-specific action */}
          {intake.source === "meeting" && (
            <div className="mt-[16px] flex flex-col gap-[12px]">
              <div className="flex items-center justify-between gap-[12px] px-[14px] py-[12px] rounded-[10px] bg-[#f8f9fb] border border-[#e8eaee]">
                <span className="text-[13px] text-[#637085]" style={poppins}>
                  {intake.status === "Invited"
                    ? `Intake meeting invite sent to ${intake.invitedTo || "the hiring manager"}. Waiting on the meeting.`
                    : `Send an intake meeting invite to ${hiringManager || "the hiring manager"}.`}
                </span>
                {intake.status === "Invited" ? (
                  <Button variant="subtle" onClick={invite}><Send className="size-[14px]" /> Resend</Button>
                ) : (
                  <Button variant="secondary" onClick={invite} disabled={!hiringManager}><Mail className="size-[15px]" /> Send meeting invite</Button>
                )}
              </div>
              {!hiringManager && <span className="text-[12px] text-[#c62828]" style={poppins}>Add a hiring manager in the Hiring Team section to send the invite.</span>}
              <div className="grid grid-cols-2 gap-[12px]">
                <Field label="Meeting date">
                  <input type="date" value={intake.scheduledFor} onChange={(e) => onIntakeChange({ scheduledFor: e.target.value })} className="w-full px-3 py-[9px] bg-white border border-[#d1d5dc] rounded-[8px] text-[14px] text-[#353b46] focus:outline-none focus:border-[#4d3ee0] focus:ring-1 focus:ring-[#4d3ee0]" style={poppins} />
                </Field>
                <div className="flex items-end">
                  <Button variant="secondary" onClick={markReceived} disabled={!intake.scheduledFor}>
                    <CheckCircle2 className="size-[15px]" /> Mark intake as captured
                  </Button>
                </div>
              </div>
            </div>
          )}

          {intake.source === "agent" && (
            <div className="mt-[16px] flex items-center justify-between gap-[12px] px-[14px] py-[12px] rounded-[10px] bg-[#f8f9fb] border border-[#e8eaee]">
              <span className="text-[13px] text-[#637085]" style={poppins}>The intake agent will interview the hiring manager and draft the role + ideal-candidate profile.</span>
              <Button variant="secondary" onClick={runAgent}><Bot className="size-[15px]" /> Run intake agent</Button>
            </div>
          )}

          {intake.source === "form" && (
            <div className="mt-[16px] flex flex-col gap-[12px]">
              <div className="flex items-center justify-between gap-[12px] px-[14px] py-[12px] rounded-[10px] bg-[#f8f9fb] border border-[#e8eaee]">
                <span className="text-[13px] text-[#637085]" style={poppins}>
                  {intake.status === "Invited"
                    ? `Intake form sent to ${intake.invitedTo || "the hiring manager"}. Waiting on their response.`
                    : `Invite ${hiringManager || "the hiring manager"} to complete the intake form.`}
                </span>
                {intake.status === "Invited" ? (
                  <div className="flex items-center gap-[8px]">
                    <Button variant="subtle" onClick={invite}><Send className="size-[14px]" /> Resend</Button>
                    <Button variant="secondary" onClick={markReceived}><CheckCircle2 className="size-[15px]" /> Mark as received</Button>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={invite} disabled={!hiringManager}><Mail className="size-[15px]" /> Invite hiring manager</Button>
                )}
              </div>
              {!hiringManager && <span className="text-[12px] text-[#c62828]" style={poppins}>Add a hiring manager in the Hiring Team section to send the invite.</span>}
            </div>
          )}
        </SectionCard>
      )}

      {/* Captured info (editable) */}
      <SectionCard title="Job & ideal-candidate profile" description="This is what the intake fills in — edit anytime.">
        <div className="flex flex-col gap-[16px]">
          <Field label="Role overview">
            <TextAreaField value={req.description} onChange={(v) => onChange({ description: v })} placeholder="What this role does and why you're hiring…" rows={3} />
          </Field>
          <Field label="Ideal candidate summary">
            <TextField value={ic.summary} onChange={(v) => setIdeal({ summary: v })} placeholder="A short description of who you're looking for" />
          </Field>
          <div className="grid grid-cols-2 gap-[16px]">
            <TagInput label="Must-have skills" value={ic.mustHaveSkills} onChange={(v) => setIdeal({ mustHaveSkills: v })} placeholder="Type a skill, press Enter" />
            <TagInput label="Nice-to-have skills" value={ic.niceToHaveSkills} onChange={(v) => setIdeal({ niceToHaveSkills: v })} placeholder="Type a skill, press Enter" />
          </div>
          <Field label="Experience">
            <TextField value={ic.experience} onChange={(v) => setIdeal({ experience: v })} placeholder="e.g. 5+ years in a similar role" />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}
