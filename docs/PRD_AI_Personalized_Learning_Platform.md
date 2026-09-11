# Product Requirements Document (PRD)
## AI-Driven Personalized Learning and Academic Performance Prediction System (Codename: **LearnSense**)

| Field | Value |
|---|---|
| Document Type | Product Requirements Document (PRD) |
| Version | 1.0 (Draft for Review) |
| Status | Draft — Awaiting depth/format sign-off |
| Owner | Product Team |
| Related Docs | SRS, FSD, TRD, System Design, Test Plan (to follow) |
| Classification | Internal / Academic Project |

---

## 0. How to Read This Document

This PRD answers **WHAT** the product must do and **WHY**, from a business/user-value lens. It intentionally avoids implementation detail (API contracts, schema, algorithms) — those live in the SRS/FSD/TRD/System Design docs. Every requirement below carries a unique ID (e.g., `PRD-FR-014`) so it can be traced forward into the SRS and test cases, and every user-facing capability is tied to a measurable success metric.

---

## 1. Executive Summary

LearnSense is a mobile-first, AI-driven platform that builds a continuously-updating academic profile for every student, predicts near-term academic outcomes, flags at-risk students early, diagnoses *why* a student is at risk down to the topic/concept level, and closes the loop by generating and adapting personalized interventions (study plans, adaptive quizzes, curated resources, and a conversational AI tutor). Faculty and institutions get aggregated, actionable visibility into class- and cohort-level risk without needing to manually track every student.

The product differentiates itself from generic “EdTech dashboards” through:
1. **Prediction with explanation** (not just a number, but the drivers behind it).
2. **A closed intervention loop** — prediction → diagnosis → personalized action → re-measurement → model update.
3. **Topic-level granularity** rather than subject-level generalizations.
4. **Adaptive difficulty** tied to a live topic-mastery model, not static content.

---

## 2. Problem Statement

### 2.1 Current State
Educational delivery today is largely **one-size-fits-all**: identical content, identical pace, identical assessment schedule for every learner in a cohort, regardless of individual ability, prior knowledge, or study behavior.

### 2.2 Pain Points (by stakeholder)

**Students**
- `PRD-PROB-01`: Discover weaknesses only *after* an exam or graded assignment — too late to act.
- `PRD-PROB-02`: No visibility into *which specific concept* (not just "which subject") is weak.
- `PRD-PROB-03`: Generic study resources not matched to their actual skill gaps or pace.
- `PRD-PROB-04`: No forward-looking signal ("where am I headed if nothing changes?").

**Faculty**
- `PRD-PROB-05`: Cannot continuously monitor 40–200+ students individually.
- `PRD-PROB-06`: Reactive rather than proactive — intervention usually starts after visible failure.
- `PRD-PROB-07`: No structured, ranked view of which students/topics need attention this week.

**Institution**
- `PRD-PROB-08`: No early-warning system for cohort-level academic risk (retention, pass-rate impact).
- `PRD-PROB-09`: Limited data-driven insight into which topics/courses are systemically difficult across cohorts.

### 2.3 Why Now
- Historical academic + behavioral data (LMS logs, quiz attempts, attendance systems) already exists in most institutions but is siloed and unused for prediction.
- Mature, cheap ML tooling (gradient boosting, lightweight NN) makes performance prediction tractable without large infra.
- LLM APIs make personalized explanation, question generation, and conversational tutoring newly affordable at scale.

---

## 3. Goals & Non-Goals

### 3.1 Product Goals
| ID | Goal | Primary Metric |
|---|---|---|
| `PRD-GOAL-01` | Predict subject-wise and overall academic performance before final exams | Prediction MAE ≤ 8 percentage points by pilot end |
| `PRD-GOAL-02` | Identify at-risk students early enough for meaningful intervention | ≥ 3 weeks lead time before assessment, avg. |
| `PRD-GOAL-03` | Localize weakness to topic/concept level, not just subject level | ≥ 90% of flagged weaknesses map to a specific topic node |
| `PRD-GOAL-04` | Demonstrably improve outcomes via personalized intervention | ≥ 10% relative improvement in post-intervention topic mastery vs. control |
| `PRD-GOAL-05` | Reduce faculty triage effort | ≥ 50% reduction in time faculty spend identifying at-risk students (self-reported) |
| `PRD-GOAL-06` | Sustain engagement with personalized plans | ≥ 60% weekly plan-completion rate among active students |

