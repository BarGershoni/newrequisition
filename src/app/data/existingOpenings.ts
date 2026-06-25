export interface ExistingOpening {
  id: string;
  location: string;
  employmentType: string;
  targetDate: string;
  status: string;
}

export const EXISTING_OPENINGS: ExistingOpening[] = [
  { id: "OPN-012", location: "San Francisco, CA", employmentType: "Full-time", targetDate: "2026-08-15", status: "Open" },
  { id: "OPN-018", location: "Austin, TX", employmentType: "Contract", targetDate: "2026-07-01", status: "Open" },
  { id: "OPN-024", location: "Remote", employmentType: "Full-time", targetDate: "2026-11-01", status: "Open" },
  { id: "OPN-031", location: "New York, NY", employmentType: "Part-time", targetDate: "2026-09-15", status: "On Hold" },
  { id: "OPN-037", location: "Chicago, IL", employmentType: "Full-time", targetDate: "2026-10-15", status: "Open" },
  { id: "OPN-042", location: "Boston, MA", employmentType: "Temporary", targetDate: "2026-06-30", status: "Open" },
  { id: "OPN-048", location: "Hybrid", employmentType: "Full-time", targetDate: "2026-12-01", status: "Open" },
  { id: "OPN-055", location: "San Francisco, CA", employmentType: "Contract", targetDate: "2026-08-01", status: "On Hold" },
];

export function existingOpeningOptions(usedIds: Set<string>, currentId: string) {
  return EXISTING_OPENINGS
    .filter((o) => o.id === currentId || !usedIds.has(o.id))
    .map((o) => ({
      value: o.id,
      label: o.id,
      description: `${o.location} · ${o.employmentType}`,
      keywords: `${o.id} ${o.location} ${o.employmentType} ${o.status}`,
    }));
}

export function findExistingOpening(id: string) {
  return EXISTING_OPENINGS.find((o) => o.id === id);
}
