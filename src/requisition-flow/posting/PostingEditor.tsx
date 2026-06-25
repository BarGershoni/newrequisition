import { useState } from "react";
import { Megaphone, Globe, Check, Send, ArrowLeft, Lock, Users, FileText, FileSignature, RotateCcw } from "lucide-react";
import type { Requisition, Posting, PostingVariant, PostingStatus, PostingAudience, PostingContentOverride } from "../types";
import { channelsForAudience, POSTING_LANGUAGES, APPLICATION_FORMS } from "../data/constants";
import { nextPostingId } from "../data/postings";
import { poppins, Button, StatusPill, SectionCard, Checkbox, Field, TextAreaField, SelectField } from "../components/primitives";

const CONTENT_FIELDS: { key: keyof PostingContentOverride; label: string; placeholder: string; rows: number }[] = [
  { key: "description", label: "Job description", placeholder: "Describe the role, the team, and the impact…", rows: 4 },
  { key: "responsibilities", label: "Responsibilities", placeholder: "What this person will own and do day-to-day…", rows: 4 },
  { key: "requirements", label: "Requirements", placeholder: "Must-have skills and experience…", rows: 3 },
  { key: "benefits", label: "Benefits & perks", placeholder: "Compensation, benefits, perks, and culture…", rows: 3 },
];

