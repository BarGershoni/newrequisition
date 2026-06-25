import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
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

export interface PhenomDropdownOption {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
  disabled?: boolean;
}

interface PhenomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: PhenomDropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  emptyMessage?: string;
}

const poppins = { fontFamily: "Poppins, sans-serif" } as const;

export function PhenomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  searchable = true,
  disabled = false,
  compact = false,
  className,
  emptyMessage = "No results found.",
}: PhenomDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between gap-2 bg-white border border-[#d1d5dc] rounded-[8px] text-left transition-colors",
            "hover:border-[#8c95a8] focus:outline-none focus:border-[#4d3ee0] focus:ring-1 focus:ring-[#4d3ee0]",
            "disabled:bg-[#f8f9fb] disabled:cursor-not-allowed disabled:opacity-60",
            compact ? "px-2 py-[6px] text-[13px]" : "px-3 py-[9px] text-[14px]",
            className,
          )}
          style={poppins}
        >
          <span className={cn("truncate tracking-[0.3px]", selected ? "text-[#353b46]" : "text-[#8c95a8]")}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown className={cn("shrink-0 text-[#464f5e]", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 border-[#d1d5dc] rounded-[8px] shadow-lg"
        style={poppins}
      >
        <Command
          filter={(itemValue, search) => {
            if (!searchable) return 1;
            const haystack = itemValue.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-[#e8eaee] px-3">
              <Search className="w-3.5 h-3.5 text-[#637085] shrink-0" />
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-9 border-0 shadow-none focus:ring-0 text-[13px] text-[#353b46] placeholder:text-[#8c95a8]"
              />
            </div>
          )}
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
  );
}
