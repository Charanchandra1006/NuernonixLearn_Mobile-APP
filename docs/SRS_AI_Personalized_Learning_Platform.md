# Software Requirements Specification (SRS)
## AI-Driven Personalized Learning and Academic Performance Prediction System ("LearnSense")

| Field | Value |
|---|---|
| Document Type | Software Requirements Specification (IEEE 830 / 29148-inspired) |
| Version | 1.0 (Draft) |
| Traces From | PRD v1.0 (`PRD-FR-xxx`, `PRD-NFR-xxx`, `PRD-GOAL-xxx`) |
| Traces To | FSD (screen behavior), TRD (algorithms/stack), System Design (architecture), Test Plan |
| Convention | Requirement IDs are permanent — never renumber, only deprecate (`[DEPRECATED]`) |

---

## 0. Assumptions Carried From PRD Open Questions

Per your confirmation, this SRS proceeds on these defaults (flagged wherever a real decision would change the spec materially):
- `ASM-A`: Primary data ingestion path is manual entry + CSV/bulk import; a live SIS/LMS API integration is designed as a pluggable adapter, not assumed present in v1.
- `ASM-B`: Topic taxonomy is faculty/SME-authored via an admin authoring interface, with an AI-assisted "suggest topics from syllabus" helper (not fully automated).
- `ASM-C`: LLM provider is abstracted behind an internal `GenAIProvider` interface — no hard vendor lock assumed at SRS level.
- `ASM-D`: Faculty intervention logging is hybrid: structured category (dropdown) + optional free text.

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the complete functional, data, interface, and quality requirements for LearnSense at a level of detail sufficient for design (TRD/System Design) and test-case derivation (Test Plan), without prescribing specific technology choices (those are TRD-owned).

### 1.2 Scope
Covers: Student mobile app, Faculty web/mobile views, Admin web console, backend services (ingestion, prediction, risk, mastery, personalization, adaptive assessment, generative AI orchestration, notifications), and the data store. Excludes: LMS authoring, proctoring, payment/billing (not applicable), parent portal (deferred).

### 1.3 Definitions, Acronyms, Abbreviations

| Term | Definition |
|---|---|
| **Topic** | The smallest addressable unit of a subject's content taxonomy (e.g., "Conditional Probability" under "Probability" under "Engineering Mathematics") |
| **Mastery Score** | A 0–100 estimate of a student's command of a specific topic, derived from accuracy, recency, and practice volume |
| **Risk Score** | A 0–100 composite score representing likelihood of academic underperformance, mapped to Low/Medium/High tiers |
| **Prediction Window** | The assessment (exam/assignment) horizon a prediction targets |
| **Driver Factor** | A named, signed (↑/↓), magnitude-quantified contributor to a prediction or risk score, used for explainability |
| **Cold-Start Student** | A student with insufficient historical data to produce a high-confidence prediction (see §5.9) |
| **Intervention** | Any personalized action item (study plan task, resource, adaptive quiz) generated for a student, or a faculty-logged manual action |
| **GenAI** | Generative AI component (LLM-backed) used for explanation text, question generation, and the assistant |

### 1.4 References
- PRD v1.0 (this project)
- IEEE 830-1998 / ISO/IEC/IEEE 29148:2018 (structural convention only, not literal compliance claim)

### 1.5 Overview
Section 2 gives an overall description; Section 3 specifies external interfaces; Section 4 covers data requirements; Section 5 is the detailed functional requirements (the bulk of this document); Section 6 covers non-functional requirements; Section 7 covers other requirements (legal, i18n); Appendices hold the data dictionary and traceability matrix.

---

## 2. Overall Description

### 2.1 Product Perspective
LearnSense is a new, standalone system that may optionally integrate with an institution's existing SIS/LMS via an adapter layer but does not require it to function (manual/CSV path is always available — `ASM-A`).

### 2.2 Product Functions (Summary)
1. Academic + behavioral data ingestion and validation
2. Topic taxonomy management
3. Performance prediction (subject-wise, overall)
4. Academic risk scoring with explainability
5. Topic mastery estimation
6. Personalized study-plan generation
7. Adaptive quiz delivery
8. AI-generated question authoring
9. Conversational AI study assistant
10. Resource recommendation
11. Progress tracking & continuous re-evaluation loop
12. Faculty triage dashboard & intervention logging
13. Admin/institution analytics & reporting
14. Notification management
15. Identity, access control & audit logging

