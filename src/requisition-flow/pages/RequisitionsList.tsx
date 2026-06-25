import { useState } from "react";
import { Plus, Search, Megaphone, LayoutList, Briefcase, Globe, Lock } from "lucide-react";
import type { Requisition, Opening, Posting } from "../types";
import { linkedOpenings, filledCount, postingsOf, hiringManagerOf } from "../types";
import { unlinkedOpenings } from "../data/openings";
import { poppins, Avatar, StatusPill, Button } from "../components/primitives";

const TABS = ["All", "Draft", "Pending Approval", "Approved", "Open", "Filled", "Closed"];

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-[12px] bg-white rounded-[12px] border border-[#e8eaee] px-[16px] py-[14px] flex-1">
      <div className="flex items-center justify-center size-[36px] rounded-[10px] bg-[#eae8fb] text-[#2927b2] shrink-0">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[20px] font-semibold text-[#353b46] leading-tight" style={poppins}>{value}</span>
        <span className="text-[12px] text-[#637085] tracking-[0.3px]" style={poppins}>{label}</span>
      </div>
    </div>
  );
}

export function RequisitionsList({ requisitions, openings, postings, onCreate, onEdit, onManagePosting }: {
  requisitions: Requisition[];
  openings: Opening[];
  postings: Posting[];
  onCreate: () => void;
  onEdit: (req: Requisition) => void;
  onManagePosting: (req: Requisition) => void;
}) {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const tabCount = (t: string) => (t === "All" ? requisitions.length : requisitions.filter((r) => r.status === t).length);
  const filtered = (tab === "All" ? requisitions : requisitions.filter((r) => r.status === tab)).filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.department.toLowerCase().includes(search.toLowerCase()),
  );

  const openOpenings = openings.filter((o) => o.requisitionId !== null && o.status === "Open").length;
  const unlinkedCount = unlinkedOpenings(openings).length;
  const livePostings = postings.reduce((n, p) => n + p.variants.filter((v) => v.status === "Published").length, 0);

  return (
    <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white shrink-0 px-[24px] pt-[20px]" style={{ borderBottom: "1px solid #d1d5dc" }}>
        <div className="flex items-center justify-between mb-[16px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[20px] font-semibold text-[#353b46]" style={poppins}>Jobs</span>
            <div className="bg-[#eae8fb] px-[8px] py-[2px] rounded-[6px]">
              <span className="text-[12px] font-medium text-[#2927b2] tracking-[0.4px]" style={poppins}>{requisitions.length}</span>
            </div>
          </div>
          <Button onClick={onCreate}>
            <Plus className="size-[14px]" /> Create new job
          </Button>
        </div>

        {/* Lifecycle stat strip */}
        <div className="flex gap-[12px] pb-[16px]">
          <StatCard icon={<Briefcase className="size-[18px]" />} label="Jobs" value={requisitions.length} />
          <StatCard icon={<LayoutList className="size-[18px]" />} label="Open seats" value={openOpenings} />
          <StatCard icon={<LayoutList className="size-[18px]" />} label="Unlinked seats" value={unlinkedCount} />
          <StatCard icon={<Megaphone className="size-[18px]" />} label="Live postings" value={livePostings} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[4px]">
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-[6px] px-[10px] py-[8px] rounded-t-[8px] transition-colors ${active ? "bg-[#eae8fb]" : "hover:bg-[#f3f3f5]"}`}>
                  <span className={`text-[14px] tracking-[0.3px] whitespace-nowrap ${active ? "font-medium text-[#353b46]" : "text-[#637085]"}`} style={poppins}>{t}</span>
                  <div className={`min-w-[20px] rounded-[6px] px-[6px] py-[1px] ${active ? "bg-white" : "bg-[#f4f6fa]"}`}>
                    <span className="text-[12px] font-medium text-[#637085] tracking-[0.4px]" style={poppins}>{tabCount(t)}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-[8px] pb-[8px]">
            <div className="bg-white flex gap-[6px] items-center px-[8px] py-[5px] rounded-[8px] w-[220px]" style={{ border: "1px solid #8c95a8" }}>
              <Search className="size-[16px] text-[#637085] shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs…" className="flex-1 text-[13px] text-[#353b46] placeholder-[#637085] bg-transparent outline-none tracking-[0.3px]" style={poppins} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-white" style={{ borderBottom: "1px solid #e8eaee" }}>
            <tr>
              {["Job", "Department", "Location", "Hiring Manager", "Status", "Openings", "Postings", "Created"].map((c) => (
                <th key={c} className="px-[16px] py-[10px]">
                  <span className="text-[13px] font-semibold text-[#353b46] tracking-[0.3px] whitespace-nowrap" style={poppins}>{c}</span>
                </th>
              ))}
              <th className="w-[60px]" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-[48px]"><span className="text-[14px] text-[#637085]" style={poppins}>No jobs found.</span></td></tr>
            ) : (
              filtered.map((req) => {
                const linked = linkedOpenings(req, openings);
                const filled = filledCount(req, openings);
                const reqPostings = postingsOf(req, postings);
                return (
                  <tr key={req.id} onClick={() => onEdit(req)} className="group transition-colors cursor-pointer hover:bg-[#fafbfc]" style={{ borderBottom: "1px solid #e8eaee" }}>
                    <td className="px-[16px] py-[12px] min-w-[200px]">
                      <div className="flex flex-col gap-[2px]">
                        <span className="text-[14px] font-medium text-[#464f5e] tracking-[0.3px] whitespace-nowrap" style={poppins}>{req.title || "Untitled job"}</span>
                        <span className="text-[13px] text-[#637085] tracking-[0.3px]" style={poppins}>{req.id}</span>
                      </div>
                    </td>
                    <td className="px-[16px] py-[12px]">
                      {req.department ? (
                        <div className="bg-[#f4f6fa] inline-flex items-center px-[8px] py-[3px] rounded-[6px]">
                          <span className="text-[12px] font-medium text-[#464f5e] tracking-[0.4px] whitespace-nowrap" style={poppins}>{req.department}</span>
                        </div>
                      ) : <span className="text-[13px] text-[#8c95a8]" style={poppins}>—</span>}
                    </td>
                    <td className="px-[16px] py-[12px]"><span className="text-[13px] text-[#464f5e] tracking-[0.3px] whitespace-nowrap" style={poppins}>{req.location || "—"}</span></td>
                    <td className="px-[16px] py-[12px]">
                      <div className="flex items-center gap-[8px]">
                        <Avatar name={hiringManagerOf(req.hiringTeam)} size={24} />
                        <span className="text-[13px] text-[#464f5e] tracking-[0.3px] whitespace-nowrap" style={poppins}>{hiringManagerOf(req.hiringTeam) || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-[16px] py-[12px]"><StatusPill status={req.status} /></td>
                    <td className="px-[16px] py-[12px]">
                      <div className="flex items-center gap-[4px]">
                        <span className="text-[14px] font-medium text-[#353b46]" style={poppins}>{filled}/{linked.length}</span>
                        <span className="text-[13px] text-[#637085]" style={poppins}>filled</span>
                      </div>
                    </td>
                    <td className="px-[16px] py-[12px]">
                      {reqPostings.length > 0 ? (
                        <button onClick={(e) => { e.stopPropagation(); onManagePosting(req); }} className="inline-flex items-center gap-[8px] text-[13px] text-[#2927b2] hover:underline" style={poppins}>
                          {reqPostings.some((p) => p.audience === "External") && <span className="inline-flex items-center gap-[3px] text-[#2927b2]"><Globe className="size-[13px]" />{reqPostings.filter((p) => p.audience === "External").length}</span>}
                          {reqPostings.some((p) => p.audience === "Internal") && <span className="inline-flex items-center gap-[3px] text-[#3c6d68]"><Lock className="size-[13px]" />{reqPostings.filter((p) => p.audience === "Internal").length}</span>}
                          <span className="text-[#637085]">posts</span>
                        </button>
                      ) : req.status === "Approved" || req.status === "Open" ? (
                        <button onClick={(e) => { e.stopPropagation(); onManagePosting(req); }} className="inline-flex items-center gap-[6px] text-[13px] text-[#637085] hover:text-[#2927b2]" style={poppins}><Megaphone className="size-[13px]" /> Create posting</button>
                      ) : (
                        <span className="text-[13px] text-[#8c95a8]" style={poppins}>—</span>
                      )}
                    </td>
                    <td className="px-[16px] py-[12px]"><span className="text-[13px] text-[#637085] tracking-[0.3px] whitespace-nowrap" style={poppins}>{req.createdDate}</span></td>
                    <td className="px-[16px] py-[12px]" />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
