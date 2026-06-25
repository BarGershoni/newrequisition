export interface SystemUser {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
}

export const SYSTEM_USERS: SystemUser[] = [
  { id: "u001", name: "Sarah Chen", email: "sarah.chen@halpert.com", department: "Product", title: "Director of Product" },
  { id: "u002", name: "Michael Torres", email: "michael.torres@halpert.com", department: "Engineering", title: "Engineering Manager" },
  { id: "u003", name: "Emily Johnson", email: "emily.johnson@halpert.com", department: "Design", title: "Design Lead" },
  { id: "u004", name: "David Kim", email: "david.kim@halpert.com", department: "Engineering", title: "Senior Engineering Manager" },
  { id: "u005", name: "Rachel Patel", email: "rachel.patel@halpert.com", department: "Operations", title: "VP Operations" },
  { id: "u006", name: "Jessica Wang", email: "jessica.wang@halpert.com", department: "HR", title: "Senior Recruiter" },
  { id: "u007", name: "Marcus Brown", email: "marcus.brown@halpert.com", department: "HR", title: "Lead Recruiter" },
  { id: "u008", name: "Olivia Martinez", email: "olivia.martinez@halpert.com", department: "HR", title: "Recruiting Coordinator" },
  { id: "u009", name: "Liam Anderson", email: "liam.anderson@halpert.com", department: "HR", title: "Talent Partner" },
  { id: "u010", name: "Sophie Clarke", email: "sophie.clarke@halpert.com", department: "HR", title: "Recruiter" },
  { id: "u011", name: "James Okafor", email: "james.okafor@halpert.com", department: "Engineering", title: "Staff Engineer" },
  { id: "u012", name: "Priya Nambiar", email: "priya.nambiar@halpert.com", department: "Product", title: "Senior Product Manager" },
  { id: "u013", name: "Jordan Rivera", email: "jordan.rivera@halpert.com", department: "Analytics", title: "Senior Analyst" },
  { id: "u014", name: "Alex Morgan", email: "alex.morgan@halpert.com", department: "Marketing", title: "Marketing Manager" },
  { id: "u015", name: "Taylor Brooks", email: "taylor.brooks@halpert.com", department: "Sales", title: "Sales Director" },
  { id: "u016", name: "Chris Nguyen", email: "chris.nguyen@halpert.com", department: "Engineering", title: "Tech Lead" },
  { id: "u017", name: "Morgan Lee", email: "morgan.lee@halpert.com", department: "Finance", title: "Finance Manager" },
  { id: "u018", name: "Aisha Rahman", email: "aisha.rahman@halpert.com", department: "HR", title: "HR Business Partner" },
  { id: "u019", name: "Daniel Foster", email: "daniel.foster@halpert.com", department: "Engineering", title: "Principal Engineer" },
  { id: "u020", name: "Elena Vasquez", email: "elena.vasquez@halpert.com", department: "Design", title: "Senior UX Designer" },
  { id: "u021", name: "Ryan Cooper", email: "ryan.cooper@halpert.com", department: "Sales", title: "Account Executive" },
  { id: "u022", name: "Nina Kapoor", email: "nina.kapoor@halpert.com", department: "Product", title: "Product Analyst" },
  { id: "u023", name: "Ben Walsh", email: "ben.walsh@halpert.com", department: "Operations", title: "Program Manager" },
  { id: "u024", name: "Hannah Kim", email: "hannah.kim@halpert.com", department: "HR", title: "Sourcer" },
];

export function systemUserOptions(excludeNames: Set<string>, currentName = "") {
  return SYSTEM_USERS
    .filter((user) => user.name === currentName || !excludeNames.has(user.name))
    .map((user) => ({
      value: user.name,
      label: user.name,
      description: `${user.title} · ${user.department}`,
      keywords: `${user.email} ${user.department} ${user.title}`,
    }));
}