### 2.3 User Classes and Characteristics

| User Class | Technical Proficiency | Frequency of Use | Primary Needs |
|---|---|---|---|
| Student | Low–Medium | Daily/near-daily | Clear, specific, low-friction guidance |
| Faculty | Low–Medium | Weekly | Exception-based triage, minimal manual data entry |
| Admin | Medium | Monthly/termly | Aggregated trend visibility, exportable reports |
| System Integrator (implicit) | High | Setup/maintenance | Clean adapter/API contracts, error visibility |

### 2.4 Operating Environment
- Student/Faculty: mobile app (iOS/Android via cross-platform framework — see TRD) + optional web view for faculty/admin.
- Backend: cloud-hosted services, containerized (see TRD/System Design).
- Data store: relational DB for transactional/academic data; may use a secondary store for high-volume telemetry (TRD decision).

### 2.5 Design & Implementation Constraints
- `SRS-CON-01`: Must support at least the manual/CSV ingestion path without requiring institutional API access (ties to `PRD-ASM-01`).
- `SRS-CON-02`: All GenAI calls must go through the abstracted provider interface (`ASM-C`) to avoid vendor lock and to support the fallback in §5.11.
- `SRS-CON-03`: All student-visible risk/prediction outputs must carry an explanation payload — enforced at the API contract level, not just UI convention (traces `PRD-NFR-06`).

### 2.6 Assumptions & Dependencies
See PRD §9, carried forward unchanged, plus `ASM-A`–`ASM-D` above.

---

## 3. External Interface Requirements

### 3.1 User Interfaces (high-level; screen-level detail is FSD-owned)
- `SRS-UI-01`: Student mobile app — Dashboard, Subjects, Subject Analytics, Topic Mastery, Prediction, Risk, Learning Plan, Study Materials, Adaptive Quiz, Quiz Results, Progress, AI Assistant, Notifications, Settings (per PRD §20).
- `SRS-UI-02`: Faculty view (mobile-responsive web or app) — Class Overview, At-Risk List, Student Detail, Topic Difficulty Aggregate, Intervention Log.
- `SRS-UI-03`: Admin console (web) — Cohort Analytics, Topic Taxonomy Authoring, User/Role Management, Report Export.

### 3.2 Hardware Interfaces
- None beyond standard mobile device sensors/network; no specialized hardware required.

### 3.3 Software Interfaces
- `SRS-IF-01` **SIS/LMS Adapter (optional)**: Pull-based or file-drop-based interface for attendance/marks import; must validate against the schema in §4.2 and reject non-conforming rows with a per-row error report (not a whole-file failure).
- `SRS-IF-02` **GenAI Provider Interface**: Abstract interface exposing `generateExplanation()`, `generateQuestion()`, `assistantRespond()` — implementation-agnostic at SRS level (TRD picks the vendor/model).
- `SRS-IF-03` **Notification Delivery**: Abstract interface over push/email/in-app channels.

### 3.4 Communications Interfaces
- `SRS-COM-01`: All client-server communication over encrypted channels (TLS 1.2+).
- `SRS-COM-02`: API shall be versioned to allow non-breaking evolution (e.g., `/v1/...`).

---

## 4. Data Requirements

### 4.1 Core Entities (Conceptual — physical schema is TRD-owned)

