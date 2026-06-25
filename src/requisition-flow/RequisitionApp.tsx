import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { Requisition, Opening, Posting } from "./types";
import { linkedOpenings } from "./types";
import { SAMPLE_REQUISITIONS } from "./data/requisitions";
import { SAMPLE_OPENINGS } from "./data/openings";
import { SAMPLE_POSTINGS } from "./data/postings";
import { AppShell } from "./components/AppShell";
import { RequisitionsList } from "./pages/RequisitionsList";
import { JobPage } from "./pages/JobPage";
import { RequisitionConfigPage } from "./pages/RequisitionConfigPage";
import { CreateRequisitionModal } from "./wizard/CreateRequisitionModal";
import { ApprovalStep } from "./wizard/ApprovalStep";
import { PostingManager } from "./posting/PostingManager";

interface ConfigState {
  req: Requisition;
  openings: Opening[];
  initialSection?: number;
}

export default function RequisitionApp() {
  const [requisitions, setRequisitions] = useState<Requisition[]>(SAMPLE_REQUISITIONS);
  const [openings, setOpenings] = useState<Opening[]>(SAMPLE_OPENINGS);
  const [postings, setPostings] = useState<Posting[]>(SAMPLE_POSTINGS);

  const [modalOpen, setModalOpen] = useState(false);
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [approvalReq, setApprovalReq] = useState<Requisition | null>(null);
  const [postingReqId, setPostingReqId] = useState<string | null>(null);
  const [jobPageId, setJobPageId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function upsertRequisition(req: Requisition) {
    setRequisitions((prev) => (prev.some((r) => r.id === req.id) ? prev.map((r) => (r.id === req.id ? req : r)) : [req, ...prev]));
  }
  function mergeOpenings(next: Opening[]) {
    setOpenings((prev) => {
      const map = new Map(prev.map((o) => [o.id, o]));
      for (const o of next) map.set(o.id, o);
      return Array.from(map.values());
    });
  }

  function sendForApproval(req: Requisition, seats: Opening[]) {
    upsertRequisition(req);
    mergeOpenings(seats);
  }

  function setupJob(req: Requisition, seats: Opening[], initialSection = 0) {
    setModalOpen(false);
    setConfig({ req, openings: seats, initialSection });
  }

  function saveDraft(req: Requisition, seats: Opening[]) {
    upsertRequisition(req);
    mergeOpenings(seats);
    setConfig(null);
  }

  function completeSetup(req: Requisition, seats: Opening[]) {
    upsertRequisition(req);
    mergeOpenings(seats);
    setConfig(null);
    setCreating(true);
    window.setTimeout(() => {
      setCreating(false);
      setJobPageId(req.id);
    }, 1500);
  }

  function submitForApproval(req: Requisition, seats: Opening[]) {
    upsertRequisition(req);
    mergeOpenings(seats);
    setConfig(null);
    setApprovalReq(req);
  }

  function approve(reqId: string) {
    setRequisitions((prev) => prev.map((r) => (r.id === reqId ? { ...r, status: "Approved" } : r)));
    setApprovalReq((prev) => (prev ? { ...prev, status: "Approved" } : prev));
  }

  function savePosting(posting: Posting) {
    setPostings((prev) => (prev.some((p) => p.id === posting.id) ? prev.map((p) => (p.id === posting.id ? posting : p)) : [posting, ...prev]));
    if (posting.status === "Published") {
      setRequisitions((prev) => prev.map((r) => (r.id === posting.requisitionId && r.status === "Approved" ? { ...r, status: "Open" } : r)));
    }
  }

  function deletePosting(postingId: string) {
    setPostings((prev) => prev.filter((p) => p.id !== postingId));
  }

  function updateAudienceContent(reqId: string, audience: "External" | "Internal", field: string, value: string | undefined) {
    setRequisitions((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? { ...r, postingContent: { ...r.postingContent, [audience]: { ...(r.postingContent?.[audience] ?? {}), [field]: value } } }
          : r,
      ),
    );
  }

  function openJobSettings(req: Requisition) {
    setConfig({ req, openings: linkedOpenings(req, openings) });
  }

  const postingReq = postingReqId ? requisitions.find((r) => r.id === postingReqId) ?? null : null;
  const jobPageReq = jobPageId ? requisitions.find((r) => r.id === jobPageId) ?? null : null;

  return (
    <AppShell>
      {config ? (
        <RequisitionConfigPage
          initialReq={config.req}
          initialOpenings={config.openings}
          allOpenings={openings}
          initialSection={config.initialSection ?? 0}
          postings={postings}
          backLabel={jobPageId ? "Back to job" : "Back to all jobs"}
          onSaveDraft={saveDraft}
          onSubmit={submitForApproval}
          onCancel={() => setConfig(null)}
          onComplete={completeSetup}
          onSavePosting={savePosting}
          onDeletePosting={deletePosting}
        />
      ) : jobPageReq ? (
        <JobPage
          req={jobPageReq}
          openings={openings}
          postings={postings}
          onBack={() => setJobPageId(null)}
          onJobSettings={openJobSettings}
          onManagePosting={(req) => setPostingReqId(req.id)}
        />
      ) : (
        <RequisitionsList
          requisitions={requisitions}
          openings={openings}
          postings={postings}
          onCreate={() => setModalOpen(true)}
          onEdit={(req) => setJobPageId(req.id)}
          onManagePosting={(req) => setPostingReqId(req.id)}
        />
      )}

      <CreateRequisitionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        requisitions={requisitions}
        allOpenings={openings}
        onSendForApproval={sendForApproval}
        onSetupJob={setupJob}
      />

      {/* Approval overlay */}
      {approvalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setApprovalReq(null)} />
          <div className="relative bg-white rounded-[12px] shadow-2xl flex flex-col w-full max-w-[640px] max-h-[90vh]" style={{ minHeight: 480 }}>
            <div className="flex items-center justify-end px-[16px] pt-[12px]">
              <button onClick={() => setApprovalReq(null)} className="flex items-center justify-center size-[36px] rounded-[10px] hover:bg-[#f3f3f5] transition-colors"><X className="size-[18px] text-[#464f5e]" /></button>
            </div>
            <ApprovalStep
              req={approvalReq}
              onApprove={() => approve(approvalReq.id)}
              onCreatePosting={() => { const id = approvalReq.id; setApprovalReq(null); setPostingReqId(id); }}
              onDone={() => setApprovalReq(null)}
            />
          </div>
        </div>
      )}

      <PostingManager
        open={postingReqId !== null}
        req={postingReq}
        postings={postings}
        onClose={() => setPostingReqId(null)}
        onSave={savePosting}
        onDelete={deletePosting}
        onAudienceContentChange={(audience, field, value) => postingReq && updateAudienceContent(postingReq.id, audience, field, value)}
      />

      {/* Creating job loader */}
      {creating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-[16px]">
            <Loader2 className="size-[40px] text-[#4d3ee0] animate-spin" />
            <span className="text-[15px] font-medium text-[#353b46]" style={{ fontFamily: "Poppins, sans-serif" }}>Creating your job…</span>
          </div>
        </div>
      )}
    </AppShell>
  );
}
