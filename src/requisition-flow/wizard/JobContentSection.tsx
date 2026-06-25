import { useState } from "react";
import { Plus, Trash2, Languages, FileText, Check, Globe, LayoutGrid, Star, Sparkles } from "lucide-react";
import type { JobContent, JobContentLocale } from "../types";
import { emptyLocale, localeCompleteness } from "../types";
import { POSTING_LANGUAGES } from "../data/constants";
import { PhenomDropdown } from "@/app/components/phenom";
import { poppins, Field, TextAreaField, Button, SectionCard } from "../components/primitives";

const FIELDS: { key: keyof Omit<JobContentLocale, "language">; label: string; placeholder: string; rows: number }[] = [
  { key: "description", label: "Job description", placeholder: "Describe the role, the team, and the impact…", rows: 4 },
  { key: "responsibilities", label: "Responsibilities", placeholder: "What this person will own and do day-to-day…", rows: 4 },
  { key: "requirements", label: "Requirements", placeholder: "Must-have skills and experience…", rows: 3 },
  { key: "benefits", label: "Benefits & perks", placeholder: "Compensation, benefits, perks, and culture…", rows: 3 },
];

function CompletenessBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct === 100 ? "#2e7d32" : pct === 0 ? "#c0c6d0" : "#e65100";
  return (
    <div className="flex items-center gap-[8px]">
      <div className="h-[6px] w-[80px] rounded-full bg-[#eceef2] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[12px] font-medium" style={{ ...poppins, color }}>{pct}%</span>
    </div>
  );
}