```
User (id, role[student|faculty|admin], name, email, auth_ref, status)
Student (user_id FK, enrollment_id, cohort_id, program, year)
Faculty (user_id FK, department, sections[])
Subject (id, name, code, department_id)
Topic (id, subject_id, parent_topic_id[nullable], name, difficulty_baseline)
AcademicRecord (id, student_id, subject_id, record_type[internal|assignment|lab|quiz|final|previous_sem], value, max_value, recorded_at, source[manual|import])
Attendance (id, student_id, subject_id, period, percentage, recorded_at)
StudySession (id, student_id, subject_id, topic_id[nullable], started_at, ended_at, source[app|inferred])
Question (id, subject_id, topic_id, difficulty[easy|medium|hard], text, options[], correct_answer_ref, source[human|ai_generated], created_at)
QuizAttempt (id, student_id, quiz_id, started_at, completed_at, score)
QuestionResponse (id, quiz_attempt_id, question_id, is_correct, time_taken_seconds, selected_answer_ref)
TopicMastery (id, student_id, topic_id, mastery_score, concept_understanding, practice_accuracy, revision_stability, last_updated_at, data_sufficiency[cold_start|partial|sufficient])
Prediction (id, student_id, subject_id, predicted_range_low, predicted_range_high, confidence[low|medium|high], target_assessment_id[nullable], generated_at, model_version)
RiskScore (id, student_id, score, tier[low|medium|high], generated_at, driver_factors[] -> {factor_name, direction, magnitude})
LearningPlan (id, student_id, week_start_date, generated_at, status[active|superseded])
LearningPlanItem (id, plan_id, type[resource|practice|quiz|revision], topic_id, priority_rank, estimated_minutes, status[pending|in_progress|completed|skipped])
Resource (id, topic_id, type[video|notes|article|practice_set], title, url_or_ref, difficulty_level)
Recommendation (id, student_id, resource_id, reason[driver_factor_ref], generated_at, accepted[bool, nullable])
Notification (id, user_id, type, payload, channel, sent_at, read_at[nullable])
InterventionLog (id, student_id, faculty_id, category[enum], note[text, nullable], logged_at)
AuditLog (id, actor_user_id, action, target_entity, target_id, timestamp, metadata)
```

### 4.2 Data Validation Rules (Ingestion)
- `SRS-DATA-01`: `AcademicRecord.value` must be within `[0, max_value]`; violating rows are rejected with row-level error, not silently clamped.
- `SRS-DATA-02`: `Attendance.percentage` must be within `[0,100]`.
- `SRS-DATA-03`: Duplicate `AcademicRecord` for the same (student, subject, record_type, period) on re-import shall be treated as an update (upsert), not a duplicate insert — last-imported wins, with prior value retained in an audit trail.
- `SRS-DATA-04`: `Topic.parent_topic_id` must not create a cycle (validated at taxonomy authoring time).
- `SRS-DATA-05`: `QuestionResponse.time_taken_seconds` must be > 0; a value of 0 or negative is treated as a data-quality error and excluded from mastery computation (not silently included).

### 4.3 Data Retention & Privacy
- `SRS-DATA-10`: Raw behavioral telemetry (`StudySession`, per-question timing) retained for a configurable rolling window (default: current + prior academic term); aggregated mastery/risk history retained longer for trend display.
- `SRS-DATA-11`: On student account deletion/graduation offboarding, personally identifying data is anonymized per institutional policy while aggregate/statistical data may be retained for model improvement (subject to consent terms — legal review flagged, see §7.2).

---

## 5. Detailed Functional Requirements

Each requirement traces to a PRD ID where applicable. Format: **Requirement — Trigger — Preconditions — Main flow — Postconditions — Error/edge handling.**

### 5.1 Data Ingestion (traces `PRD-FR-001`–`003`)

**`SRS-F-001` Manual Academic Record Entry**
- Trigger: Faculty/Admin (or student, for self-reported categories) submits a record via UI.
- Preconditions: Actor is authorized for the target student/section.
- Main flow: Validate against §4.2 rules → persist `AcademicRecord` → enqueue downstream recompute event (see §5.3).
- Postconditions: Record visible in student's academic history within the same session.
- Edge cases: Duplicate submission handled per `SRS-DATA-03`; partial-form submission blocked client-side and server-side (defense in depth).

**`SRS-F-002` Bulk Import (CSV)**
- Trigger: Admin uploads a CSV against a defined template.
- Main flow: Parse → validate row-by-row (§4.2) → stage valid rows → present a pre-commit summary (N valid, M invalid with reasons) → Admin confirms commit → persist → enqueue recompute events batched per affected student.
- Edge cases: File exceeds size/row limit → reject with clear message before parsing fully; encoding issues (non-UTF-8) → attempt detection, else reject with guidance.

**`SRS-F-003` Behavioral Telemetry Capture**
- Trigger: App-side events (session start/end, question attempt) sent to backend.
- Main flow: Client batches events locally and syncs opportunistically (not necessarily instantaneous) → server validates event schema and timestamp sanity (not in the future beyond clock skew tolerance, not implausibly long session) → persist.
- Edge cases: Implausible session duration (e.g., > 6 hours continuous) flagged as low-confidence data, excluded from mastery velocity calculations but retained for audit.

### 5.2 Topic Taxonomy Management (traces `ASM-B`)