### 3.2 Non-Goals (Out of Scope for v1)
- `PRD-NONGOAL-01`: Replacing faculty-led instruction or grading.
- `PRD-NONGOAL-02`: Full LMS/course-authoring functionality (LearnSense consumes/augments, does not replace, an LMS).
- `PRD-NONGOAL-03`: Proctored/high-stakes exam delivery.
- `PRD-NONGOAL-04`: Multi-institution federated benchmarking (single-institution deployment only in v1).
- `PRD-NONGOAL-05`: Parent/guardian-facing portal (deferred to v2 — see §12).

---

## 4. Target Users & Personas

### 4.1 Persona: **Rahul — The At-Risk Undergraduate**
- 2nd-year engineering student, moderate attendance (78%), inconsistent study habits, strong in some topics (Matrices 84%) but critically weak in others (Probability 44%).
- Needs: early, specific, non-judgmental signal of what to fix and how, in small daily chunks he can actually complete.
- Frustration trigger: generic advice ("study more") with no specificity.

### 4.2 Persona: **Dr. Iyer — The Overloaded Faculty Member**
- Teaches 3 sections, ~180 students total. Cannot manually review every gradebook weekly.
- Needs: a ranked, exception-based view ("these 7 students need attention, here's why") rather than raw data dumps.
- Frustration trigger: dashboards that show data but not "so what do I do."

### 4.3 Persona: **Ms. Fernandes — Academic Administrator**
- Owns retention/pass-rate KPIs at department level.
- Needs: cohort trends, systemic weak topics across sections, early-warning counts by risk tier.
- Frustration trigger: only finding out about a retention problem at semester-end.

### 4.4 Secondary Persona: **The Motivated High-Achiever**
- Already scoring well; risk of disengagement if the system only talks about "weaknesses."
- Needs: stretch/advanced content recommendations, not remedial-only framing.

---

## 5. User Journeys (Narrative, not UI spec)

### 5.1 Journey — Student Onboarding to First Insight
1. Student registers, links/imports academic records (marks, attendance) — manually or via institutional data import.
2. System computes an initial baseline profile (cold-start; see §9.4 for cold-start handling).
3. Student sees Dashboard with an initial "Academic Health" score and a plain-language summary of top 1–2 risk drivers.
4. Student is prompted to take a short diagnostic/adaptive quiz per subject to accelerate topic-mastery estimation.

### 5.2 Journey — Weekly Personalized Loop
1. New data (quiz attempts, study session logs, assignment marks) accrues.
2. System recomputes performance prediction, risk score, and topic mastery.
3. If risk score crosses a threshold or a topic mastery drops meaningfully, student receives a notification with a specific, explainable trigger.
4. Personalized study plan is regenerated for the week, prioritized by (a) risk contribution, (b) proximity to next assessment, (c) available study time.
5. Student completes plan items (resources, practice, adaptive quiz).
6. New assessment data feeds back in; prediction updates; improvement (or lack thereof) is visible on a trend chart.

### 5.3 Journey — Faculty Weekly Triage
1. Faculty opens Faculty Dashboard; sees class-level risk distribution (Low/Medium/High counts) and week-over-week delta.
2. Faculty drills into the High-Risk list, sorted by risk score and "days to next assessment."
3. Faculty reviews AI-generated per-student insight summary (driver factors, not raw logs).
4. Faculty can log/annotate an intervention (e.g., "met with student," "extended deadline") — this becomes part of the student's record and a future feature for measuring intervention efficacy.

### 5.4 Journey — Institution-Level Review
1. Admin views department/cohort dashboard: risk-tier distribution, trend over the term, top systemic weak topics across sections.
2. Admin exports a report for departmental review meetings.

---

## 6. Functional Requirements (Product-Level)

Each requirement is stated as a capability with acceptance criteria. Implementation detail is deferred to FSD/SRS.

### 6.1 Academic Data Ingestion
- `PRD-FR-001` System shall ingest academic records: previous semester marks, internal exam marks, assignment marks, lab marks, quiz scores, attendance, per-topic scores.
  - *Acceptance*: Supports both manual entry and bulk import (CSV/institutional feed); rejects/report malformed rows rather than silently dropping them.
- `PRD-FR-002` System shall capture learning-behavior telemetry: study session start/end, time-on-topic, question attempts, accuracy, revision frequency.
  - *Acceptance*: Telemetry events are timestamped and attributable to a (student, subject, topic) tuple.
- `PRD-FR-003` System shall capture assessment-level detail: per-question correctness, difficulty tag, time taken, associated topic.

