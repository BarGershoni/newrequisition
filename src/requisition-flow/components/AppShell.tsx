import React from "react";
import { Bell, Search, Settings, LayoutGrid, Users, Briefcase, BarChart3, Calendar, Mail } from "lucide-react";
import { poppins, Avatar } from "./primitives";

const SIDEBAR_ITEMS = [
  { icon: <LayoutGrid className="size-[18px]" />, active: false },
  { icon: <Briefcase className="size-[18px]" />, active: true },
  { icon: <Users className="size-[18px]" />, active: false },
  { icon: <Calendar className="size-[18px]" />, active: false },
  { icon: <Mail className="size-[18px]" />, active: false },
  { icon: <BarChart3 className="size-[18px]" />, active: false },
  { icon: <Settings className="size-[18px]" />, active: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      {/* Top navigation */}
      <div className="bg-white shrink-0 w-full" style={{ borderBottom: "1px solid #d1d5dc" }}>
        <div className="flex items-center justify-between pl-[16px] pr-[24px] py-[10px]">
          <div className="flex gap-[16px] items-center">
            <div className="flex items-center justify-center size-[32px] rounded-[8px] bg-[#4d3ee0]">
              <span className="text-white text-[15px] font-bold" style={poppins}>H</span>
            </div>
            <div className="flex gap-[8px] items-center">
              <button className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-[10px] hover:bg-[#f3f3f5] transition-colors">
                <span className="text-[14px] text-[#464f5e] tracking-[0.3px]" style={poppins}>Halpert Recruiters</span>
              </button>
              <button className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-[10px] hover:bg-[#f3f3f5] transition-colors">
                <span className="text-[14px] text-[#464f5e] tracking-[0.3px]" style={poppins}>Recruiter experience</span>
              </button>
            </div>
          </div>
          <div className="flex gap-[16px] items-center">
            <div className="bg-white flex gap-[8px] items-center px-[12px] py-[8px] rounded-[10px] w-[260px] border border-[#8c95a8]">
              <Search className="size-[16px] text-[#637085] shrink-0" />
              <span className="text-[14px] text-[#637085] tracking-[0.3px]" style={poppins}>Search</span>
            </div>
            <button className="flex items-center justify-center size-[40px] rounded-[10px] hover:bg-[#f3f3f5] transition-colors">
              <Bell className="size-[18px] text-[#464f5e]" />
            </button>
            <Avatar name="Jessica Wang" size={32} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <div className="bg-[#f8f9fb] shrink-0 flex flex-col items-center gap-[4px] pt-[12px] px-[8px]" style={{ borderRight: "1px solid #d1d5dc" }}>
          {SIDEBAR_ITEMS.map((item, i) => (
            <button key={i} className={`flex items-center justify-center size-[40px] rounded-[10px] transition-colors ${item.active ? "bg-[#eae8fb] text-[#2927b2]" : "text-[#464f5e] hover:bg-[#e8eaee]"}`}>
              {item.icon}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