**`SRS-F-010` Taxonomy Authoring**
- Trigger: Admin/Faculty creates or edits a `Topic` node.
- Main flow: CRUD with cycle validation (`SRS-DATA-04`) → on save, if topic has associated `Question`/`Resource`/`TopicMastery` records, edits to hierarchy trigger a re-link confirmation step (cannot silently orphan data).
- `SRS-F-011` **AI-Assisted Topic Suggestion**: Given an uploaded syllabus/document, GenAI proposes a candidate topic tree; Admin/Faculty must explicitly review and accept/edit before it becomes authoritative — system never auto-publishes AI-suggested taxonomy.

### 5.3 Performance Prediction (traces `PRD-FR-010`–`012`, `PRD-GOAL-01`)

**`SRS-F-020` Prediction Computation**
- Trigger: (a) Nightly scheduled batch, (b) immediate on a significant new data event (new `AcademicRecord` of type `internal`/`quiz`/`assignment`/`final`, or a material `TopicMastery` shift).
- Preconditions: Student has at least the minimum data threshold defined in §5.9, else cold-start path applies.
- Main flow: Assemble feature set (per TRD feature list) → run current production model → produce `predicted_range_low/high`, `confidence` → compute driver factors (top 3–5, signed, magnitude-quantified) → persist `Prediction` → if change from prior prediction exceeds threshold, enqueue notification event.
- Postconditions: Student/faculty-visible prediction always paired with driver factors (enforced by `SRS-CON-03`).
- Edge cases: Model unavailable/erroring → serve last known prediction with an explicit "stale as of [date]" label rather than failing the screen; never fabricate a number.

**`SRS-F-021` Prediction History/Trend**
- Requirement: System stores every generated `Prediction` (not just latest) to support trend visualization (predicted vs. actual over time) — required for `PRD-GOAL-01` measurement.

### 5.4 Academic Risk Scoring (traces `PRD-FR-020`–`022`, `PRD-GOAL-02`)

**`SRS-F-030` Risk Score Computation**
- Trigger: Same cadence as §5.3, and additionally whenever `Attendance` or `TopicMastery` changes materially.
- Main flow: Compute composite score from weighted sub-signals (recent trend, attendance, mastery distribution, assessment performance, consistency — exact weighting is TRD/model-owned) → map to tier via defined thresholds (configurable per institution, default Low <40, Medium 40–70, High >70) → compute driver factors → persist `RiskScore`.
- `SRS-F-031` **Tier-Change Notification**: If tier changes (e.g., Medium→High), trigger `SRS-F-060` notification flow with SLA per `PRD-FR-111` for faculty.
- `SRS-F-032` **Lead-Time Requirement**: Risk computation cadence and thresholds must be tuned such that, on average across the pilot, High-Risk flags occur ≥ 21 days before the next relevant assessment (`PRD-GOAL-02`) — this is a tunable-parameter requirement, not a hard runtime check, but must be measurable via `Prediction.target_assessment_id` timing.

### 5.5 Topic Mastery Estimation (traces `PRD-FR-030`–`032`)

**`SRS-F-040` Mastery Score Update**
- Trigger: New `QuestionResponse`, new `StudySession` on a topic, or scheduled decay recomputation (mastery should decay slightly over time without practice — "revision stability" sub-component).
- Main flow: Update `concept_understanding` (accuracy-weighted), `practice_accuracy` (recent-weighted accuracy), `revision_stability` (recency/frequency-weighted) → combine into `mastery_score` → classify Strong (≥75) / Moderate (45–74) / Weak (<45) (defaults; configurable) → persist.
- `SRS-F-041` **Weak Topic Prioritization**: When multiple topics are Weak, system ranks them by (a) contribution to overall risk score, (b) proximity to next assessment covering that topic, (c) foundational dependency (a prerequisite topic for other weak topics ranks higher) — traces `PRD-FR-032`.
- Edge cases: Topic with zero attempts is not classified as "Weak" — it is classified as "Not Yet Assessed," distinct state, to avoid mislabeling absence-of-data as failure (important trust/accuracy distinction).

### 5.6 Explainability (traces `PRD-FR-040`–`041`, `PRD-NFR-06`)

