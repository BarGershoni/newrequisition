import { useState } from "react";
import { X, Megaphone, Globe, Lock, Plus, Pencil, Trash2 } from "lucide-react";
import type { Requisition, Posting, PostingAudience, PostingContentOverride } from "../types";
import { poppins, StatusPill, Button } from "../components/primitives";
import { PostingEditor } from "./PostingEditor";

type Mode = { view: "list" } | { view: "edit"; audience: PostingAudience; posting: Posting | null };

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

function PostingCard({ posting, onEdit, onDelete }: { posting: Posting; onEdit: () => void; onDelete: () => void }) {
  const isInternal = posting.audience === "Internal";
  const accent = isInternal ? "#3c6d68" : "#2927b2";
  const channels = uniq(posting.variants.map((v) => v.channel));
  const languages = uniq(posting.variants.map((v) => v.language));
  return (
    <div className="flex items-start gap-[14px] p-[16px] rounded-[12px] border border-[#e8eaee] bg-white">
      <div className="flex items-center justify-center size-[38px] rounded-[10px] shrink-0" style={{ backgroundColor: isInternal ? "#e6f0ef" : "#eae8fb", color: accent }}>
        {isInternal ? <Lock className="size-[17px]" /> : <Globe className="size-[17px]" />}
      </div>
      <div className="flex flex-col gap-[6px] flex-1 min-w-0">
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] font-semibold" style={{ ...poppins, color: accent }}>{posting.audience}</span>
          <span className="text-[12px] text-[#8c95a8]" style={poppins}>{posting.id}</span>
          <StatusPill status={posting.status} size="sm" />
        </div>
        <span className="text-[13px] text-[#464f5e]" style={poppins}>{channels.join(", ")}</span>
        <div className="flex items-center gap-[8px] text-[12px] text-[#637085]" style={poppins}>
          <span>{languages.join(" · ")}</span>
          <span>•</span>
          <span>{posting.variants.length} {posting.variants.length === 1 ? "variant" : "variants"}</span>
        </div>
      </div>
      <div className="flex items-center gap-[6px] shrink-0">
        <button onClick={onEdit} className="flex items-center justify-center size-[32px] rounded-[8px] text-[#637085] hover:bg-[#eae8fb] hover:text-[#2927b2] transition-colors"><Pencil className="size-[14px]" /></button>
        <button onClick={onDelete} className="flex items-center justify-center size-[32px] rounded-[8px] text-[#637085] hover:bg-[#fce4ec] hover:text-[#c62828] transition-colors"><Trash2 className="size-[14px]" /></button>
      </div>
    </div>
  );
}

function AudienceGroup({ audience, postings, onNew, onEdit, onDelete }: {
  audience: PostingAudience;
  postings: Posting[];
  onNew: () => void;
  onEdit: (p: Posting) => void;
  onDelete: (id: string) => void;
}) {
  const isInternal = audience === "Internal";
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          {isInternal ? <Lock className="size-[15px] text-[#3c6d68]" /> : <Globe className="size-[15px] text-[#2927b2]" />}
          <span className="text-[14px] font-semibold text-[#353b46]" style={poppins}>{audience}</span>
          <span className="bg-[#f4f6fa] rounded-[6px] px-[7px] py-[1px] text-[12px] text-[#637085]" style={poppins}>{postings.length}</span>
        </div>
        <Button variant="subtle" className="!py-[6px]" onClick={onNew}><Plus className="size-[14px]" /> New {audience.toLowerCase()} post</Button>
      </div>
      {postings.length === 0 ? (
        <div className="flex items-center justify-center py-[20px] rounded-[10px] border border-dashed border-[#d1d5dc] bg-[#f8f9fb]">
          <span className="text-[13px] text-[#8c95a8]" style={poppins}>No {audience.toLowerCase()} posts yet.</span>
        </div>
      ) : (
        postings.map((p) => <PostingCard key={p.id} posting={p} onEdit={() => onEdit(p)} onDelete={() => onDelete(p.id)} />)
      )}
    </div>
  );
}

