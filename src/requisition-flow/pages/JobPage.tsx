import { ArrowLeft, Settings, Megaphone, Briefcase, Users, LayoutList, GitBranch, CalendarDays, FileText } from "lucide-react";
import type { Requisition, Opening, Posting } from "../types";
import { hiringManagerOf, recruiterOf, linkedOpenings, filledCount, postingsOf } from "../types";
import { poppins, StatusPill, Button } from "../components/primitives";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-[8px]" style={{ borderBottom: "1px solid #f3f3f5" }}>
      <span className="text-[13px] text-[#637085]" style={poppins}>{label}</span>
      <span className="text-[13px] font-medium text-[#353b46] text-right" style={poppins}>{value || "—"}</span>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#e8eaee] p-[16px] flex flex-col gap-[6px]">
      <div className="flex items-center gap-[10px] mb-[4px]">
        <div className="flex items-center justify-center size-[30px] rounded-[8px] bg-[#eae8fb] text-[#2927b2] shrink-0">{icon}</div>
        <span className="text-[14px] font-semibold text-[#353b46]" style={poppins}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export function JobPage({ req, openings, postings, onBack, onJobSettings, onManagePosting }: {
  req: Requisition;
  openings: Opening[];
  postings: Posting[];
  onBack: () => void;
  onJobSettings: (req: Requisition) => void;
  onManagePosting: (req: Requisition) => void;
}) {
  const linked = linkedOpenings(req, openings);
  const filled = filledCount(req, openings);
  const reqPostings = postingsOf(req, postings);
  const configured = req.hiringPlan.modules.filter((m) => m.configured).length;
  const primary = req.content.locales.find((l) => l.language === req.content.primaryLanguage) ?? req.content.locales[0];

  return (
    <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
      {/* Page header */}
      <div className="bg-white shrink-0 px-[24px] py-[14px] flex items-center gap-[16px]" style={{ borderBottom: "1px solid #d1d5dc" }}>
        <button onClick={onBack} title="Back to jobs" aria-label="Back to jobs" className="flex items-center justify-center size-[36px] rounded-[10px] text-[#464f5e] hover:bg-[#f3f3f5] transition-colors shrink-0">
          <ArrowLeft className="size-[18px]" />
        </button>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[18px] font-semibold text-[#353b46] truncate" style={poppins}>{req.title || "Untitled job"}</span>
          <span className="text-[12px] text-[#637085]" style={poppins}>{req.id} · {req.department || "No department"}</span>
        </div>
        <StatusPill status={req.status} />
        <Button variant="subtle" onClick={() => onManagePosting(req)}><Megaphone className="size-[15px]" /> Manage postings</Button>
        <Button variant="secondary" onClick={() => onJobSettings(req)}><Settings className="size-[15px]" /> Job Settings</Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-[24px] bg-[#f8f9fb]">
        <div className="max-w-[920px] mx-auto grid grid-cols-2 gap-[16px]">
          <Card icon={<Briefcase className="size-[16px]" />} title="Details">
            <InfoRow label="Department" value={req.department} />
            <InfoRow label="Location" value={req.location} />
            <InfoRow label="Employment" value={req.employmentType} />
            <InfoRow label="Level" value={req.level} />
            <InfoRow label="Requisition type" value={req.requisitionType} />
            <InfoRow label="Salary band" value={req.salaryBand} />
          </Card>

          <Card icon={<Users className="size-[16px]" />} title="Hiring team">
            <InfoRow label="Hiring manager" value={hiringManagerOf(req.hiringTeam)} />
            <InfoRow label="Recruiter" value={recruiterOf(req.hiringTeam)} />
            <InfoRow label="Team size" value={`${req.hiringTeam.filter((m) => m.name).length} members`} />
            <InfoRow label="Approval chain" value={`${req.approvalChain.length} step${req.approvalChain.length === 1 ? "" : "s"}`} />
          </Card>

          <Card icon={<LayoutList className="size-[16px]" />} title="Openings">
            <InfoRow label="Seats" value={`${linked.length} ${linked.length === 1 ? "seat" : "seats"}`} />
            <InfoRow label="Filled" value={`${filled}/${linked.length}`} />
          </Card>

          <Card icon={<GitBranch className="size-[16px]" />} title="Hiring plan">
            <InfoRow label="Modules configured" value={`${configured}/${req.hiringPlan.modules.length}`} />
          </Card>

          <Card icon={<CalendarDays className="size-[16px]" />} title="Intake">
            <InfoRow label="Status" value={req.intake.status} />
            <InfoRow label="Hiring manager" value={hiringManagerOf(req.hiringTeam)} />
          </Card>

          <Card icon={<Megaphone className="size-[16px]" />} title="Postings">
            <InfoRow label="Total" value={`${reqPostings.length}`} />
            <InfoRow label="External" value={`${reqPostings.filter((p) => p.audience === "External").length}`} />
            <InfoRow label="Internal" value={`${reqPostings.filter((p) => p.audience === "Internal").length}`} />
          </Card>

          <Card icon={<FileText className="size-[16px]" />} title="Job description">
            <span className="text-[13px] text-[#637085] line-clamp-3" style={poppins}>{primary?.description || "No description yet — add one in Job Settings."}</span>
          </Card>
        </div>
      </div>
    </div>
  );
}