**`SRS-F-050` Driver Factor Generation**
- Requirement: For every `Prediction` and `RiskScore`, the system computes a structured `driver_factors[]` array (factor name, direction, magnitude) at model-computation time (not generated after the fact by an LLM guessing) — the LLM's role (see `SRS-F-051`) is to phrase these structured facts in plain language, not to invent them. This separation is a hard architectural requirement: **numeric attribution must come from the model/pipeline; GenAI only phrases it.**
- `SRS-F-051` **Plain-Language Rendering**: GenAI provider renders `driver_factors[]` into a natural-language explanation string, cached per (student, prediction/risk id) to avoid redundant calls.
- Edge cases: If GenAI phrasing fails/unavailable, fall back to a deterministic template (e.g., "{factor_name} is {direction} your {target} by approximately {magnitude}") — never leave a prediction unexplained (`SRS-CON-03`).

### 5.7 Personalized Learning Engine (traces `PRD-FR-050`–`053`)

**`SRS-F-060` Weekly Plan Generation**
- Trigger: Scheduled weekly, or on-demand regeneration trigger (`SRS-F-061`).
- Main flow: Pull ranked weak topics (§5.5) + upcoming assessment calendar + student's stated/observed available time → allocate `LearningPlanItem`s with `estimated_minutes` summing to available time budget, prioritized by rank → persist `LearningPlan` (mark prior plan `superseded`).
- `SRS-F-061` **Regeneration Triggers**: (a) new Weak topic detected, (b) ≥50% of current-week items overdue by end of week, (c) new assessment scheduled inside the current planning horizon.
- `SRS-F-062` **High-Performer Path**: If a student has no topic below the Moderate threshold, plan generation shifts to advanced/stretch content sourced from a separate "advanced" resource pool rather than defaulting to remedial content (traces `PRD-FR-053`).

**`SRS-F-063` Resource Recommendation**
- Requirement: Every `Recommendation` must reference the specific `driver_factor` or weak `Topic` that motivated it (traceable reason, not opaque suggestion) — supports both UI transparency and later efficacy analysis.

### 5.8 Adaptive Assessment (traces `PRD-FR-060`–`062`)

**`SRS-F-070` Adaptive Difficulty Adjustment**
- Main flow: On each `QuestionResponse`, if correct → next question difficulty steps up (bounded by max difficulty); if incorrect → next question difficulty steps down or holds, per a defined state-machine (exact transition table is TRD-owned, e.g., IRT-lite or rule-based).
- `SRS-F-071` **Failure Circuit-Breaker**: If a student answers incorrectly on a given topic ≥ N consecutive times (default N=3, configurable), system halts pure difficulty-testing and injects a concept-explanation step (GenAI or static resource) before resuming assessment — traces `PRD-FR-062`, prevents a frustrating failure spiral.
- `SRS-F-072` **AI Question Generation**: Requested questions specify subject, topic, difficulty, and (optionally) a known misconception pattern; generated questions are validated for structural completeness (has correct answer, has ≥2 distinct plausible options) before being served — malformed generations are discarded and regenerated once, then fall back to the human-authored question bank.

### 5.9 Cold-Start Handling (traces `PRD-FR-120`)

**`SRS-F-080` Minimum Data Threshold**
- Definition: A student is "cold-start" if they have fewer than a configurable minimum count of graded data points per subject (default: 3) AND less than a configurable minimum diagnostic-quiz coverage of the topic tree (default: 50% of top-level topics attempted).
- Main flow: Cold-start students are prompted to take a diagnostic quiz per subject on onboarding; until threshold is met, all predictions are labeled `confidence=low` with explicit "Preliminary — based on limited data" copy (UI-owned string, but the state is SRS-defined).

### 5.10 AI Study Assistant (traces `PRD-FR-070`–`072`)

**`SRS-F-090` Conversational Query Handling**
- Main flow: Student query → system determines if profile context is relevant (e.g., "why did I get this wrong" requires the specific `QuestionResponse`; "explain Bayes theorem" does not) → assembles minimal necessary context → calls `GenAIProvider.assistantRespond()` → returns response.
- `SRS-F-091` **Non-Fabrication Guard**: Assistant must not assert specific academic claims about the student (e.g., "you're failing Math") that are not backed by an actual `Prediction`/`RiskScore`/`TopicMastery` record; if asked something requiring data the system doesn't have, it states the limitation rather than guessing — traces `PRD-FR-072`.

### 5.11 Continuous Loop & Recompute (traces `PRD-FR-080`–`081`, `PRD-DEFER` n/a)

