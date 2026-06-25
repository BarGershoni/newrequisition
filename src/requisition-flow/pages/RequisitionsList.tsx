import { useState } from "react";
import { Plus, Search, Megaphone, LayoutList, LayoutGrid, Briefcase, Globe, Lock, Filter, Settings2, Pencil, MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import type { Requisition, Opening, Posting } from "../types";
import { linkedOpenings, filledCount, postingsOf, hiringManagerOf } from "../types";
import { poppins, Avatar, StatusPill, Button, Checkbox } from "../components/primitives";

const TABS = ["All", "Draft", "Pending Approval", "Approved", "Open", "Filled", "Closed"];

function PostingsCell({ req, postings, onManagePosting }: { req: Requisition; postings: Posting[]; onManagePosting: (req: Requisition) => void }) {
  const reqPostings = postingsOf(req, postings);
  if (reqPostings.length > 0) {
    return (
      <button onClick={(e) => { e.stopPropagation(); onManagePosting(req); }} className="inline-flex items-center gap-[8px] text-[13px] text-[#2927b2] hover:underline" style={poppins}>
        {reqPostings.some((p) => p.audience === "External") && <span className="inline-flex items-center gap-[3px] text-[#2927b2]"><Globe className="size-[13px]" />{reqPostings.filter((p) => p.audience === "External").length}</span>}
        {reqPostings.some((p) => p.audience === "Internal") && <span className="inline-flex items-center gap-[3px] text-[#3c6d68]"><Lock className="size-[13px]" />{reqPostings.filter((p) => p.audience === "Internal").length}</span>}
        <span className="text-[#637085]">posts</span>
      </button>
    );
  }
  if (req.status === "Approved" || req.status === "Open") {
    return <button onClick={(e) => { e.stopPropagation(); onManagePosting(req); }} className="inline-flex items-center gap-[6px] text-[13px] text-[#637085] hover:text-[#2927b2]" style={poppins}><Megaphone className="size-[13px]" /> Create posting</button>;
  }
  return <span className="text-[13px] text-[#8c95a8]" style={poppins}>—</span>;
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"table" | "grid">("table");
  const [sortAsc, setSortAsc] = useState(true);

  const tabCount = (t: string) => (t === "All" ? requisitions.length : requisitions.filter((r) => r.status === t).length);
  const filtered = (tab === "All" ? requisitions : requisitions.filter((r) => r.status === tab)).filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.department.toLowerCase().includes(search.toLowerCase()),
  );
  const rows = [...filtered].sort((a, b) => (sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)));

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  function toggleAll() { setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id))); }
  function toggleOne(id: string) { setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const COLUMNS = ["Department", "Location", "Hiring Manager", "Status", "Openings", "Postings", "Created"];

  return (
    <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden bg-white">
      {/* Page header */}
      <div className="shrink-0 px-[28px] pt-[20px] pb-[16px] flex items-center justify-between gap-[16px]">
        <div className="flex items-center gap-[10px]">
          <span className="text-[26px] font-semibold text-[#353b46]" style={poppins}>Jobs</span>
          <div className="bg-[#eae8fb] px-[8px] py-[2px] rounded-[6px]"><span className="text-[12px] font-medium text-[#2927b2] tracking-[0.4px]" style={poppins}>{requisitions.length}</span></div>
        </div>
        <div className="flex items-center gap-[10px]">
          <Button onClick={onCreate}><Plus className="size-[15px]" /> Create new job</Button>
          <button className="flex items-center justify-center size-[40px] rounded-[10px] border border-[#d1d5dc] text-[#637085] hover:bg-[#f8f9fb] transition-colors"><MoreVertical className="size-[18px]" /></button>
        </div>
      </div>

      {/* Views + toolbar */}
      <div className="shrink-0 px-[28px] pb-[16px] flex items-center justify-between gap-[12px] flex-wrap">
        <div className="flex items-center gap-[8px] flex-wrap">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center gap-[8px] px-[12px] py-[7px] rounded-[10px] border text-[13px] font-medium transition-colors ${active ? "bg-[#eae8fb] border-[#cac1f2] text-[#2927b2]" : "bg-white border-[#e8eaee] text-[#637085] hover:bg-[#f8f9fb]"}`} style={poppins}>
                {t}
                <span className={`text-[11px] rounded-[6px] px-[6px] py-[1px] tracking-[0.3px] ${active ? "bg-white/70 text-[#2927b2]" : "bg-[#f4f6fa] text-[#637085]"}`}>{tabCount(t)}</span>
              </button>
            );
          })}
          <button className="flex items-center justify-center size-[34px] rounded-[10px] border border-[#e8eaee] text-[#637085] hover:bg-[#f8f9fb] transition-colors"><Plus className="size-[16px]" /></button>
        </div>

        <div className="flex items-center gap-[8px]">
          <div className="bg-white flex gap-[6px] items-center px-[10px] py-[7px] rounded-[10px] w-[220px]" style={{ border: "1px solid #d1d5dc" }}>
            <Search className="size-[16px] text-[#637085] shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="flex-1 text-[13px] text-[#353b46] placeholder-[#637085] bg-transparent outline-none tracking-[0.3px]" style={poppins} />
          </div>
          <button className="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-[10px] border border-[#d1d5dc] text-[13px] font-medium text-[#464f5e] hover:bg-[#f8f9fb] transition-colors" style={poppins}><Filter className="size-[15px]" /> Filters</button>
          <div className="flex items-center gap-[2px] p-[3px] rounded-[10px] border border-[#d1d5dc] bg-white">
            <button onClick={() => setView("table")} className={`flex items-center justify-center size-[30px] rounded-[7px] transition-colors ${view === "table" ? "bg-[#eae8fb] text-[#2927b2]" : "text-[#637085] hover:bg-[#f8f9fb]"}`}><LayoutList className="size-[16px]" /></button>
            <button onClick={() => setView("grid")} className={`flex items-center justify-center size-[30px] rounded-[7px] transition-colors ${view === "grid" ? "bg-[#eae8fb] text-[#2927b2]" : "text-[#637085] hover:bg-[#f8f9fb]"}`}><LayoutGrid className="size-[16px]" /></button>
          </div>
          <button className="flex items-center justify-center size-[38px] rounded-[10px] border border-[#d1d5dc] text-[#637085] hover:bg-[#f8f9fb] transition-colors"><Settings2 className="size-[16px]" /></button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[28px] pb-[24px]">
        {rows.length === 0 ? (
          <div className="text-center py-[64px]"><span className="text-[14px] text-[#637085]" style={poppins}>No jobs found.</span></div>
        ) : view === "table" ? (
          <div className="border border-[#e8eaee] rounded-[12px] overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white" style={{ borderBottom: "1px solid #e8eaee" }}>
                <tr>
                  <th className="w-[44px] pl-[16px]" onClick={(e) => e.stopPropagation()}><Checkbox checked={allSelected} onChange={toggleAll} /></th>
                  <th className="px-[16px] py-[12px]">
                    <button onClick={() => setSortAsc((s) => !s)} className="inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#353b46] tracking-[0.2px]" style={poppins}>
                      Job {sortAsc ? <ArrowUp className="size-[14px] text-[#4d3ee0]" /> : <ArrowDown className="size-[14px] text-[#4d3ee0]" />}
                    </button>
                  </th>
                  {COLUMNS.map((c) => (
                    <th key={c} className="px-[16px] py-[12px]"><span className="text-[13px] font-semibold text-[#353b46] tracking-[0.2px] whitespace-nowrap" style={poppins}>{c}</span></th>
                  ))}
                  <th className="w-[96px]" />
                </tr>
              </thead>
              <tbody>
                {rows.map((req) => {
                  const linked = linkedOpenings(req, openings);
                  const filled = filledCount(req, openings);
                  const hm = hiringManagerOf(req.hiringTeam);
                  const isSel = selected.has(req.id);
                  return (
                    <tr key={req.id} onClick={() => onEdit(req)} className={`group transition-colors cursor-pointer ${isSel ? "bg-[#faf9fe]" : "hover:bg-[#faf9fe]"}`} style={{ borderBottom: "1px solid #f3f3f5" }}>
                      <td className="pl-[16px] py-[14px]" onClick={(e) => e.stopPropagation()}><Checkbox checked={isSel} onChange={() => toggleOne(req.id)} /></td>
                      <td className="px-[16px] py-[14px] min-w-[240px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="flex items-center justify-center size-[34px] rounded-[10px] bg-[#eef0fb] text-[#2927b2] shrink-0"><Briefcase className="size-[16px]" /></div>
                          <div className="flex flex-col gap-[1px] min-w-0">
                            <span className="text-[14px] font-medium text-[#353b46] tracking-[0.2px] truncate group-hover:text-[#2927b2] transition-colors" style={poppins}>{req.title || "Untitled job"}</span>
                            <span className="text-[12px] text-[#8c95a8] tracking-[0.3px]" style={poppins}>{req.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        {req.department ? (
                          <div className="bg-[#f4f6fa] inline-flex items-center px-[8px] py-[3px] rounded-[6px]"><span className="text-[12px] font-medium text-[#464f5e] tracking-[0.4px] whitespace-nowrap" style={poppins}>{req.department}</span></div>
                        ) : <span className="text-[13px] text-[#8c95a8]" style={poppins}>—</span>}
                      </td>
                      <td className="px-[16px] py-[14px]"><span className="text-[13px] text-[#464f5e] tracking-[0.3px] whitespace-nowrap" style={poppins}>{req.location || "—"}</span></td>
                      <td className="px-[16px] py-[14px]">
                        <div className="flex items-center gap-[8px]">
                          <Avatar name={hm} size={24} />
                          <span className="text-[13px] text-[#464f5e] tracking-[0.3px] whitespace-nowrap" style={poppins}>{hm || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px]"><StatusPill status={req.status} /></td>
                      <td className="px-[16px] py-[14px]"><div className="flex items-center gap-[4px]"><span className="text-[14px] font-medium text-[#353b46]" style={poppins}>{filled}/{linked.length}</span><span className="text-[13px] text-[#637085]" style={poppins}>filled</span></div></td>
                      <td className="px-[16px] py-[14px]"><PostingsCell req={req} postings={postings} onManagePosting={onManagePosting} /></td>
                      <td className="px-[16px] py-[14px]"><span className="text-[13px] text-[#637085] tracking-[0.3px] whitespace-nowrap" style={poppins}>{req.createdDate}</span></td>
                      <td className="px-[12px] py-[14px]">
                        <div className="flex items-center gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); onEdit(req); }} className="flex items-center justify-center size-[30px] rounded-[8px] text-[#637085] hover:bg-[#eae8fb] hover:text-[#2927b2] transition-colors"><Pencil className="size-[15px]" /></button>
                          <button onClick={(e) => e.stopPropagation()} className="flex items-center justify-center size-[30px] rounded-[8px] text-[#637085] hover:bg-[#f3f3f5] transition-colors"><MoreVertical className="size-[15px]" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[14px]">
            {rows.map((req) => {
              const linked = linkedOpenings(req, openings);
              const filled = filledCount(req, openings);
              const hm = hiringManagerOf(req.hiringTeam);
              return (
                <button key={req.id} onClick={() => onEdit(req)} className="text-left bg-white rounded-[12px] border border-[#e8eaee] p-[16px] hover:border-[#cac1f2] hover:shadow-sm transition-all flex flex-col gap-[12px]">
                  <div className="flex items-start gap-[12px]">
                    <div className="flex items-center justify-center size-[36px] rounded-[10px] bg-[#eef0fb] text-[#2927b2] shrink-0"><Briefcase className="size-[17px]" /></div>
                    <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                      <span className="text-[14px] font-medium text-[#353b46] truncate" style={poppins}>{req.title || "Untitled job"}</span>
                      <span className="text-[12px] text-[#8c95a8]" style={poppins}>{req.id}</span>
                    </div>
                    <StatusPill status={req.status} size="sm" />
                  </div>
                  <span className="text-[12px] text-[#637085] truncate" style={poppins}>{[req.department, req.location].filter(Boolean).join(" · ") || "—"}</span>
                  <div className="flex items-center justify-between pt-[10px]" style={{ borderTop: "1px solid #f3f3f5" }}>
                    <div className="flex items-center gap-[6px] min-w-0"><Avatar name={hm} size={22} /><span className="text-[12px] text-[#464f5e] truncate" style={poppins}>{hm || "Unassigned"}</span></div>
                    <span className="text-[12px] font-medium text-[#353b46] shrink-0" style={poppins}>{filled}/{linked.length} filled</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
