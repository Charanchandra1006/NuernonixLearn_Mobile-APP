# Functional Specification Document (FSD)
## AI-Driven Personalized Learning and Academic Performance Prediction System ("LearnSense")

| Field | Value |
|---|---|
| Document Type | Functional Specification Document |
| Version | 1.0 (Draft) |
| Traces From | SRS v1.0 (`SRS-F-xxx`, `SRS-UI-xxx`) |
| Traces To | TRD, System Design, Test Plan |
| Purpose | Screen-by-screen, field-by-field, state-by-state behavior definition |

---

## 0. Conventions Used in This Document

- Each screen has: **Purpose**, **Entry Points**, **Data Displayed** (source-mapped to SRS entities), **Fields/Controls**, **States** (empty/loading/error/populated), **Actions & Resulting Behavior**, **Validation Rules**, **Edge Cases**.
- Field-level validation states three things: *client-side check*, *server-side check* (always present — client-side is UX-only, never trusted alone per `SRS-NFR-S01`), and *error message behavior*.
- Screens are grouped by app surface: **Student App**, **Faculty View**, **Admin Console**.

---

## PART A — STUDENT APP

### A.1 Splash & Auth

#### Screen: Splash
- **Purpose**: Brief branded load state while session token is validated.
- **States**: `checking_session` → routes to Dashboard (valid token) or Login (invalid/absent).
- **Edge case**: Token present but expired → silent refresh attempt; on refresh failure, route to Login with a non-alarming message ("Please sign in again"), not a raw error code.

#### Screen: Login / Registration
- **Fields (Login)**: Email/Institutional ID (text, required), Password (masked, required).
  - Client validation: non-empty, basic email format if email-based.
  - Server validation: credential match; account status check (active/suspended).
  - Error behavior: generic "Invalid credentials" (never reveal whether email exists — security requirement, ties to `SRS-NFR-S01`).
- **Fields (Registration)**: Full Name, Institutional Email, Enrollment ID, Password, Confirm Password, Cohort/Program selector.
  - Validation: Enrollment ID checked against institution roster if available (`ASM-A` adapter) else accepted provisionally pending Admin verification.
  - Edge case: Duplicate enrollment ID → block with "This ID is already registered — contact your administrator" rather than a generic duplicate error, since this is a common support case.
- **Consent step**: Explicit checkbox(es) for optional data categories (`SRS-CONSENT-01`) — core account consent is a separate, non-optional acknowledgment (ToS/Privacy).

---

### A.2 Dashboard (traces `SRS-F-020`, `SRS-F-030`, `SRS-F-060`)

- **Purpose**: Single-glance academic health summary + entry point to everything else.
- **Data Displayed**:
  - Academic Health composite indicator (derived display, not a raw stored field — computed client-side or via a summary endpoint from latest `RiskScore` + `Prediction` set).
  - Predicted Semester Score (latest `Prediction` aggregate across subjects, with confidence badge).
  - Trend indicators (Δ vs. prior period) for performance, study time, quiz accuracy.
  - Topics Mastered count (`TopicMastery` where classification = Strong) / total.
  - "Topics Needing Attention" count (Weak classification).
  - Today's Learning Plan preview (top 2–3 `LearningPlanItem`s for current day, from active `LearningPlan`).
- **States**:
  - `cold_start`: Replace prediction widgets with a "Let's build your profile" prompt directing to diagnostic quiz (`SRS-F-080`); no numeric health score shown yet — showing a fabricated-feeling number here would violate `PRD-TRUST-06`.
  - `loading`: Skeleton placeholders, not blank screen.
  - `stale_data`: If prediction is served from cache due to pipeline failure (`SRS-NFR-R01`), show "Updated [date]" label instead of "Live."
  - `populated`: Normal state as described above.
- **Actions**:
  - Tap Academic Health / Prediction → navigates to Performance Prediction screen (A.5).
  - Tap "Topics Needing Attention" → navigates to Topic Mastery screen (A.6), pre-filtered to Weak.
  - Tap "Start Learning" → navigates to today's first pending Learning Plan item.
- **Edge case**: If all plan items for today are already completed, replace "Start Learning" CTA with a positive-reinforcement state ("All done for today 🎉") rather than showing an empty/dead button.

---

### A.3 Subjects (List)