**`SRS-F-100` Event-Driven Recompute**
- Requirement: The following events must trigger a recompute cascade (mastery → risk → prediction → plan, in that dependency order, debounced to avoid thrashing on rapid successive events): new `AcademicRecord`, new `QuizAttempt` completion, `Attendance` update, manual `InterventionLog` entry (logged but does not itself alter scores — see edge case below).
- Edge case: An `InterventionLog` entry alone (e.g., "met with student") does NOT directly change risk/mastery scores — only observed behavioral/academic data does. This is a deliberate requirement to avoid the system being gamed by logging interventions without real follow-through.

### 5.12 Faculty Capabilities (traces `PRD-FR-090`–`094`)

**`SRS-F-110` Class Risk Overview** — aggregate counts by tier, week-over-week delta, computed from current `RiskScore` records scoped to faculty's authorized sections.

**`SRS-F-111` At-Risk Ranked List** — sortable by `RiskScore.score` and computed `days_to_next_assessment`; each row surfaces top driver factor inline (no click-through required for the headline reason).

**`SRS-F-112` Topic Difficulty Aggregation** — for a faculty's section(s), aggregate `TopicMastery` distribution per topic to surface systemically weak topics (e.g., >40% of class below Moderate on a topic) — distinct from individual weak-topic detection.

**`SRS-F-113` Intervention Logging** (per `ASM-D`) — structured `category` enum (e.g., `met_with_student`, `extended_deadline`, `referred_to_counseling`, `assigned_extra_practice`, `other`) + optional free-text note; entries are immutable once saved (append-only; corrections are new entries, not edits) for audit integrity.

**`SRS-F-114` Access Scoping** — Faculty queries are always implicitly filtered to sections they are assigned to; attempting to access an out-of-scope student returns an authorization error, not a "not found" (explicit denial for audit clarity, but see §6 security note on information leakage — TRD to resolve whether 403 vs 404 is safer).

### 5.13 Admin/Institution Capabilities (traces `PRD-FR-100`–`102`)

**`SRS-F-120` Cohort Analytics** — aggregated, time-windowed risk-tier distribution and trend, scoped to department/cohort.

**`SRS-F-121` Systemic Topic Aggregation** — cross-section rollup of `SRS-F-112` at department level.

**`SRS-F-122` Report Export** — generate a point-in-time export (PDF/CSV) of a given analytics view; export generation is asynchronous for large cohorts with a notification on completion (avoid blocking UI on large exports).

### 5.14 Notifications (traces `PRD-FR-110`–`112`)

**`SRS-F-130` Notification Triggers** — risk tier change, mastery drop beyond threshold (default: -10 points within 7 days), plan reminder (configurable time), positive milestone (mastery gain, streak), faculty new-high-risk alert (SLA: next business day batch, or real-time — configurable per institution).

**`SRS-F-131` Notification Preferences** — users may adjust frequency/channel for non-critical categories; risk-tier-change and faculty high-risk alerts are not fully disableable (only channel is configurable), per `PRD-FR-112`.

### 5.15 Identity, Access & Audit

**`SRS-F-140` Role-Based Access Control** — three baseline roles (Student, Faculty, Admin) with the scoping rules described above; role assignment is Admin-managed.

**`SRS-F-141` Audit Logging** — every read of another user's detailed academic data (faculty viewing a student, admin viewing a report) is logged in `AuditLog` with actor, target, timestamp — traces `PRD-NFR-09`.

**`SRS-F-142` Flag-as-Wrong Loop** (traces `PRD-TRUST-05`) — student-initiated flag on a `Prediction`/`RiskScore` creates a review record; does not auto-modify the score, but is queryable for model-quality review and displayed back to the student as "Feedback received."

---

## 6. Non-Functional Requirements (Detailed)

### 6.1 Performance
- `SRS-NFR-P01`: Dashboard API responses (read-only, cached-eligible) P95 ≤ 500ms server-side.
- `SRS-NFR-P02`: Nightly batch recompute for full active cohort completes within the defined maintenance window (institution-configurable, default 4 hours) — sized against `PRD-NFR-02` scale target.
- `SRS-NFR-P03`: Adaptive quiz next-question latency (including any AI generation fallback to bank) ≤ 2s P95.

