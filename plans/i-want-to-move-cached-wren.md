# Plan: Job Creation Popup + Approval Flow

## Context

Currently, clicking "Create Job" navigates away to a full-page 5-step wizard. The user wants a lighter
entry point: a modal popup captures the key job details first, the user sends the job for approval,
and then chooses to continue into either **Job Setup** (the existing wizard) or **Job Posting**
(a future flow). Jobs submitted through the popup land in the table with **Pending Approval** status.

---

## New Flow

```
[Jobs Table]
   └─ "Create Job" click
         ↓
   [Modal – Form view]
      All step-1 fields: Job ID (auto), Title, Department, Location,
      Hiring Manager, Recruiter, Salary Band, Status, Openings table
         ↓  "Send for Approval"
   [Modal – Confirmation view]
      "Job sent for approval" message
      ┌──────────────────┐   ┌──────────────────┐
      │  Job Setup       │   │  Job Posting     │
      └──────────────────┘   └──────────────────┘
         ↓ "Job Setup"             ↓ "Job Posting"
   [Wizard page, step 1        [Close modal,
    pre-filled, status =        stay on table,
    "Pending Approval"]         placeholder]
```

---

## Implementation

### 1 · New state in `App` (single file: `src/app/App.tsx`)

```ts
const [showModal, setShowModal] = useState(false);
const [modalPhase, setModalPhase] = useState<"form" | "sent">("form");
// jobs must become mutable so new entries can be appended
const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);   // change from const
```

### 2 · `CreateJobModal` component (inline in App.tsx)

**Trigger:** "Create Job" button sets `showModal = true`, `modalPhase = "form"`.

**Structure using `@radix-ui/react-dialog`:**
```
Dialog.Root (controlled open=showModal)
  Dialog.Overlay  — semi-transparent backdrop
  Dialog.Content  — centered white card, max-w-2xl, max-h-[90vh] overflow-y-auto
    Header: "Create Job" title + X close button
    ── Phase "form" ──────────────────────────────
      Reuse existing form primitives (FormField, TextInput, SelectInput)
      Fields in 2-col grid:
        Row 1: Job ID (read-only)  |  Job Title
        Row 2: Department          |  Location
        Row 3: Hiring Manager      |  Recruiter
        Row 4: Salary Band         |  Status
      OpeningsTable (compact, same component)
      Footer: [Cancel]  [Send for Approval →]
    ── Phase "sent" ──────────────────────────────
      Success icon (green check circle)
      Heading: "Sent for Approval"
      Sub-text: "Job ID · Title has been submitted. You'll be notified once it's reviewed."
      Two equal buttons:
        [Job Setup]     → closes modal, navigates to wizard, step 1 active, step 1 pre-filled
        [Job Posting]   → closes modal, stays on table (placeholder)
```

**On "Send for Approval":**
1. Derive the new `Job` record from `formData` + `openings`
2. Append to `jobs` with `status: "Pending Approval"`
3. Switch `modalPhase` to `"sent"`

**On "Job Setup":**
1. `setShowModal(false)`, `setModalPhase("form")`
2. `setPage("wizard")`, `setCurrentStep(1)` — wizard opens pre-filled

**On "Job Posting":**
1. `setShowModal(false)`, `setModalPhase("form")`
2. Stay on jobs table page

**On close / Cancel:**
1. `setShowModal(false)`, reset `modalPhase` to `"form"`
2. Reset `formData` back to blank defaults, reset `openings` to one default opening

### 3 · `formData` reset helper

Add a `resetForm()` function that resets `formData` to the blank initial state (new auto-ID) and `openings` to one default opening. Call it whenever the modal closes.

### 4 · Wizard pre-fill

When entering the wizard from the modal's "Job Setup" button, `formData` is already populated from the modal form — no extra plumbing needed. The wizard step 1 will show the filled values. The status will be `"Pending Approval"`.

### 5 · `jobs` mutability

Change `const [jobs] = useState<Job[]>(SAMPLE_JOBS)` to `const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS)` so new jobs can be appended.

---

## Files to modify

| File | Changes |
|------|---------|
| `src/app/App.tsx` | All changes — new state, `CreateJobModal` component, mutate `jobs`, update "Create Job" button handler |

No new files needed.

---

## Reused patterns / components

- `FormField`, `TextInput`, `SelectInput` — already defined in App.tsx, used as-is inside modal
- `OpeningsTable` — already defined, drop in directly
- `statusColors` — used for the status badge in the confirmation phase
- `@radix-ui/react-dialog` — pre-installed, import `Dialog` from `"@radix-ui/react-dialog"`

---

## Verification

1. Click "Create Job" → modal opens with blank form
2. Fill in Title + Department, leave others default, click "Send for Approval"
3. Modal switches to confirmation view — "Sent for Approval" with Job Setup / Job Posting buttons
4. New job appears in the table with **Pending Approval** orange badge (tab count updates)
5. Click "Job Setup" → modal closes, wizard opens with pre-filled step-1 values, status = Pending Approval
6. Click "Cancel" in wizard → returns to table, job still in list as Pending Approval
7. Reopen modal via "Create Job" → form is blank (reset), new auto-ID generated
8. Click "Job Posting" (from confirmation) → modal closes, stays on table