/** Inline (non-modal) version of the posting manager, embedded as a section in the job setup page. */
export function PostingSection({ req, postings, onSave, onDelete, onAudienceContentChange }: {
  req: Requisition;
  postings: Posting[];
  onSave: (posting: Posting) => void;
  onDelete: (postingId: string) => void;
  onAudienceContentChange: (audience: PostingAudience, field: keyof PostingContentOverride, value: string | undefined) => void;
}) {
  const [mode, setMode] = useState<Mode>({ view: "list" });

  const reqPostings = postings.filter((p) => p.requisitionId === req.id);
  const external = reqPostings.filter((p) => p.audience === "External");
  const internal = reqPostings.filter((p) => p.audience === "Internal");

  function handleSave(posting: Posting) {
    onSave(posting);
    setMode({ view: "list" });
  }

  if (mode.view === "edit") {
    const editAudience = mode.audience;
    return (
      <div className="flex flex-col rounded-[12px] border border-[#e8eaee] bg-white overflow-hidden">
        <PostingEditor
          req={req}
          audience={editAudience}
          existing={mode.posting}
          audienceContent={req.postingContent?.[editAudience] ?? {}}
          onAudienceContentChange={(field, value) => onAudienceContentChange(editAudience, field, value)}
          onBack={() => setMode({ view: "list" })}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center gap-[10px] px-[14px] py-[12px] rounded-[10px] bg-[#eef0fb] border border-[#dcdffb]">
        <Megaphone className="size-[16px] text-[#2927b2] shrink-0" />
        <span className="text-[13px] text-[#637085]" style={poppins}>Create separate posts for different audiences. Internal posts reach employees for referrals and mobility; external posts go public across job boards.</span>
      </div>
      <AudienceGroup audience="External" postings={external} onNew={() => setMode({ view: "edit", audience: "External", posting: null })} onEdit={(p) => setMode({ view: "edit", audience: "External", posting: p })} onDelete={onDelete} />
      <AudienceGroup audience="Internal" postings={internal} onNew={() => setMode({ view: "edit", audience: "Internal", posting: null })} onEdit={(p) => setMode({ view: "edit", audience: "Internal", posting: p })} onDelete={onDelete} />
    </div>
  );
}

export function PostingManager({ open, req, postings, onClose, onSave, onDelete, onAudienceContentChange }: {
  open: boolean;
  req: Requisition | null;
  postings: Posting[];
  onClose: () => void;
  onSave: (posting: Posting) => void;
  onDelete: (postingId: string) => void;
  onAudienceContentChange: (audience: PostingAudience, field: keyof PostingContentOverride, value: string | undefined) => void;
}) {
  const [mode, setMode] = useState<Mode>({ view: "list" });

  if (!open || !req) return null;

  const reqPostings = postings.filter((p) => p.requisitionId === req.id);
  const external = reqPostings.filter((p) => p.audience === "External");
  const internal = reqPostings.filter((p) => p.audience === "Internal");

  function close() {
    setMode({ view: "list" });
    onClose();
  }
  function handleSave(posting: Posting) {
    onSave(posting);
    setMode({ view: "list" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px]">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative bg-white rounded-[12px] shadow-2xl flex flex-col w-full max-w-[920px] max-h-[92vh]" style={{ minHeight: 540 }}>
        {/* Header */}
        <div className="flex items-center gap-[16px] px-[24px] py-[16px]" style={{ borderBottom: "1px solid #e8eaee" }}>
          <div className="flex items-center gap-[10px] flex-1 min-w-0">
            <div className="flex items-center justify-center size-[32px] rounded-[8px] bg-[#eae8fb] text-[#2927b2]"><Megaphone className="size-[16px]" /></div>
            <div className="flex flex-col min-w-0">
              <span className="text-[18px] font-semibold text-[#353b46] truncate" style={poppins}>Postings</span>
              <span className="text-[13px] text-[#637085] truncate" style={poppins}>{req.title} · {req.id}</span>
            </div>
          </div>
          <button onClick={close} className="flex items-center justify-center size-[36px] rounded-[10px] hover:bg-[#f3f3f5] transition-colors"><X className="size-[18px] text-[#464f5e]" /></button>
        </div>

        {mode.view === "list" ? (
          <div className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-[24px]">
            <div className="flex items-center gap-[10px] px-[14px] py-[12px] rounded-[10px] bg-[#eef0fb] border border-[#dcdffb]">
              <span className="text-[13px] text-[#637085]" style={poppins}>Create separate posts for different audiences. Internal posts reach employees for referrals and mobility; external posts go public across job boards.</span>
            </div>
            <AudienceGroup audience="External" postings={external} onNew={() => setMode({ view: "edit", audience: "External", posting: null })} onEdit={(p) => setMode({ view: "edit", audience: "External", posting: p })} onDelete={onDelete} />
            <AudienceGroup audience="Internal" postings={internal} onNew={() => setMode({ view: "edit", audience: "Internal", posting: null })} onEdit={(p) => setMode({ view: "edit", audience: "Internal", posting: p })} onDelete={onDelete} />
          </div>
        ) : (
          <PostingEditor
            req={req}
            audience={mode.audience}
            existing={mode.posting}
            audienceContent={req.postingContent?.[mode.audience] ?? {}}
            onAudienceContentChange={(field, value) => onAudienceContentChange(mode.audience, field, value)}
            onBack={() => setMode({ view: "list" })}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