### 6.2 Reliability & Availability
- `SRS-NFR-R01`: Core read paths (dashboard, prediction, risk) degrade to last-known-good cached data rather than erroring on downstream dependency failure.
- `SRS-NFR-R02`: GenAI provider outage must not block: viewing existing predictions/risk, viewing existing plans, viewing static resources. It may degrade: new explanation phrasing (fallback template), new AI-generated questions (fallback to bank), assistant (explicit "temporarily unavailable" state).

### 6.3 Security
- `SRS-NFR-S01`: Authentication required for all endpoints except public health-check; role-based authorization enforced server-side on every request (never client-trust-only).
- `SRS-NFR-S02`: PII fields (name, email) encrypted at rest; academic performance data access-logged per `SRS-F-141`.
- `SRS-NFR-S03`: Rate limiting on GenAI-backed endpoints (assistant, question generation) to bound cost/abuse exposure.

### 6.4 Usability
- `SRS-NFR-U01`: All risk/weakness language reviewed against `PRD-TRUST-02` (constructive, non-punitive framing) — a content-style gate on any user-facing string, not just a design suggestion.

### 6.5 Maintainability
- `SRS-NFR-M01`: `model_version` stored on every `Prediction`/`RiskScore` record to allow retrospective analysis when models are updated.
- `SRS-NFR-M02`: Configurable thresholds (risk tier cutoffs, mastery cutoffs, cold-start minimums, notification thresholds) must be externalized (config, not hardcoded) to support institution-specific tuning without code changes.

### 6.6 Fairness & Monitoring
- `SRS-NFR-F01`: Where demographic attributes are available and consented, aggregate risk/prediction distributions must be reviewable by subgroup by Admin (monitoring capability, not an automated correction) — traces `PRD-NFR-07`.

---

## 7. Other Requirements

### 7.1 Legal/Compliance (flagged for real legal review — not resolved at SRS level)
- `SRS-LEGAL-01`: Data handling must align with applicable institutional/regional student-data-privacy regulation (e.g., FERPA-equivalent or local equivalent) — **explicitly flagged as needing counsel review before production launch**, not something this SRS can certify.

### 7.2 Consent
- `SRS-CONSENT-01`: Optional data categories (learning preferences, self-assessment, demographic attributes for fairness monitoring) require explicit opt-in, separate from core account consent.

### 7.3 Internationalization
- `SRS-I18N-01`: All user-facing strings externalized to resource files even though only one language ships in v1 (supports `PRD-NFR-10` without committing scope now).

---

## Appendix A — PRD → SRS Traceability (excerpt)

| PRD ID | SRS ID(s) |
|---|---|
| PRD-FR-010–012 | SRS-F-020, SRS-F-021 |
| PRD-FR-020–022 | SRS-F-030, SRS-F-031, SRS-F-032 |
| PRD-FR-030–032 | SRS-F-040, SRS-F-041 |
| PRD-FR-040–041 | SRS-F-050, SRS-F-051 |
| PRD-FR-050–053 | SRS-F-060–063 |
| PRD-FR-060–062 | SRS-F-070–072 |
| PRD-FR-070–072 | SRS-F-090, SRS-F-091 |
| PRD-FR-090–094 | SRS-F-110–114 |
| PRD-FR-100–102 | SRS-F-120–122 |
| PRD-FR-110–112 | SRS-F-130, SRS-F-131 |
| PRD-NFR-06 | SRS-CON-03, SRS-F-050, SRS-F-051 |
| PRD-TRUST-05 | SRS-F-142 |

*(Full matrix to be expanded in the Test Plan, mapping SRS IDs → test case IDs.)*

---

## Appendix B — Open Items for Your Decision

1. Confirm default numeric thresholds in §5.4/§5.5/§5.9 (risk tiers 40/70, mastery 45/75, cold-start minimum 3 records / 50% topic coverage) — these are placeholders based on reasonable pedagogy assumptions, not derived from your actual institution's grading scale.
2. Confirm whether faculty access-denial should be 403 (explicit) or 404 (obscured) — noted in `SRS-F-114`, has security-vs-usability tradeoffs.
3. Legal/compliance review (`SRS-LEGAL-01`) is out of this document's authority — flagging so it isn't silently skipped.

---

*End of SRS v1.0 draft. Next: FSD (screen-by-screen behavior and UI state specification), then TRD (architecture/stack/algorithm decisions), System Design, and Test Plan — each will cite SRS IDs directly.*
