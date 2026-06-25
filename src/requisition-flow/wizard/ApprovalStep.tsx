import { CheckCircle2, Clock, Megaphone, ArrowRight } from "lucide-react";
import type { Requisition } from "../types";
import { poppins, StatusPill, Button, Avatar } from "../components/primitives";

export function ApprovalStep({ req, onApprove, onCreatePosting, onDone }: {
  req: Requisition;
  onApprove: () => void;
  onCreatePosting: () => void;
  onDone: () => void;
}) {
  const approved = req.status === "Approved";

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <div className="flex flex-col items-center text-center px-[32px] pt-[36px] pb-[24px]">
        <div className={`flex items-center justify-center size-[64px] rounded-full mb-[16px] ${approved ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#eef0fb] text-[#4d3ee0]"}`}>
          {approved ? <CheckCircle2 className="size-[32px]" /> : <Clock className="size-[32px]" />}
        </div>
        <span className="text-[20px] font-semibold text-[#353b46] mb-[4px]" style={poppins}>
          {approved ? "Requisition approved" : "Sent for approval"}
        </span>
        <span className="text-[14px] text-[#637085] max-w-[460px]" style={poppins}>
          {approved
            ? "This requisition is approved and ready to advertise. Posting is a separate step — create one or more postings at the requisition level."
            : `${req.title} (${req.id}) has been routed through the approval chain. Once approved, you can create postings.`}
        </span>
      </div>

      {/* Approval chain */}
      <div className="px-[32px] pb-[24px]">
        <div className="bg-white rounded-[12px] border border-[#e8eaee] p-[20px] max-w-[560px] mx-auto">
          <span className="text-[13px] font-semibold text-[#353b46]" style={poppins}>Approval chain</span>
          <div className="flex flex-col gap-[10px] mt-[12px]">
            {req.approvalChain.length === 0 && <span className="text-[13px] text-[#637085]" style={poppins}>No approvers configured.</span>}
            {req.approvalChain.map((a, i) => (
              <div key={a.id} className="flex items-center gap-[10px]">
                <span className="flex items-center justify-center size-[24px] rounded-full bg-[#eae8fb] text-[#2927b2] text-[12px] font-semibold shrink-0" style={poppins}>{i + 1}</span>
                <Avatar name={a.approver} size={28} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-[#353b46]" style={poppins}>{a.approver || "Unassigned"}</span>
                  <span className="text-[12px] text-[#637085]" style={poppins}>{a.role || "Approver"}</span>
                </div>
                <StatusPill status={approved ? "Approved" : a.state} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-center gap-[12px] px-[32px] py-[20px]" style={{ borderTop: "1px solid #e8eaee" }}>
        {approved ? (
          <>
            <Button variant="subtle" onClick={onDone}>Back to requisitions</Button>
            <Button variant="secondary" onClick={onCreatePosting}><Megaphone className="size-[15px]" /> Create posting</Button>
          </>
        ) : (
          <>
            <Button variant="subtle" onClick={onDone}>Done</Button>
            <Button onClick={onApprove}>Simulate approval <ArrowRight className="size-[15px]" /></Button>
          </>
        )}
      </div>
    </div>
  );
}