### 6.2 Performance Prediction
- `PRD-FR-010` System shall predict subject-wise and overall predicted score, expressed as a range (not false-precision point estimate) with a confidence indicator.
  - *Acceptance*: Every prediction displayed to a user includes a range and a qualitative confidence label (e.g., Low/Medium/High confidence, tied to data sufficiency).
- `PRD-FR-011` System shall recompute predictions on a defined cadence (e.g., nightly batch) and immediately upon a significant new data event (e.g., new exam score entered).
- `PRD-FR-012` System shall display prediction trend over time (historical predicted vs. actual, where actual is known).

### 6.3 Academic Risk Detection
- `PRD-FR-020` System shall compute an Academic Risk Score (0–100) per student, mapped to Low/Medium/High tiers.
- `PRD-FR-021` System shall surface the top 3–5 contributing factors for a given risk score, each labeled with direction (↑/↓) and approximate magnitude of contribution.
- `PRD-FR-022` System shall trigger a notification when risk tier changes (e.g., Medium → High) or when a single dominant factor crosses a defined threshold.

### 6.4 Weak Topic / Concept Detection
- `PRD-FR-030` System shall maintain a per-topic mastery score for every (student, topic) pair within a subject's topic taxonomy.
- `PRD-FR-031` System shall classify each topic as Strong / Moderate / Weak using defined thresholds, visible to the student in plain language (not just numbers).
- `PRD-FR-032` System shall identify the single most-impactful weak topic to prioritize, not just list all weak topics unranked.

### 6.5 Explainability
- `PRD-FR-040` Every prediction and risk score shown to an end user shall be accompanied by a human-readable explanation of the top drivers (positive and negative).
- `PRD-FR-041` Explanations shall avoid raw model internals (e.g., no "SHAP value 0.42") and instead use plain-language, quantified statements (e.g., "Quiz performance is pulling your score down by ~12%").

### 6.6 Personalized Learning Engine
- `PRD-FR-050` System shall generate a personalized weekly study plan per student, factoring in: weak topics, risk priority, upcoming assessment dates, and stated/observed available study time.
- `PRD-FR-051` System shall regenerate the plan when underlying inputs materially change (new weak topic detected, plan items overdue, new exam scheduled).
- `PRD-FR-052` System shall recommend learning resources (video/notes/practice sets) mapped to specific weak topics, not generic subject-level resources.
- `PRD-FR-053` For high-performing students with no significant weak topics, system shall recommend advanced/stretch content rather than defaulting to remedial content.

### 6.7 Adaptive Assessment
- `PRD-FR-060` System shall serve adaptive quizzes that adjust question difficulty in near-real-time based on the student's answer stream and current topic mastery.
- `PRD-FR-061` System shall be able to generate new questions (via generative AI) targeted to a specific topic, difficulty level, and the student's known misconception pattern where available.
- `PRD-FR-062` System shall cap the never-succeeding loop: if a student fails a topic repeatedly below a threshold, system shall step down difficulty and inject a concept explanation rather than continuing to test.

### 6.8 AI Study Assistant
- `PRD-FR-070` System shall provide a conversational assistant that can answer subject/topic questions, explain wrong answers, and generate practice questions on request.
- `PRD-FR-071` Assistant responses shall be able to draw on the requesting student's own learning profile (weak topics, recent mistakes) when relevant to personalize answers.
- `PRD-FR-072` Assistant shall clearly indicate when it does not have enough information rather than fabricating academic claims about the student.

### 6.9 Progress Tracking & Continuous Loop
- `PRD-FR-080` System shall show before/after comparisons for any completed intervention (e.g., topic mastery before plan vs. after plan completion).
- `PRD-FR-081` System shall update the student's profile and downstream predictions automatically as new data arrives — no manual "recompute" step required by the user.

### 6.10 Faculty Capabilities
- `PRD-FR-090` Faculty shall see class/section-level risk-tier distribution and week-over-week change.
- `PRD-FR-091` Faculty shall see a ranked at-risk student list with driver summaries, sortable by risk score and days-to-next-assessment.
- `PRD-FR-092` Faculty shall see aggregated "most difficult topics" across their class(es).
- `PRD-FR-093` Faculty shall be able to log a free-text intervention note against a student, timestamped and attributable.
- `PRD-FR-094` Faculty access shall be scoped to only the students/sections they are authorized to teach.

### 6.11 Institution/Admin Capabilities
- `PRD-FR-100` Admin shall see department/cohort-level risk distribution and trend over the term.
- `PRD-FR-101` Admin shall see systemic weak-topic aggregation across sections/courses.
- `PRD-FR-102` Admin shall be able to export a summary report (e.g., PDF/CSV) for a given time window.

