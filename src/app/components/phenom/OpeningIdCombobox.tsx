import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import { cn } from "@/app/components/ui/utils";
import type { PhenomDropdownOption } from "./Dropdown";

interface OpeningIdComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: PhenomDropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  compact?: boolean;
  className?: string;
}

const poppins = { fontFamily: "Poppins, sans-serif" } as const;

export function OpeningIdCombobox({
  value,
  onChange,
  options,
  placeholder = "Enter or select ID",
  searchPlaceholder = "Search openings...",
  emptyMessage = "No openings found.",
  compact = false,
  className,
}: OpeningIdComboboxProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commitDraft() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setDraft(value);
      return;
    }
    onChange(trimmed);
  }

  return (
    <div
      className={cn(
        "flex w-full items-stretch bg-white border border-[#d1d5dc] rounded-[8px] overflow-hidden transition-colors",
        "focus-within:border-[#4d3ee0] focus-within:ring-1 focus-within:ring-[#4d3ee0]",
        className,
      )}
      style={poppins}
    >
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitDraft();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "Escape") {
            setDraft(value);
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder={placeholder}
        className={cn(
          "flex-1 min-w-0 bg-transparent border-none outline-none text-[#353b46] placeholder:text-[#8c95a8] tracking-[0.3px]",
          compact ? "px-2 py-[6px] text-[13px]" : "px-3 py-[9px] text-[14px]",
        )}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Select existing opening"
            className={cn(
              "flex items-center justify-center shrink-0 border-l border-[#d1d5dc] text-[#464f5e] hover:bg-[#f8f9fb] transition-colors",
              compact ? "px-1.5" : "px-2",
            )}
          >
            <ChevronDown className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-[260px] p-0 border-[#d1d5dc] rounded-[8px] shadow-lg"
          style={poppins}
        >
          <Command
            filter={(itemValue, search) => {
              const haystack = itemValue.toLowerCase();
              return haystack.includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <div className="border-b border-[#e8eaee] px-3">
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-9 border-0 shadow-none focus:ring-0 text-[13px] text-[#353b46] placeholder:text-[#8c95a8]"
              />
            </div>
            <CommandList className="max-h-[240px]">
              <CommandEmpty className="py-6 text-[13px] text-[#637085]">{emptyMessage}</CommandEmpty>
              <CommandGroup className="p-1">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.description ?? ""} ${option.keywords ?? ""}`}
                    disabled={option.disabled}
                    onSelect={() => {
                      onChange(option.value);
                      setDraft(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-[6px] px-2 py-2 cursor-pointer",
                      "aria-selected:bg-[#eae8fb] aria-selected:text-[#2927b2]",
                      "data-[disabled=true]:opacity-40",
                    )}
                  >
                    <div className="flex flex-col gap-[1px] flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-[#353b46] truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-[12px] text-[#637085] truncate">{option.description}</span>
                      )}
                    </div>
                    <Check className={cn("w-3.5 h-3.5 text-[#2927b2] shrink-0", value === option.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