export function JobContentSection({ content, onChange }: {
  content: JobContent;
  onChange: (content: JobContent) => void;
}) {
  const [active, setActive] = useState<string>(content.primaryLanguage);

  const availableLanguages = POSTING_LANGUAGES.filter((l) => !content.locales.some((loc) => loc.language === l));

  function updateLocale(language: string, partial: Partial<JobContentLocale>) {
    onChange({ ...content, locales: content.locales.map((l) => (l.language === language ? { ...l, ...partial } : l)) });
  }
  function addLanguage(language: string) {
    if (!language || content.locales.some((l) => l.language === language)) return;
    onChange({ ...content, locales: [...content.locales, emptyLocale(language)] });
    setActive(language);
  }
  function removeLanguage(language: string) {
    if (language === content.primaryLanguage) return;
    onChange({ ...content, locales: content.locales.filter((l) => l.language !== language) });
    setActive(content.primaryLanguage);
  }
  function setPrimary(language: string) {
    if (language === content.primaryLanguage) return;
    onChange({ ...content, primaryLanguage: language });
  }
  function autoTranslate(language: string) {
    const primary = content.locales.find((l) => l.language === content.primaryLanguage);
    if (!primary || language === content.primaryLanguage) return;
    updateLocale(language, {
      description: primary.description,
      responsibilities: primary.responsibilities,
      requirements: primary.requirements,
      benefits: primary.benefits,
      autoTranslated: true,
    });
  }
  function autoTranslateAll() {
    const primary = content.locales.find((l) => l.language === content.primaryLanguage);
    if (!primary) return;
    onChange({
      ...content,
      locales: content.locales.map((l) =>
        l.language === content.primaryLanguage
          ? l
          : { ...l, description: primary.description, responsibilities: primary.responsibilities, requirements: primary.requirements, benefits: primary.benefits, autoTranslated: true },
      ),
    });
  }

  const activeLocale = content.locales.find((l) => l.language === active) ?? content.locales[0];
  const isAll = active === "__all__";

  return (
    <div className="flex flex-col gap-[16px]">
      <SectionCard
        title="Job description & benefits"
        description="The candidate-facing content that gets posted — written per language."
        icon={<FileText className="size-[16px]" />}
        action={
          availableLanguages.length > 0 ? (
            <div className="w-[180px]">
              <PhenomDropdown
                value=""
                onChange={addLanguage}
                options={availableLanguages.map((l) => ({ value: l, label: l }))}
                placeholder="Add language"
                searchable
              />
            </div>
          ) : undefined
        }
      >
        {/* Language tabs + All translations */}
        <div className="flex items-center gap-[6px] flex-wrap mb-[18px]">
          {content.locales.map((l) => {
            const on = active === l.language;
            const pct = Math.round(localeCompleteness(l) * 100);
            return (
              <button
                key={l.language}
                onClick={() => setActive(l.language)}
                className={`inline-flex items-center gap-[8px] px-[12px] py-[7px] rounded-[8px] border text-[13px] font-medium transition-colors ${on ? "bg-[#eae8fb] border-[#cac1f2] text-[#2927b2]" : "bg-white border-[#d1d5dc] text-[#464f5e] hover:bg-[#f8f9fb]"}`}
                style={poppins}
              >
                <Globe className="size-[13px]" />
                {l.language}
                {l.language === content.primaryLanguage && <span className="text-[10px] uppercase tracking-[0.5px] bg-white/70 rounded-[4px] px-[4px] py-[1px] text-[#637085]">Primary</span>}
                <span className={`size-[6px] rounded-full ${pct === 100 ? "bg-[#2e7d32]" : pct === 0 ? "bg-[#c0c6d0]" : "bg-[#e65100]"}`} />
              </button>
            );
          })}
          <button
            onClick={() => setActive("__all__")}
            className={`inline-flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] border text-[13px] font-medium transition-colors ${isAll ? "bg-[#eae8fb] border-[#cac1f2] text-[#2927b2]" : "bg-white border-[#d1d5dc] text-[#464f5e] hover:bg-[#f8f9fb]"}`}
            style={poppins}
          >
            <LayoutGrid className="size-[13px]" /> All translations
          </button>
        </div>

        {/* All translations overview */}
        {isAll ? (
          <div className="flex flex-col gap-[10px]">
            {content.locales.length > 1 && (
              <div className="flex justify-end">
                <button
                  onClick={autoTranslateAll}
                  className="inline-flex items-center gap-[5px] text-[12px] font-medium text-[#4d3ee0] hover:text-[#2927b2] transition-colors"
                  style={poppins}
                >
                  <Languages className="size-[13px]" /> Auto-translate all
                </button>
              </div>
            )}
            {content.locales.map((l) => {
              const c = localeCompleteness(l);
              return (
                <div key={l.language} className="flex items-start gap-[14px] p-[14px] rounded-[10px] border border-[#e8eaee] bg-white">
                  <div className="flex items-center justify-center size-[36px] rounded-[8px] bg-[#eef0fb] text-[#2927b2] shrink-0"><Languages className="size-[16px]" /></div>
                  <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[14px] font-semibold text-[#353b46]" style={poppins}>{l.language}</span>
                      {l.language === content.primaryLanguage && <span className="text-[10px] uppercase tracking-[0.5px] bg-[#eae8fb] rounded-[4px] px-[5px] py-[1px] text-[#2927b2]" style={poppins}>Primary</span>}
                      {l.autoTranslated && <span className="inline-flex items-center gap-[3px] text-[10px] font-medium text-[#2927b2] bg-[#eae8fb] rounded-[4px] px-[5px] py-[1px]" style={poppins}><Sparkles className="size-[10px]" /> Auto</span>}
                    </div>
                    <span className="text-[12px] text-[#637085] line-clamp-2" style={poppins}>{l.description || "No description yet."}</span>
                    <CompletenessBar value={c} />
                  </div>
                  <div className="flex items-center gap-[6px] shrink-0">
                    {l.language !== content.primaryLanguage && (
                      <Button variant="ghost" className="!px-[10px] !py-[6px] !text-[12px]" onClick={() => setPrimary(l.language)}><Star className="size-[12px]" /> Set primary</Button>
                    )}
                    <Button variant="ghost" className="!px-[10px] !py-[6px] !text-[12px]" onClick={() => setActive(l.language)}>Edit</Button>
                    {l.language !== content.primaryLanguage && (
                      <button onClick={() => removeLanguage(l.language)} className="flex items-center justify-center size-[30px] rounded-[8px] text-[#637085] hover:bg-[#fce4ec] hover:text-[#c62828] transition-colors"><Trash2 className="size-[14px]" /></button>
                    )}
                  </div>
                </div>
              );
            })}
            {availableLanguages.length > 0 && (
              <div className="flex items-center gap-[8px] text-[12px] text-[#8c95a8]" style={poppins}>
                <Plus className="size-[13px]" /> Use “Add language” above to create more translations.
              </div>
            )}
          </div>
        ) : (
          activeLocale && (
            <div className="flex flex-col gap-[16px]">
              {activeLocale.language !== content.primaryLanguage && (
                <div className="flex items-center justify-between gap-[12px] px-[14px] py-[10px] rounded-[10px] bg-[#f8f9fb] border border-[#e8eaee]">
                  <div className="flex items-center gap-[8px] min-w-0">
                    <span className="text-[13px] text-[#637085]" style={poppins}>Translating from {content.primaryLanguage}.</span>
                    {activeLocale.autoTranslated && (
                      <span className="inline-flex items-center gap-[4px] text-[11px] font-medium text-[#2927b2] bg-[#eae8fb] rounded-[6px] px-[7px] py-[2px]" style={poppins}><Sparkles className="size-[11px]" /> Auto-translated</span>
                    )}
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <Button variant="subtle" className="!py-[6px]" onClick={() => setPrimary(activeLocale.language)}><Star className="size-[13px]" /> Set as primary</Button>
                    <Button variant="secondary" className="!py-[6px]" onClick={() => autoTranslate(activeLocale.language)}><Languages className="size-[13px]" /> Auto-translate</Button>
                    <button onClick={() => removeLanguage(activeLocale.language)} className="flex items-center justify-center size-[32px] rounded-[8px] text-[#637085] hover:bg-[#fce4ec] hover:text-[#c62828] transition-colors"><Trash2 className="size-[15px]" /></button>
                  </div>
                </div>
              )}
              {FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <TextAreaField value={activeLocale[f.key]} onChange={(v) => updateLocale(activeLocale.language, activeLocale.language !== content.primaryLanguage ? { [f.key]: v, autoTranslated: false } : { [f.key]: v })} placeholder={f.placeholder} rows={f.rows} />
                </Field>
              ))}
              <div className="flex items-center gap-[6px] text-[12px] text-[#637085]" style={poppins}>
                <Check className="size-[13px] text-[#2e7d32]" />
                {activeLocale.autoTranslated
                  ? `Auto-translated from ${content.primaryLanguage} — review and edit before posting in ${activeLocale.language}.`
                  : `This content will be used when the requisition is posted in ${activeLocale.language}.`}
              </div>
            </div>
          )
        )}
      </SectionCard>
    </div>
  );
}
