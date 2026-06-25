import React from "react";
import { ChevronDown, Check } from "lucide-react";
import { PhenomDropdown } from "@/app/components/phenom";

export const poppins = { fontFamily: "Poppins, sans-serif" } as const;

const avatarColors = [
  "bg-[#eae8fb] text-[#2927b2]", "bg-[#e3f2fd] text-[#1565c0]", "bg-[#e8f5e9] text-[#2e7d32]",
  "bg-[#fff3e0] text-[#e65100]", "bg-[#fce4ec] text-[#c62828]",
];
export function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return avatarColors[Math.abs(h) % avatarColors.length];
}

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  if (!name) {
    return <div className="rounded-full bg-[#e8eaee] shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div className={`flex items-center justify-center rounded-full shrink-0 ${avatarColor(name)}`} style={{ width: size, height: size }}>
      <span className="font-semibold" style={{ ...poppins, fontSize: size * 0.38 }}>{initials(name)}</span>
    </div>
  );
}

export const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-[#e8eaee] text-[#464f5e]",
  "Pending Approval": "bg-[#fff3e0] text-[#e65100]",
  Approved: "bg-[#e8f5e9] text-[#2e7d32]",
  Open: "bg-[#e3f2fd] text-[#1565c0]",
  Filled: "bg-[#f3e5f5] text-[#6a1b9a]",
  Closed: "bg-[#fce4ec] text-[#c62828]",
  Cancelled: "bg-[#fce4ec] text-[#c62828]",
  "On Hold": "bg-[#fff3e0] text-[#e65100]",
  Published: "bg-[#e8f5e9] text-[#2e7d32]",
  Paused: "bg-[#fff3e0] text-[#e65100]",
  "Not started": "bg-[#e8eaee] text-[#464f5e]",
  Invited: "bg-[#e3f2fd] text-[#1565c0]",
  "In progress": "bg-[#fff3e0] text-[#e65100]",
  Completed: "bg-[#e8f5e9] text-[#2e7d32]",
  Pending: "bg-[#fff3e0] text-[#e65100]",
  Rejected: "bg-[#fce4ec] text-[#c62828]",
};

export function StatusPill({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const pad = size === "sm" ? "px-[7px] py-[2px] text-[11px]" : "px-[8px] py-[3px] text-[12px]";
  return (
    <span className={`inline-flex items-center rounded-[6px] font-medium tracking-[0.4px] whitespace-nowrap ${pad} ${STATUS_COLORS[status] || "bg-[#e8eaee] text-[#464f5e]"}`} style={poppins}>
      {status}
    </span>
  );
}

export function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex items-center gap-2 mb-1">
      <span className="text-[13px] font-medium text-[#464f5e] tracking-[0.3px]" style={poppins}>{children}</span>
      {hint && <span className="text-[12px] text-[#8c95a8]" style={poppins}>{hint}</span>}
    </label>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function TextField({ value, onChange, placeholder, readOnly }: { value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean }) {
  return (
    <input
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-[9px] bg-white border border-[#d1d5dc] rounded-[8px] text-[14px] text-[#353b46] tracking-[0.3px] placeholder-[#8c95a8] focus:outline-none focus:border-[#4d3ee0] focus:ring-1 focus:ring-[#4d3ee0] transition-colors read-only:bg-[#f8f9fb] read-only:cursor-default"
      style={poppins}
    />
  );
}

export function TextAreaField({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-[9px] bg-white border border-[#d1d5dc] rounded-[8px] text-[14px] text-[#353b46] tracking-[0.3px] placeholder-[#8c95a8] focus:outline-none focus:border-[#4d3ee0] focus:ring-1 focus:ring-[#4d3ee0] transition-colors resize-none"
      style={poppins}
    />
  );
}

export function SelectField({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <PhenomDropdown
      value={value}
      onChange={onChange}
      options={options.map((o) => ({ value: o, label: o }))}
      placeholder={placeholder || "Select…"}
      searchable={options.length > 6}
    />
  );
}

export function NativeSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-[9px] bg-white border border-[#d1d5dc] rounded-[8px] text-[14px] text-[#353b46] tracking-[0.3px] cursor-pointer focus:outline-none focus:border-[#4d3ee0] focus:ring-1 focus:ring-[#4d3ee0] transition-colors pr-9"
        style={poppins}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#464f5e] pointer-events-none" />
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle";
export function Button({ children, onClick, variant = "primary", disabled, className = "", type = "button" }: {
  children: React.ReactNode; onClick?: () => void; variant?: ButtonVariant; disabled?: boolean; className?: string; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center justify-center gap-[8px] px-[16px] py-[9px] rounded-[10px] text-[14px] font-medium tracking-[0.3px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#3c6d68] text-white hover:bg-[#335f5b]",
    secondary: "bg-[#4d3ee0] text-white hover:bg-[#4434c4]",
    ghost: "bg-transparent text-[#464f5e] hover:bg-[#f3f3f5]",
    subtle: "bg-white text-[#464f5e] border border-[#d1d5dc] hover:bg-[#f8f9fb]",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`} style={poppins}>
      {children}
    </button>
  );
}

export function SectionCard({ title, description, icon, action, children }: {
  title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#e8eaee]">
      <div className="flex items-start justify-between gap-[12px] px-[20px] py-[16px] border-b border-[#f3f3f5]">
        <div className="flex items-center gap-[10px] min-w-0">
          {icon && <div className="flex items-center justify-center size-[32px] rounded-[8px] bg-[#eae8fb] text-[#2927b2] shrink-0">{icon}</div>}
          <div className="flex flex-col gap-[1px] min-w-0">
            <span className="text-[15px] font-semibold text-[#353b46] tracking-[0.3px]" style={poppins}>{title}</span>
            {description && <span className="text-[13px] text-[#637085] tracking-[0.3px]" style={poppins}>{description}</span>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-[20px]">{children}</div>
    </div>
  );
}

export function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-center size-[18px] rounded-[5px] border transition-colors shrink-0 ${checked ? "bg-[#4d3ee0] border-[#4d3ee0]" : "bg-white border-[#8c95a8] hover:border-[#4d3ee0]"}`}
    >
      {checked && <Check className="w-[12px] h-[12px] text-white" />}
    </button>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative flex items-center shrink-0 rounded-full transition-colors ${checked ? "bg-[#3c6d68]" : "bg-[#d1d5dc]"}`} style={{ width: 40, height: 22 }}>
      <span className={`absolute top-[3px] size-[16px] rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[21px]" : "translate-x-[3px]"}`} />
    </button>
  );
}