- **Purpose**: Entry point to per-subject analytics.
- **Data Displayed**: Per enrolled `Subject` — current predicted range, risk tier badge (color-coded per `SRS-F-030` tiers), attendance %.
- **Actions**: Tap subject → Subject Analytics screen (A.4).
- **Empty state**: No subjects enrolled → prompt to contact Admin/Faculty for enrollment (system does not self-enroll students into subjects).

---

### A.4 Subject Analytics

- **Purpose**: Deep-dive into one subject's performance drivers.
- **Data Displayed**: Prediction range + confidence + driver factors (rendered via `SRS-F-051` plain-language explanation, with the underlying structured factors available on tap/expand for transparency-minded users).
- **Sub-sections**: Marks history (table/chart of `AcademicRecord` by type over time), Attendance trend, Topic mastery summary (top 3 strong, top 3 weak, link to full list).
- **Actions**: "Why this prediction?" expandable → shows driver factors with signed magnitude bars (visual, not just text) — direct UI expression of `SRS-F-050`.
- **Edge case**: Subject with `confidence=low` (cold-start) → prediction section replaced with "Complete the diagnostic quiz to unlock predictions for this subject" CTA.

---

### A.5 Performance Prediction (Detail)

- **Purpose**: Full prediction detail + historical trend (traces `SRS-F-021`).
- **Data Displayed**: Line/band chart of predicted range over time vs. actual scores where known (actual points overlaid distinctly from predicted band — must be visually distinguishable, not implied as equal-certainty data).
- **Controls**: Time-range selector (This term / All time).
- **Edge case**: No actual data points yet in current term → chart shows predicted band only with a caption clarifying no results have been recorded yet this term.

---

### A.6 Topic Mastery (List + Detail)

- **List Screen**:
  - **Data Displayed**: Every `Topic` in the subject's taxonomy with mastery classification (Strong/Moderate/Weak/Not Yet Assessed — the last is visually distinct, e.g., grey rather than red, per `SRS-F-040` edge case).
  - **Sort/Filter**: Default sort = Weak-first (actionability-first ordering); filter chips for each classification.
- **Detail Screen** (per topic):
  - **Data Displayed**: Mastery score breakdown (Concept Understanding / Practice Accuracy / Revision Stability as three distinct mini-metrics, not just one blended number — matches PRD §12 example), mastery-over-time sparkline, linked resources, linked adaptive-practice CTA.
  - **Action**: "Practice this topic" → launches Adaptive Quiz (A.8) scoped to this topic.

---

### A.7 Academic Risk Detail

- **Purpose**: Explains the "why" behind the risk tier shown on Dashboard.
- **Data Displayed**: Risk score (0–100) + tier, driver factors list (signed, magnitude-labeled, matching `RiskScore.driver_factors[]`), plain-language summary sentence.
- **Tone requirement**: Copy on this screen is explicitly reviewed against `SRS-NFR-U01` — framed as "here's what's affecting your trajectory" not "you are failing."
- **Action**: "This doesn't seem right" → triggers Flag-as-Wrong flow (`SRS-F-142`): short reason picker (optional free text) → confirmation toast ("Thanks — this helps us improve. It won't change your score automatically.") — the copy must set correct expectations per the SRS requirement that flags don't auto-modify scores.

---

### A.8 Personalized Learning Plan

- **Purpose**: Actionable weekly plan (traces `SRS-F-060`–`063`).
- **Data Displayed**: Day-by-day tabs (matches itinerary-style structure), each with ordered `LearningPlanItem`s: type icon, topic name, estimated minutes, status.
- **Actions**:
  - Mark item complete/skip (skip requires no reason but is logged for plan-quality analytics).
  - "Regenerate plan" manual trigger (in addition to automatic triggers in `SRS-F-061`) — rate-limited to prevent abuse/thrashing (e.g., max 1 manual regen per day).
