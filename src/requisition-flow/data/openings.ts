import type { Opening } from "../types";

// Top-level Opening records. Some are linked to a requisition; some are unlinked
// seats (requisitionId === null) that exist from capacity planning and can be
// attached to a requisition later.
export const SAMPLE_OPENINGS: Opening[] = [
  // Linked to REQ-2026-001 (2 seats, 1 filled)
  { id: "OPN-001", requisitionId: "REQ-2026-001", title: "Senior Product Analyst", location: "New York, NY", employmentType: "Full-time", targetStartDate: "2026-09-01", status: "Filled", source: "new" },
  { id: "OPN-002", requisitionId: "REQ-2026-001", title: "Senior Product Analyst", location: "New York, NY", employmentType: "Full-time", targetStartDate: "2026-09-01", status: "Open", source: "new" },
  // Linked to REQ-2026-002
  { id: "OPN-003", requisitionId: "REQ-2026-002", title: "UX Designer II", location: "San Francisco, CA", employmentType: "Full-time", targetStartDate: "2026-08-15", status: "Open", source: "new" },
  // Linked to REQ-2026-003 (3 seats)
  { id: "OPN-004", requisitionId: "REQ-2026-003", title: "Senior Software Engineer", location: "Austin, TX", employmentType: "Full-time", targetStartDate: "2026-10-01", status: "Open", source: "new" },
  { id: "OPN-005", requisitionId: "REQ-2026-003", title: "Senior Software Engineer", location: "Austin, TX", employmentType: "Full-time", targetStartDate: "2026-10-01", status: "On Hold", source: "new" },
  { id: "OPN-006", requisitionId: "REQ-2026-003", title: "Senior Software Engineer", location: "Remote", employmentType: "Full-time", targetStartDate: "2026-11-01", status: "Open", source: "new" },

  // ── Unlinked seats (no requisition yet) — can be attached during creation ──
  { id: "OPN-012", requisitionId: null, title: "", location: "San Francisco, CA", employmentType: "Full-time", targetStartDate: "2026-08-15", status: "Open", source: "existing" },
  { id: "OPN-018", requisitionId: null, title: "", location: "Austin, TX", employmentType: "Contract", targetStartDate: "2026-07-01", status: "Open", source: "existing" },
  { id: "OPN-024", requisitionId: null, title: "", location: "Remote", employmentType: "Full-time", targetStartDate: "2026-11-01", status: "Open", source: "existing" },
  { id: "OPN-031", requisitionId: null, title: "", location: "New York, NY", employmentType: "Part-time", targetStartDate: "2026-09-15", status: "On Hold", source: "existing" },
  { id: "OPN-037", requisitionId: null, title: "", location: "Chicago, IL", employmentType: "Full-time", targetStartDate: "2026-10-15", status: "Open", source: "existing" },
  { id: "OPN-042", requisitionId: null, title: "", location: "Boston, MA", employmentType: "Temporary", targetStartDate: "2026-06-30", status: "Open", source: "existing" },
];

let openingCounter = 100;
export function nextOpeningId(): string {
  openingCounter += 1;
  return `OPN-${String(openingCounter).padStart(3, "0")}`;
}

export function unlinkedOpenings(openings: Opening[]): Opening[] {
  return openings.filter((o) => o.requisitionId === null);
}

/** Options for the "link an existing unlinked seat" combobox. */
export function unlinkedOpeningOptions(openings: Opening[], usedIds: Set<string>, currentId: string) {
  return openings
    .filter((o) => o.requisitionId === null)
    .filter((o) => o.id === currentId || !usedIds.has(o.id))
    .map((o) => ({
      value: o.id,
      label: o.id,
      description: `${o.location} · ${o.employmentType}`,
      keywords: `${o.id} ${o.location} ${o.employmentType} ${o.status}`,
    }));
}