### 6.12 Notifications
- `PRD-FR-110` System shall notify students of: risk-tier changes, mastery drops beyond threshold, plan reminders, and positive milestones (mastery gains, streaks).
- `PRD-FR-111` System shall notify faculty of newly-High-Risk students in their class within a defined SLA (e.g., next business day).
- `PRD-FR-112` Users shall be able to configure notification frequency/channels (in-app, push, email) within reasonable bounds — not fully disable risk-critical alerts.

---

## 7. Non-Functional Requirements (Product-Level)

| ID | Category | Requirement |
|---|---|---|
| `PRD-NFR-01` | Performance | Dashboard initial load ≤ 2s on average mobile network conditions (P75); prediction recompute batch completes within nightly maintenance window. |
| `PRD-NFR-02` | Scalability | Architecture shall support institution scale of at least 10,000 concurrent student profiles without redesign. |
| `PRD-NFR-03` | Reliability | Core prediction/risk pipeline availability ≥ 99.5% during academic term. |
| `PRD-NFR-04` | Privacy | Student academic data visible only to the student and explicitly authorized faculty/admin roles (see §6.10, §8). |
| `PRD-NFR-05` | Security | All data in transit and at rest encrypted; authentication required for all API access. |
| `PRD-NFR-06` | Explainability | No prediction or risk score is shown without an accompanying explanation (hard product rule, not optional). |
| `PRD-NFR-07` | Fairness | Risk/weakness classification shall be monitored for systematic bias across demographic subgroups where such data is available and consented. |
| `PRD-NFR-08` | Accessibility | Mobile app shall meet WCAG 2.1 AA-equivalent accessibility guidelines where applicable to a mobile context. |
| `PRD-NFR-09` | Auditability | All risk-score changes and faculty/admin data access shall be logged for audit. |
| `PRD-NFR-10` | Localization (stretch) | UI text externalized to support future localization; not required in v1 language set. |

---

## 8. Trust, Privacy & Ethical Considerations

- `PRD-TRUST-01` **Data minimization**: Only data with a clear product purpose is collected; optional data (learning preferences, goals) is explicitly opt-in.
- `PRD-TRUST-02` **No punitive framing**: Risk scores and weak-topic labels shall be framed constructively to students (diagnostic, not judgmental) — this is a product tone requirement, not just a UX nicety, because framing affects engagement and wellbeing.
- `PRD-TRUST-03` **Faculty visibility boundary**: Faculty see risk tiers and driver summaries, not raw behavioral telemetry (e.g., not second-by-second app usage) — reduces surveillance concerns while preserving actionability.
- `PRD-TRUST-04` **Model transparency to institution**: Institution admins shall have access to aggregate model performance metrics (accuracy, known limitations) — not a black box handed over uncritically.
- `PRD-TRUST-05` **Right to explanation & correction**: Students shall be able to flag a prediction/risk score as seemingly wrong, which is logged for model review (not necessarily auto-corrected).
- `PRD-TRUST-06` **Cold-start honesty**: When a student has insufficient data, system shall say so explicitly rather than presenting a low-confidence prediction as if it were reliable.

---

## 9. Assumptions, Constraints & Dependencies

### 9.1 Assumptions
- `PRD-ASM-01`: Institution can provide (or students can self-report) historical academic records in a structured or semi-structured format.
- `PRD-ASM-02`: Students have reasonably consistent mobile connectivity for periodic sync (offline-first not required for v1).
- `PRD-ASM-03`: A defined topic taxonomy per subject exists or can be authored (this is itself a content dependency — see §9.3).

### 9.2 Constraints
- `PRD-CON-01`: Single-institution pilot scope for v1; multi-tenant institution support is a v2 concern.
- `PRD-CON-02`: Academic term timelines constrain data volume early in a cohort's lifecycle (cold-start problem, addressed in §9.4).
- `PRD-CON-03`: Budget/latency constraints on generative AI usage (quiz generation, assistant) — must degrade gracefully if AI provider has an outage (see §9.5).

### 9.3 Dependencies
- `PRD-DEP-01`: Topic taxonomy and mapping of questions/resources to topics (content dependency, likely requires faculty/SME input).
- `PRD-DEP-02`: Institutional data source(s) for attendance/marks, or a manual-entry fallback.
- `PRD-DEP-03`: Third-party LLM API for generative components (explanations, question generation, assistant).