- **States**: `advanced_track` (per `SRS-F-062`, visually distinct badge "Stretch Plan" for high performers so it doesn't read as remedial).
- **Edge case**: Plan generation fails (e.g., no available time input, no assessment calendar data) → explicit empty state explaining what's missing and a CTA to provide it (e.g., "Set your available study time" settings shortcut), not a silent empty list.

---

### A.9 Study Materials (Resource Recommendations)

- **Purpose**: Browse recommended resources.
- **Data Displayed**: Cards per `Recommendation`, grouped by linked weak topic, each showing type icon, title, and the specific reason ("Recommended because: Probability mastery is 44%").
- **Action**: Mark helpful/not helpful (feeds `Recommendation.accepted`) — used for future recommendation-quality tuning, not shown as a public rating.

---

### A.10 Adaptive Quiz

- **Purpose**: Deliver adaptive assessment (traces `SRS-F-070`–`072`).
- **Flow**:
  1. Quiz intro screen: subject/topic scope, estimated length (dynamic, since adaptive length may vary), "Begin" CTA.
  2. Question screen: question text, options (single-select default; multi-select/numeric-entry types supported per `Question` schema extensibility), timer (soft, informational — not a hard cutoff unless institution configures one), Next.
  3. Immediate feedback: correct/incorrect indication before advancing (configurable per institution — some pedagogies prefer end-of-quiz-only feedback; default = immediate).
  4. Circuit-breaker state (`SRS-F-071`): after N consecutive misses on a topic, screen interstitial: "Let's review this concept first" with explanation content, then a "Ready to continue" CTA before resuming questions — this is a distinct screen state, not a silent difficulty change, because the student should understand why the quiz paused.
  5. Results screen (A.11).
- **Edge case**: Network interruption mid-quiz → local state preserved, resume on reconnect rather than losing progress (client must queue responses if offline briefly).

---

### A.11 Quiz Results

- **Data Displayed**: Score, per-question review (question, student answer, correct answer, brief explanation — GenAI or static), mastery delta for affected topic(s) (before → after, explicit numbers matching PRD §12 example format).
- **Action**: "Ask AI Assistant about this" on any missed question → deep-links into Assistant (A.13) with that question pre-loaded as context.

---

### A.12 Progress Tracking

- **Purpose**: Longitudinal view (traces `SRS-F-021`, `SRS-F-040`).
- **Data Displayed**: Mastery-over-time per subject, streak/consistency indicators, plan completion rate trend, prediction-vs-actual accuracy over time (transparency about the system's own track record, not just the student's).

---

### A.13 AI Study Assistant

- **Purpose**: Conversational interface (traces `SRS-F-090`–`091`).
- **UI**: Standard chat interface; quick-action chips ("Explain a concept," "Why did I get this wrong," "Plan my next 3 days").
- **Behavior**: When a query requires student-specific data the system doesn't have or the answer would be speculative, assistant states the limitation explicitly (UI must render this as a normal assistant message, not an error state, since it's an expected, correct behavior per `SRS-F-091`).
- **Edge case**: GenAI provider outage → chat input disabled with inline message "Assistant is temporarily unavailable — your other data is unaffected," per `SRS-NFR-R02`.

---

### A.14 Notifications

- **Data Displayed**: List grouped by type (Risk alerts, Plan reminders, Milestones), unread indicator.
- **Action**: Tap → deep-link to relevant screen (risk alert → A.7, plan reminder → A.8, milestone → A.12).

---

### A.15 Settings

- **Fields**: Notification preferences (per category, per `SRS-F-131` — risk-tier-change toggle is channel-only, not fully off), available study time input (used by `SRS-F-060`), optional data category consent toggles (`SRS-CONSENT-01`), account/privacy controls.

---

## PART B — FACULTY VIEW

### B.1 Class Overview (traces `SRS-F-110`)

- **Data Displayed**: Section selector (if faculty teaches multiple), risk-tier distribution (counts + simple bar/donut), week-over-week delta, average predicted performance.
- **Action**: Tap a tier count → filtered At-Risk List (B.2).

### B.2 At-Risk Student List (traces `SRS-F-111`)

- **Data Displayed**: Table/list — Student name, risk score, tier badge, top driver factor (inline, no click needed), days to next assessment.
- **Controls**: Sort by risk score / days-to-assessment; filter by tier.
- **Action**: Tap row → Student Detail (B.3).
- **Access control note**: List is always pre-scoped server-side to faculty's authorized sections (`SRS-F-114`) — no client-side "all students" fetch ever occurs, even hidden.

### B.3 Student Detail (Faculty View)

- **Data Displayed**: Risk driver summary, topic mastery snapshot (aggregated, not raw event log — per `PRD-TRUST-03` boundary: faculty do NOT see second-by-second telemetry here), academic record summary, intervention log history.
- **Action**: "Log Intervention" → modal with category dropdown (`SRS-F-113` enum) + optional note → append-only save, confirmation toast, entry appears immediately in history (immutable — no edit/delete control shown, by design).
- **Edge case**: Faculty attempts to access a student outside their section via direct link/deep-link → authorization error screen (403-style messaging: "You don't have access to this student's record") — resolves the SRS open question toward explicit denial for this v1, pending final security review.

