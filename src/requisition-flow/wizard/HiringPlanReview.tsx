import { CheckCircle2, Circle, Settings2, GitBranch, ClipboardList, FileCheck, Star, Users, CalendarClock, BadgeCheck, Zap } from "lucide-react";
import type { Requisition, HiringPlanModule } from "../types";
import { poppins, Button } from "../components/primitives";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  pipeline: <GitBranch className="size-[16px]" />,
  screening: <ClipboardList className="size-[16px]" />,
  assessments: <FileCheck className="size-[16px]" />,
  scorecards: <Star className="size-[16px]" />,
  "interview-plan": <Users className="size-[16px]" />,
  scheduling: <CalendarClock className="size-[16px]" />,
  "offer-approval": <BadgeCheck className="size-[16px]" />,
  automations: <Zap className="size-[16px]" />,
};

export function HiringPlanReview({ req, onToggleModule }: {
  req: Requisition;
  onToggleModule: (key: string) => void;
}) {
  const plan = req.hiringPlan;
  const configuredCount = plan.modules.filter((m) => m.configured).length;
  const originText =
    plan.origin === "template" ? `Pre-built from the "${plan.originLabel}" template`
    : plan.origin === "copied" ? `Copied from ${plan.originLabel}`
    : "Building from scratch";

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center justify-between gap-[12px] px-[16px] py-[14px] rounded-[12px] bg-[#eef0fb] border border-[#dcdffb]">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#353b46]" style={poppins}>One hiring plan for this requisition</span>
          <span className="text-[13px] text-[#637085]" style={poppins}>{originText} · identical for every candidate · {configuredCount}/{plan.modules.length} modules configured</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[12px]">
        {plan.modules.map((m: HiringPlanModule) => (
          <div key={m.key} className={`flex items-start gap-[12px] p-[14px] rounded-[10px] border transition-colors ${m.configured ? "bg-white border-[#c8e6c9]" : "bg-white border-[#e8eaee]"}`}>
            <div className={`flex items-center justify-center size-[34px] rounded-[8px] shrink-0 ${m.configured ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#f4f6fa] text-[#637085]"}`}>
              {MODULE_ICONS[m.key] || <Settings2 className="size-[16px]" />}
            </div>
            <div className="flex flex-col gap-[2px] flex-1 min-w-0">
              <div className="flex items-center gap-[6px]">
                <span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>{m.label}</span>
                {m.configured ? <CheckCircle2 className="size-[14px] text-[#2e7d32]" /> : <Circle className="size-[12px] text-[#c0c6d0]" />}
              </div>
              <span className="text-[12px] text-[#637085]" style={poppins}>{m.description}</span>
              <span className={`text-[12px] mt-[2px] ${m.configured ? "text-[#2e7d32] font-medium" : "text-[#8c95a8]"}`} style={poppins}>{m.summary}</span>
            </div>
            <Button variant="ghost" className="!px-[10px] !py-[6px] !text-[12px]" onClick={() => onToggleModule(m.key)}>
              {m.configured ? "Edit" : "Configure"}
            </Button>
          </div>
        ))}
      </div>
      <span className="text-[12px] text-[#8c95a8]" style={poppins}>Module editors are out of scope for this prototype — toggling marks a module as configured.</span>
    </div>
  );
}