### 9.4 Cold-Start Handling (Product Requirement)
- `PRD-FR-120`: For a student with insufficient historical data, system shall rely more heavily on an initial diagnostic quiz and shall clearly label predictions as "Preliminary — based on limited data" until a minimum data threshold is met.

### 9.5 Graceful Degradation
- `PRD-FR-121`: If the generative AI provider is unavailable, system shall continue to serve ML-based predictions/risk scores and fall back to a static (non-generated) explanation template rather than failing the whole screen.

---

## 10. Success Metrics & Instrumentation

| Metric | Definition | Target (Pilot) |
|---|---|---|
| Prediction accuracy | MAE between predicted and actual subject score | ≤ 8 pts |
| Early-warning lead time | Days between High-Risk flag and next assessment | ≥ 21 days avg. |
| Plan completion rate | % of weekly plan items marked complete | ≥ 60% |
| Mastery uplift | Δ topic mastery pre/post intervention (treatment vs. control) | ≥ +10% relative |
| Faculty triage time | Self-reported minutes/week spent identifying at-risk students | ≥ 50% reduction |
| Notification-to-action rate | % of risk notifications followed by a plan-item start within 48h | ≥ 40% |
| Student trust signal | % of predictions NOT flagged as "seems wrong" | ≥ 90% |
| Retention proxy | Cohort-level pass-rate delta vs. prior term (institution-level, longer horizon) | Directionally positive |

Instrumentation implication: every event referenced above (plan item completion, notification click-through, "flag as wrong") must be logged as a first-class trackable event — carried forward into SRS/TRD as explicit event schemas.

---

## 11. Release Phasing (Product View)

### Phase 1 — MVP (Core Loop, Single Cohort Pilot)
- Data ingestion (manual + basic import), performance prediction, risk scoring with explanation, topic mastery (subject-level taxonomy, manually authored), basic personalized study plan, student dashboard, faculty dashboard (risk list only).

### Phase 2 — Adaptive & Generative Layer
- Adaptive quiz engine, AI-generated questions, AI study assistant, resource recommendation engine, notifications.

### Phase 3 — Institutional Scale & Depth
- Admin/institution dashboard, cross-section topic-difficulty aggregation, intervention logging & efficacy measurement, bias/fairness monitoring dashboard, report export.

### Deferred (v2+)
- `PRD-DEFER-01`: Parent/guardian portal.
- `PRD-DEFER-02`: Multi-institution benchmarking.
- `PRD-DEFER-03`: Offline-first mobile mode.
- `PRD-DEFER-04`: Full LMS content authoring.

---

## 12. Risks (Product-Level)

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Cold-start data insufficiency skews early predictions | High | High | Diagnostic quiz + explicit low-confidence labeling (§9.4) |
| Faculty/students distrust "black box" scores | High | Medium | Mandatory explanations (NFR-06), flag-as-wrong loop (TRUST-05) |
| Over-surveillance perception from behavioral tracking | Medium | Medium | Faculty visibility boundary (TRUST-03), data minimization (TRUST-01) |
| Generative AI cost/latency at scale | Medium | Medium | Graceful degradation (9.5), caching of generated explanations where safe |
| Topic taxonomy authoring bottleneck (content dependency) | High | Medium | Start with 1–2 pilot subjects; phase taxonomy expansion |
| Model bias across subgroups | High | Low-Medium | Fairness monitoring (NFR-07), institution-level transparency (TRUST-04) |

---

## 13. Open Questions (Need Your Input Before Downstream Docs)

1. **Pilot scope**: Single course/subject pilot, or full-semester multi-subject from day one?
2. **Data source**: Is there a real institutional LMS/SIS to integrate with, or should we design assuming manual/CSV entry as the primary path for now?
3. **Topic taxonomy ownership**: Will faculty/SMEs author the topic hierarchy, or should the system propose one via AI-assisted extraction from syllabi?
4. **Generative AI provider preference**: Any constraint (e.g., must use a specific API/vendor) relevant to cost modeling in the TRD?
5. **Faculty intervention logging**: Should this be structured (dropdown categories) or free text in v1?
6. **Depth check (for this doc specifically)**: Is this the right altitude — product-level "what/why" with IDs for traceability — or did you want this doc to *also* include schema/API-level detail (which I'd normally push to SRS/TRD)?

---

*End of PRD v1.0 draft. Once you confirm this depth and structure work, I'll produce the SRS (detailed functional + data requirements), FSD (screen-by-screen behavior), TRD (tech stack, architecture decisions, algorithms), System Design (component diagrams, data flow, scaling), and Test Plan (test strategy, case-level detail) at matching depth, each cross-referencing these PRD IDs.*