### B.4 Topic Difficulty Aggregate (traces `SRS-F-112`)

- **Data Displayed**: Per-topic bar showing % of class below Moderate mastery, sorted descending (worst-first) — this is the "most difficult topics" view from PRD §33.
- **Action**: Tap topic → list of affected students (still scoped to faculty's section) with an option to bulk-assign a resource or note.

---

## PART C — ADMIN CONSOLE

### C.1 Cohort Analytics (traces `SRS-F-120`)

- **Data Displayed**: Department/cohort risk-tier trend over term (line chart), current distribution, comparison across sections within the same subject (identifies section-level anomalies, e.g., one section systematically higher risk — useful signal Admin wouldn't get from faculty view alone).

### C.2 Systemic Topic Aggregation (traces `SRS-F-121`)

- **Data Displayed**: Cross-section rollup of weak topics — same visual pattern as B.4 but department-wide, useful for curriculum review conversations.

### C.3 Topic Taxonomy Authoring (traces `SRS-F-010`–`011`)

- **Fields**: Topic name, parent topic selector (with cycle prevention enforced — invalid parent choices are disabled in the picker, not just rejected after submit), difficulty baseline.
- **AI-Assist flow**: Upload syllabus document → "Suggest Topics" → review screen showing proposed tree with Accept/Edit/Reject per node → nothing is published until explicit "Publish Taxonomy" action (hard gate matching `SRS-F-011`).

### C.4 User & Role Management

- **Fields**: User list with role, section/department assignment, status (active/suspended).
- **Action**: Role change, section reassignment — all changes written to `AuditLog` (`SRS-F-141`).

### C.5 Report Export (traces `SRS-F-122`)

- **Controls**: View selector (Cohort Analytics / Topic Aggregation), date range, format (PDF/CSV).
- **Behavior**: Large exports run asynchronously; Admin receives an in-app notification with download link on completion rather than a blocking spinner (matches `SRS-F-122`).

### C.6 Fairness/Model Transparency Panel (traces `SRS-NFR-F01`, `PRD-TRUST-04`)

- **Data Displayed**: Aggregate model performance metrics (accuracy over recent window), subgroup distribution view (only visible/populated where consented demographic data exists), model version currently in production.
- **Note**: This is a monitoring view, not an editing surface — Admin cannot directly alter individual scores from here, preserving model integrity.

---

## Cross-Cutting UI Rules

- `FSD-RULE-01`: No screen displays a numeric prediction/risk score without an accompanying explanation element visible without extra navigation (inline summary at minimum, expandable for detail) — direct UI enforcement of `SRS-CON-03`.
- `FSD-RULE-02`: Any "Weak"/at-risk framing uses constructive language reviewed against `SRS-NFR-U01` — a copy-review gate applied uniformly, not screen-by-screen improvisation.
- `FSD-RULE-03`: Every list/table screen has explicit empty, loading, and error states defined (no screen ships with only the "happy path" populated state designed).
- `FSD-RULE-04`: Faculty/Admin screens never expose raw per-event student telemetry — only aggregated/derived metrics — enforced as a UI-layer rule mirroring `PRD-TRUST-03` even where the API might technically have the data available to other consumers.

---

## Appendix — Screen-to-Requirement Traceability (excerpt)

| Screen | SRS ID(s) |
|---|---|
| Dashboard | SRS-F-020, SRS-F-030, SRS-F-060, SRS-F-080 |
| Subject Analytics | SRS-F-050, SRS-F-051 |
| Topic Mastery | SRS-F-040, SRS-F-041 |
| Academic Risk Detail | SRS-F-030, SRS-F-142 |
| Learning Plan | SRS-F-060–063 |
| Adaptive Quiz | SRS-F-070–072 |
| AI Assistant | SRS-F-090, SRS-F-091 |
| Faculty At-Risk List | SRS-F-111, SRS-F-114 |
| Faculty Student Detail | SRS-F-113, SRS-F-114 |
| Admin Taxonomy Authoring | SRS-F-010, SRS-F-011 |
| Admin Report Export | SRS-F-122 |
| Admin Fairness Panel | SRS-NFR-F01 |

---

*End of FSD v1.0 draft. Next: TRD (technology stack rationale, algorithm/model choices, API contracts, GenAI prompt architecture), then System Design (component/data-flow diagrams, scaling plan), then Test Plan (strategy + case-level detail tracing every SRS/FSD ID above).*