export function PostingEditor({ req, audience, existing, audienceContent, onAudienceContentChange, onBack, onSave }: {
  req: Requisition;
  audience: PostingAudience;
  existing: Posting | null;
  audienceContent: PostingContentOverride;
  onAudienceContentChange: (field: keyof PostingContentOverride, value: string | undefined) => void;
  onBack: () => void;
  onSave: (posting: Posting) => void;
}) {
  const audienceChannels = channelsForAudience(audience);
  const defaultChannel = audienceChannels[0]?.label;

  const [channels, setChannels] = useState<Set<string>>(() =>
    new Set(existing ? existing.variants.map((v) => v.channel) : defaultChannel ? [defaultChannel] : []),
  );
  const [languages, setLanguages] = useState<Set<string>>(() =>
    new Set(existing ? existing.variants.map((v) => v.language) : [req.content.primaryLanguage || "English"]),
  );
  const [formId, setFormId] = useState<string>(existing?.applicationFormId ?? APPLICATION_FORMS[0]);

  const channelLabels = audienceChannels.filter((c) => channels.has(c.label)).map((c) => c.label);
  const languageList = POSTING_LANGUAGES.filter((l) => languages.has(l));
  const variantCount = channelLabels.length * languageList.length;

  const isInternal = audience === "Internal";
  const accent = isInternal ? "#3c6d68" : "#4d3ee0";

  const primary = req.content.locales.find((l) => l.language === req.content.primaryLanguage) ?? req.content.locales[0];
  const inherited: PostingContentOverride = {
    description: primary?.description ?? "",
    responsibilities: primary?.responsibilities ?? "",
    requirements: primary?.requirements ?? "",
    benefits: primary?.benefits ?? "",
  };

  function toggleChannel(label: string) {
    setChannels((prev) => { const n = new Set(prev); n.has(label) ? n.delete(label) : n.add(label); return n; });
  }
  function toggleLanguage(label: string) {
    setLanguages((prev) => { const n = new Set(prev); n.has(label) ? n.delete(label) : n.add(label); return n; });
  }

  function build(status: PostingStatus): Posting {
    const variants: PostingVariant[] = [];
    let i = 0;
    for (const channel of channelLabels) {
      for (const language of languageList) {
        i += 1;
        variants.push({ id: `v${i}`, channel, language, status });
      }
    }
    return { id: existing?.id ?? nextPostingId(), requisitionId: req.id, title: req.title, audience, status, variants, applicationFormId: formId };
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Sub-header */}
      <div className="flex items-center gap-[12px] px-[24px] py-[12px] bg-[#f8f9fb]" style={{ borderBottom: "1px solid #e8eaee" }}>
        <button onClick={onBack} className="flex items-center gap-[8px] px-[10px] py-[7px] rounded-[8px] text-[13px] font-medium text-[#464f5e] hover:bg-white transition-colors" style={poppins}>
          <ArrowLeft className="size-[14px]" /> All postings
        </button>
        <span className="text-[13px] text-[#8c95a8]" style={poppins}>/</span>
        <div className="inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-[8px] text-[12px] font-semibold" style={{ ...poppins, backgroundColor: isInternal ? "#e6f0ef" : "#eae8fb", color: accent }}>
          {isInternal ? <Lock className="size-[13px]" /> : <Globe className="size-[13px]" />}
          {audience} posting
        </div>
        <span className="text-[13px] text-[#637085]" style={poppins}>{existing ? existing.id : "New"}</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-[16px]">
        <div className="flex items-center gap-[10px] px-[14px] py-[12px] rounded-[10px]" style={{ backgroundColor: isInternal ? "#e6f0ef" : "#eef0fb", border: `1px solid ${isInternal ? "#bcd9d5" : "#dcdffb"}` }}>
          {isInternal ? <Users className="size-[16px] text-[#3c6d68] shrink-0" /> : <Globe className="size-[16px] text-[#2927b2] shrink-0" />}
          <span className="text-[13px] text-[#637085]" style={poppins}>
            {isInternal
              ? "Internal posts are visible to employees only — surfaced on internal channels for referrals and internal mobility."
              : "External posts are public and candidate-facing across job boards and your career site."}
          </span>
        </div>

        <SectionCard title={`${audience} channels`} description="Only channels for this audience are shown." icon={<Megaphone className="size-[16px]" />}>
          <div className="grid grid-cols-2 gap-[10px]">
            {audienceChannels.map((c) => {
              const on = channels.has(c.label);
              return (
                <button key={c.key} onClick={() => toggleChannel(c.label)} className="flex items-center gap-[12px] p-[12px] rounded-[10px] border text-left transition-colors" style={{ backgroundColor: on ? (isInternal ? "#e6f0ef" : "#eae8fb") : "#fff", borderColor: on ? (isInternal ? "#bcd9d5" : "#cac1f2") : "#d1d5dc" }}>
                  <Checkbox checked={on} onChange={() => toggleChannel(c.label)} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold" style={{ ...poppins, color: on ? accent : "#353b46" }}>{c.label}</span>
                    <span className="text-[12px] text-[#637085] truncate" style={poppins}>{c.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Languages" description="Each language produces a localized variant." icon={<Globe className="size-[16px]" />}>
          <div className="flex flex-wrap gap-[8px]">
            {POSTING_LANGUAGES.map((l) => {
              const on = languages.has(l);
              const available = req.content.locales.some((loc) => loc.language === l);
              return (
                <button key={l} onClick={() => toggleLanguage(l)} className="inline-flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] border text-[13px] font-medium transition-colors" style={{ ...poppins, backgroundColor: on ? accent : "#fff", color: on ? "#fff" : "#464f5e", borderColor: on ? accent : "#d1d5dc" }}>
                  {on && <Check className="size-[13px]" />} {l}
                  {!available && <span className="text-[10px] opacity-70">(no translation)</span>}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Application form" description="The form candidates complete for this posting — can differ per posting." icon={<FileSignature className="size-[16px]" />}>
          <div className="w-[320px] max-w-full">
            <SelectField value={formId} onChange={setFormId} options={APPLICATION_FORMS} />
          </div>
        </SectionCard>

        <SectionCard title="Published content" description={`Inherited from the job description. Edits apply to all ${audience.toLowerCase()} postings — internal and external can differ.`} icon={<FileText className="size-[16px]" />}>
          <div className="flex flex-col gap-[16px]">
            {CONTENT_FIELDS.map((f) => {
              const overridden = audienceContent[f.key] !== undefined;
              const value = overridden ? (audienceContent[f.key] as string) : (inherited[f.key] ?? "");
              return (
                <Field key={f.key} label={f.label}>
                  <div className="flex items-center justify-between mb-[6px]">
                    <span className="inline-flex items-center gap-[5px] text-[11px] font-medium px-[7px] py-[2px] rounded-[6px]" style={{ ...poppins, backgroundColor: overridden ? (isInternal ? "#e6f0ef" : "#eae8fb") : "#f4f6fa", color: overridden ? accent : "#8c95a8" }}>
                      {overridden ? `Edited for ${audience.toLowerCase()}` : "Inherited from job description"}
                    </span>
                    {overridden && (
                      <button onClick={() => onAudienceContentChange(f.key, undefined)} className="inline-flex items-center gap-[4px] text-[11px] font-medium text-[#637085] hover:text-[#4d3ee0] transition-colors" style={poppins}>
                        <RotateCcw className="size-[11px]" /> Reset to job description
                      </button>
                    )}
                  </div>
                  <TextAreaField value={value} onChange={(v) => onAudienceContentChange(f.key, v)} placeholder={f.placeholder} rows={f.rows} />
                </Field>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Variants" description={`${variantCount} ${variantCount === 1 ? "variant" : "variants"} will be generated.`}>
          {variantCount === 0 ? (
            <span className="text-[13px] text-[#637085]" style={poppins}>Select at least one channel and one language.</span>
          ) : (
            <div className="flex flex-col gap-[6px]">
              {channelLabels.map((channel) =>
                languageList.map((language) => (
                  <div key={`${channel}-${language}`} className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-[8px] bg-[#f8f9fb] border border-[#e8eaee]">
                    <Megaphone className="size-[14px] text-[#637085]" />
                    <span className="text-[13px] font-medium text-[#353b46]" style={poppins}>{channel}</span>
                    <span className="text-[12px] text-[#637085]" style={poppins}>·</span>
                    <span className="text-[13px] text-[#464f5e]" style={poppins}>{language}</span>
                    <div className="ml-auto"><StatusPill status="Draft" size="sm" /></div>
                  </div>
                )),
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-[12px] px-[24px] py-[14px]" style={{ borderTop: "1px solid #e8eaee" }}>
        <Button variant="subtle" onClick={() => onSave(build("Draft"))} disabled={variantCount === 0}>Save as draft</Button>
        <Button variant="secondary" onClick={() => onSave(build("Published"))} disabled={variantCount === 0}><Send className="size-[15px]" /> Publish posting</Button>
      </div>
    </div>
  );
}
