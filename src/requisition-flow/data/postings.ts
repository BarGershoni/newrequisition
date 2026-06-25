import type { Posting } from "../types";

export const SAMPLE_POSTINGS: Posting[] = [
  {
    id: "POST-001", requisitionId: "REQ-2026-001", title: "Senior Product Analyst", audience: "External", status: "Published",
    variants: [
      { id: "v1", channel: "Career site", language: "English", status: "Published" },
      { id: "v2", channel: "LinkedIn", language: "English", status: "Published" },
      { id: "v3", channel: "Indeed", language: "English", status: "Paused" },
    ],
  },
  {
    id: "POST-002", requisitionId: "REQ-2026-001", title: "Senior Product Analyst", audience: "Internal", status: "Published",
    variants: [
      { id: "v1", channel: "Internal job board", language: "English", status: "Published" },
      { id: "v2", channel: "Employee referrals", language: "English", status: "Published" },
    ],
  },
  {
    id: "POST-003", requisitionId: "REQ-2026-002", title: "UX Designer II", audience: "External", status: "Draft",
    variants: [{ id: "v1", channel: "Career site", language: "English", status: "Draft" }],
  },
];

let postingCounter = SAMPLE_POSTINGS.length;
export function nextPostingId(): string {
  postingCounter += 1;
  return `POST-${String(postingCounter).padStart(3, "0")}`;
}
