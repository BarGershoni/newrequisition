import { useState } from "react";
import { Search, Copy, LayoutTemplate, FilePlus2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import type { Requisition } from "../types";
import { REQUISITION_TEMPLATES, type RequisitionTemplate } from "../data/templates";
import { poppins, StatusPill } from "../components/primitives";

export type StartChoice =
  | { mode: "scratch" }
  | { mode: "copy"; requisition: Requisition }
  | { mode: "template"; template: RequisitionTemplate };

export function StartStep({ requisitions, onPick }: {
  requisitions: Requisition[];
  onPick: (choice: StartChoice) => void;
}) {
  const [tab, setTab] = useState<"copy" | "template">("copy");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StartChoice | null>(null);

  const filteredReqs = requisitions.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.department.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredTemplates = REQUISITION_TEMPLATES.filter(
    (t) => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase()) || t.level.toLowerCase().includes(search.toLowerCase()),
  );

  function switchTab(next: "copy" | "template") {
    setTab(next);
    setSelected(null);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Hero */}
      <div className="px-[32px] pt-[24px] pb-[20px] shrink-0 bg-[#f8f9fb]" style={{ borderBottom: "1px solid #e8eaee" }}>
        <div className="flex flex-col gap-[4px] mb-[16px]">
          <span className="text-[18px] font-semibold text-[#353b46]" style={poppins}>Start a new requisition</span>
          <span className="text-[13px] text-[#637085]" style={poppins}>Copy an existing job or use a template so the hiring plan comes pre-built.</span>
        </div>
        <div className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] bg-white w-full" style={{ border: "2px solid #4d3ee0", boxShadow: "0 2px 12px rgba(77,62,224,0.10)" }}>
          <Search className="size-[20px] text-[#4d3ee0] shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} autoFocus placeholder={tab === "copy" ? "Search existing requisitions…" : "Search templates by role, department, level…"} className="flex-1 text-[15px] text-[#353b46] placeholder-[#8c95a8] bg-transparent outline-none" style={poppins} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[2px] px-[24px] shrink-0 bg-white" style={{ borderBottom: "1px solid #e8eaee" }}>
        {([
          { key: "copy", label: "Copy existing job", icon: <Copy className="size-[14px]" />, badge: filteredReqs.length },
          { key: "template", label: "Requisition templates", icon: <LayoutTemplate className="size-[14px]" />, badge: filteredTemplates.length },
        ] as const).map(({ key, label, icon, badge }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => switchTab(key)} className="flex items-center gap-[6px] px-[14px] py-[12px] text-[13px] font-medium whitespace-nowrap transition-colors" style={{ ...poppins, color: active ? "#2927b2" : "#637085", borderBottom: active ? "2px solid #4d3ee0" : "2px solid transparent", marginBottom: -1 }}>
              {icon} {label}
              <span className="bg-[#f4f6fa] rounded-[6px] px-[6px] py-[1px] text-[11px] text-[#637085]">{badge}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-[24px] py-[16px] bg-[#f8f9fb]">
        <div className="flex flex-col gap-[8px]">
          {tab === "copy" && filteredReqs.map((req) => {
            const isSel = selected?.mode === "copy" && selected.requisition.id === req.id;
            return (
              <button key={req.id} onClick={() => setSelected({ mode: "copy", requisition: req })} className={`group flex items-center gap-[14px] px-[16px] py-[14px] rounded-[10px] border transition-all text-left ${isSel ? "border-[#4d3ee0] bg-[#eef0fb] shadow-sm" : "bg-white border-[#e8eaee] hover:border-[#4d3ee0] hover:shadow-sm"}`}>
                <div className="flex items-center justify-center size-[36px] rounded-[8px] bg-[#eae8fb] text-[#2927b2] shrink-0"><Copy className="size-[16px]" /></div>
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <span className="text-[14px] font-medium text-[#353b46] truncate" style={poppins}>{req.title}</span>
                  <span className="text-[12px] text-[#637085] truncate" style={poppins}>{req.id} · {req.department} · {req.level}</span>
                </div>
                <StatusPill status={req.status} size="sm" />
                {isSel ? <CheckCircle2 className="size-[18px] text-[#4d3ee0] shrink-0" /> : <ArrowRight className="size-[16px] text-[#8c95a8] group-hover:text-[#4d3ee0] transition-colors shrink-0" />}
              </button>
            );
          })}

          {tab === "template" && filteredTemplates.map((t) => {
            const isSel = selected?.mode === "template" && selected.template.id === t.id;
            return (
              <button key={t.id} onClick={() => setSelected({ mode: "template", template: t })} className={`group flex items-center gap-[14px] px-[16px] py-[14px] rounded-[10px] border transition-all text-left ${isSel ? "border-[#4d3ee0] bg-[#eef0fb] shadow-sm" : "bg-white border-[#e8eaee] hover:border-[#4d3ee0] hover:shadow-sm"}`}>
                <div className="flex items-center justify-center size-[36px] rounded-[8px] bg-[#e8f5e9] text-[#2e7d32] shrink-0"><Sparkles className="size-[16px]" /></div>
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <span className="text-[14px] font-medium text-[#353b46] truncate" style={poppins}>{t.name}</span>
                  <span className="text-[12px] text-[#637085] truncate" style={poppins}>{t.department} · {t.level} · {t.configuredModuleKeys.length} hiring-plan modules preset</span>
                </div>
                {isSel ? <CheckCircle2 className="size-[18px] text-[#4d3ee0] shrink-0" /> : <ArrowRight className="size-[16px] text-[#8c95a8] group-hover:text-[#4d3ee0] transition-colors shrink-0" />}
              </button>
            );
          })}

          {((tab === "copy" && filteredReqs.length === 0) || (tab === "template" && filteredTemplates.length === 0)) && (
            <div className="text-center py-[40px]"><span className="text-[14px] text-[#637085]" style={poppins}>No matches. Try a different search or start from scratch.</span></div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-[12px] px-[24px] py-[14px] bg-white shrink-0" style={{ borderTop: "1px solid #e8eaee" }}>
        <button onClick={() => onPick({ mode: "scratch" })} className="flex items-center gap-[8px] px-[14px] py-[9px] rounded-[10px] bg-white border border-[#d1d5dc] hover:border-[#4d3ee0] transition-colors" style={poppins}>
          <FilePlus2 className="size-[16px] text-[#4d3ee0]" />
          <span className="text-[14px] font-medium text-[#353b46]">Start from scratch</span>
        </button>
        <button onClick={() => selected && onPick(selected)} disabled={!selected} className="flex items-center gap-[8px] px-[18px] py-[9px] rounded-[10px] text-[14px] font-medium text-white bg-[#4d3ee0] hover:bg-[#4434c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={poppins}>
          Create <ArrowRight className="size-[15px]" />
        </button>
      </div>
    </div>
  );
}
