# Technical Requirements Document (TRD)
## AI-Driven Personalized Learning and Academic Performance Prediction System ("LearnSense")

| Field | Value |
|---|---|
| Document Type | Technical Requirements Document |
| Version | 1.0 (Draft) |
| Traces From | SRS v1.0, FSD v1.0 |
| Traces To | System Design, Test Plan |
| Purpose | Concrete technology, algorithm, API, and integration decisions |

---

## 1. Technology Stack & Rationale

| Layer | Choice | Rationale |
|---|---|---|
| Mobile Client | Flutter (Dart) | Single codebase for iOS/Android; strong charting ecosystem (fl_chart) needed for prediction bands, mastery sparklines (FSD A.5, A.6, A.12); acceptable performance for the app's data-viz-heavy, not-graphics-intensive profile. |
| Faculty/Admin Web | React + TypeScript | Faster iteration for tabular/dashboard-heavy screens (B.*, C.*); reuses backend API identically to mobile, no separate backend needed. |
| Backend API | Python + FastAPI | Async-friendly, strong typing via Pydantic (maps cleanly to SRS §4.1 entity validation), and shares language with the ML stack — avoids a serialization/handoff layer between API and model-serving code. |
| Primary Datastore | PostgreSQL | Relational integrity needed for entities with strong referential structure (Student↔AcademicRecord↔Topic↔Mastery); supports JSONB for flexible fields like `driver_factors[]` without a second database. |
| Telemetry/Event Store | Same Postgres initially (partitioned `StudySession`/`QuestionResponse` tables by month); revisit a time-series/columnar store (e.g., ClickHouse) only if pilot-scale telemetry volume (`SRS-NFR-P02`) exceeds Postgres partition performance — **explicit non-decision for v1**, avoids premature infra complexity. |
| Cache | Redis | Prediction/dashboard read caching (`SRS-NFR-P01`), GenAI explanation caching (`SRS-F-051`), rate-limiting counters (`SRS-NFR-S03`). |
| Task Queue | Celery + Redis broker (or equivalent) | Nightly batch recompute (`SRS-F-020`), async report export (`SRS-F-122`), event-driven recompute cascade (`SRS-F-100`). |
| ML Model Serving | In-process (FastAPI) for v1 scale; abstracted via a `PredictionModel` interface so it can move to a dedicated serving layer (e.g., a model server) without changing calling code if scale demands it later. |
| GenAI Provider | Abstracted `GenAIProvider` interface (per `SRS-IF-02`/`ASM-C`); default implementation targets a general-purpose LLM API — **vendor left configurable**, not hardcoded, per your earlier open question with no stated constraint. |
| Auth | JWT-based session tokens, short-lived access + refresh token pair; role claims embedded and re-validated server-side per request (never trust client-held role). |
| Infra/Hosting | Containerized services (Docker), orchestration deferred to System Design doc (Kubernetes vs. simpler managed-container service depends on pilot scale — flagged there, not decided here). |

---

## 2. High-Level System Architecture (Narrative — diagrams in System Design doc)

```
[Flutter App] ─┐
[React Web]   ─┼─► [API Gateway / FastAPI] ─► [Auth Middleware] ─► [Route Handlers]
                                                        │
                        ┌───────────────────────────────┼────────────────────────────┐
                        ▼                                ▼                            ▼
                [Ingestion Service]           [Analytics/Prediction Service]   [Personalization Service]
                        │                                │                            │
                        ▼                                ▼                            ▼
                  [PostgreSQL] ◄────────────────► [Redis Cache] ◄──────────► [Celery Workers]
                                                        │
                                                        ▼
                                          [GenAIProvider Interface] ──► [LLM API (external)]
```

Each "Service" above is a logical module within the FastAPI monolith for v1 (not separate microservices) — deliberate choice: SRS scale target (`PRD-NFR-02`, 10k concurrent profiles) does not require microservice overhead yet, and a monolith is faster to build/test/reason-about for a pilot. Module boundaries are still enforced in code (separate packages, no cross-module DB access bypassing the service layer) so a future split to microservices is a refactor, not a rewrite.

---

## 3. Data Model (Physical Notes on Top of SRS §4.1)

- All entity tables carry `created_at`/`updated_at`; mutable-looking entities that need audit history (e.g., `AcademicRecord` corrections) use an append-only `*_history` shadow table rather than in-place overwrite, to satisfy `SRS-DATA-03`'s "prior value retained" requirement.
- `RiskScore.driver_factors` and `Prediction` driver data stored as JSONB: `[{"factor": "quiz_performance", "direction": "down", "magnitude_pct": 12}, ...]` — queryable via Postgres JSONB operators for aggregate driver-frequency analysis later (useful for Admin fairness/monitoring, `SRS-NFR-F01`).
- Indexes: composite index on `(student_id, subject_id, recorded_at)` for `AcademicRecord`; `(student_id, topic_id)` unique constraint on `TopicMastery` (one live row per pair, history tracked separately if needed).
- Soft-delete pattern (`status` flag) for `User`/`Student` rather than hard delete, to satisfy `SRS-DATA-11` anonymization-not-deletion default, with a separate hard-purge job for confirmed-compliant deletion requests.

---

## 4. Prediction & Risk Modeling

### 4.1 Model Selection Strategy
Per PRD §8, multiple candidate models are evaluated; TRD fixes the **evaluation and promotion process**, not a single permanent model:

1. **Baseline**: Linear Regression — always trained as a sanity-check floor; if a complex model doesn't beat it by a meaningful margin, that's a signal of overfitting or weak features, not proceed-anyway.
2. **Candidate — Tree-based**: Gradient-boosted trees (XGBoost/LightGBM) — expected primary candidate given tabular, mixed-type features (marks, attendance %, behavioral counts) where tree ensembles typically outperform linear models without heavy feature engineering.
3. **Candidate — Neural Network**: Small feed-forward network — only promoted to production if it meaningfully beats the tree-based candidate on held-out data; given pilot-scale data volume, tree-based models are more likely to win in practice and the NN is kept as a documented comparison, not assumed superior by default (avoids "NN because AI-sounding" bias).

**Promotion rule**: A candidate model is promoted to production only if it beats the current production model by a pre-registered margin (e.g., ≥5% relative MAE improvement) on a held-out validation set *and* passes the fairness check in §4.4. Model version is logged per `SRS-NFR-M01`.

### 4.2 Feature Set (Prediction Model)

| Feature | Source Entity | Notes |
|---|---|---|
| Previous semester marks | `AcademicRecord` (`previous_sem`) | Normalized to 0–100 |
| Internal/assignment/lab/quiz marks | `AcademicRecord` | Recency-weighted average, not flat average |
| Attendance % | `Attendance` | Rolling window |
| Study hours (weekly avg) | `StudySession` | Outlier-clipped (per `SRS-F-003` implausible-session exclusion) |
| Study frequency/consistency | `StudySession` | Coefficient of variation of session gaps |
| Quiz accuracy trend | `QuestionResponse` | Slope of accuracy over last N attempts — this is the "recent performance trend" feature called out in PRD §29 as especially informative |
| Topic mastery distribution | `TopicMastery` | % topics Strong/Moderate/Weak/Not-Assessed |
| Revision frequency | `StudySession` on previously-attempted topics | |

### 4.3 Risk Score Composition
Risk score is a **weighted composite**, not a separate opaque model, so its driver factors are inherently interpretable (directly satisfies `SRS-F-050`'s hard separation rule — numeric attribution from the pipeline, not an LLM guess):

```
risk_score = w1*(100 - normalized_predicted_score)
           + w2*(100 - attendance_pct)
           + w3*(pct_weak_topics)
           + w4*(negative_trend_magnitude)
           + w5*(inconsistency_score)
```
Weights (`w1..w5`) are config-driven (`SRS-NFR-M02`), institution-tunable, with sane defaults derived from the relative predictive importance observed in the prediction model's feature importances during initial calibration — not arbitrarily hand-picked.

### 4.4 Fairness Check (traces `SRS-NFR-F01`)
Before any model promotion: compute prediction error and risk-tier distribution by available consented subgroup; flag (not auto-block) if disparity exceeds a defined threshold (e.g., MAE differs by >20% relative between subgroups) — routed to Admin's Fairness Panel (FSD C.6) for human review before go/no-go.

---

## 5. Topic Mastery Algorithm

```
mastery_score = α * concept_understanding + β * practice_accuracy + γ * revision_stability
```
- `concept_understanding`: accuracy on **first-attempt** questions per topic (measures true understanding, not memorization from repeated tries).
- `practice_accuracy`: recency-weighted accuracy across all attempts (exponential decay weighting so a recent correct streak outweighs an old struggle).
- `revision_stability`: a decay function — mastery erodes slightly if a topic hasn't been revisited within a configurable window, modeling forgetting curves; prevents a stale "mastered 3 months ago, never touched since" score from misleadingly reading as current.
- Defaults: α=0.4, β=0.4, γ=0.2 (config-driven, `SRS-NFR-M02`).
- **Not-Yet-Assessed guard**: if `attempt_count == 0`, mastery_score is null/undefined, not zero — enforced at the query layer so no downstream consumer can accidentally treat "no data" as "zero mastery" (this directly implements the FSD A.6 grey-state requirement and the SRS §5.5 edge case).

---

## 6. Adaptive Quiz Engine

- **Approach for v1**: Rule-based difficulty state machine (not full Item Response Theory) — simpler to implement, test, and explain to stakeholders (Explainability is a product value, per PRD §26/§10 — a black-box IRT parameter fit is harder to justify pedagogically at pilot stage than a transparent state machine).
  - State: `current_difficulty ∈ {easy, medium, hard}`.
  - Transition: correct → step up (max hard); incorrect → step down (min easy); N consecutive incorrect on same topic → circuit breaker (`SRS-F-071`) before resuming.
- **v2 candidate**: Migrate to a lightweight IRT (1-parameter logistic) once enough response data exists to fit reliable item difficulty parameters — explicitly deferred, flagged as a future TRD revision trigger tied to data volume, not a v1 commitment.

---

## 7. GenAI Architecture

### 7.1 `GenAIProvider` Interface Contract

```
interface GenAIProvider:
  generateExplanation(driver_factors: DriverFactor[], target: "prediction"|"risk", locale: str) -> str
  generateQuestion(subject_id, topic_id, difficulty, misconception_hint?: str) -> QuestionDraft
  assistantRespond(conversation: Message[], student_context: MinimalContext) -> AssistantMessage
```

- **Hard rule (traces `SRS-F-050`)**: `generateExplanation` receives only already-computed structured factors — it phrases, it does not decide magnitude or direction. This is enforced by never passing raw student PII/scores into the explanation prompt beyond the pre-computed `driver_factors[]` and target type.
- **Context minimization** (`SRS-F-090` main flow): `assistantRespond` receives a `MinimalContext` object assembled per-query based on intent classification (e.g., a lightweight intent check determines whether the query needs the student's mastery/risk data at all before attaching it) — avoids sending full academic history on every trivial query, both for cost and privacy-minimization (`PRD-TRUST-01`).

### 7.2 Prompt Design Principles
- Explanation prompts are template-constrained (structured input → constrained natural-language output), not open-ended, to keep phrasing consistent and reduce hallucination risk.
- Question-generation prompts require structural self-check: the response must include exactly one correct answer and ≥2 distinct plausible distractors; a lightweight validator (`SRS-F-072`) parses the response and rejects/retries once before falling back to the human-authored bank.
- Assistant prompts include an explicit system-level instruction not to assert unverified academic facts about the student (operationalizes `SRS-F-091`), and the assistant is instructed to say so plainly when asked something outside its available context.

### 7.3 Caching & Cost Control
- Explanation strings cached per `(entity_id, driver_factors_hash)` — identical factor sets don't re-generate identical text (`SRS-F-051`).
- Assistant conversations are not globally cached (inherently conversational/unique) but rate-limited per user (`SRS-NFR-S03`).
- Question generation results are persisted as regular `Question` records with `source=ai_generated` — once generated and validated, they become reusable bank content, amortizing cost over reuse rather than regenerating per student per attempt.

### 7.4 Fallback Behavior (traces `SRS-NFR-R02`)
| Component | On GenAI outage |
|---|---|
| Explanation | Deterministic template string (see SRS §5.6 edge case) |
| Question generation | Serve from existing bank filtered by topic/difficulty |
| Assistant | Disabled state with clear messaging (FSD A.13 edge case) |

---

## 8. API Contract Highlights (Representative, Not Exhaustive)

```
GET  /v1/students/{id}/dashboard
GET  /v1/students/{id}/subjects/{subject_id}/prediction
GET  /v1/students/{id}/subjects/{subject_id}/risk
GET  /v1/students/{id}/topics/{topic_id}/mastery
GET  /v1/students/{id}/plan/current
POST /v1/students/{id}/plan/items/{item_id}/status
POST /v1/quiz/attempts                     # start adaptive quiz
POST /v1/quiz/attempts/{id}/responses      # submit answer, get next question
POST /v1/predictions/{id}/flag             # flag-as-wrong (SRS-F-142)
GET  /v1/faculty/sections/{id}/risk-overview
GET  /v1/faculty/sections/{id}/at-risk
POST /v1/faculty/students/{id}/interventions
GET  /v1/admin/cohorts/{id}/analytics
POST /v1/admin/taxonomy/suggest            # AI-assisted topic suggestion
POST /v1/admin/taxonomy/publish
GET  /v1/admin/reports/export
```

- All list/detail endpoints scoped server-side per role (never rely on client-supplied filters for authorization — `SRS-NFR-S01`).
- Every response containing a `prediction` or `risk` object includes an `explanation` field — enforced via a shared response schema/serializer so it's structurally impossible for a route to omit it (`SRS-CON-03` made a type-level guarantee, not a per-endpoint discipline).
- API versioned at URL root (`SRS-COM-02`); breaking changes require a new version path.

---

## 9. Batch & Event Processing

- **Nightly batch** (Celery beat): full-cohort mastery decay recompute, prediction refresh for students without a same-day trigger, notification digest generation.
- **Event-driven recompute** (`SRS-F-100`): on qualifying write, enqueue a debounced task keyed by `student_id` (e.g., 5-minute debounce window) so rapid successive updates (e.g., bulk import) trigger one recompute cascade, not N.
- Cascade order enforced by task dependency: mastery → risk → prediction → plan (matches SRS dependency order), implemented as chained Celery tasks with idempotency keys so a retry doesn't double-apply.

---

## 10. Security Implementation Notes

- Passwords hashed with a strong adaptive hash (e.g., bcrypt/argon2); never logged, never returned in any response.
- JWT access tokens short-lived (e.g., 15 min) with refresh rotation; refresh tokens revocable (logout-everywhere capability).
- Faculty/admin cross-section access attempts return 403 with a generic message (resolves the SRS open question toward explicit-but-generic denial, balancing the audit-clarity need against not leaking whether a student ID exists at all in the message body).
- All GenAI outbound calls stripped of direct identifiers where feasible (send `driver_factors`/topic IDs, not student name/email) — minimizes PII exposure to the third-party provider.

---

## 11. Open Technical Decisions (Flagged, Not Silently Assumed)

1. **Orchestration platform** (Kubernetes vs. simpler managed container hosting) — deferred to System Design, depends on actual pilot institution's infra preferences/budget.
2. **Telemetry store scaling trigger** — revisit Postgres-vs-columnar-store decision once real pilot event volume is known; no premature commitment made here.
3. **LLM vendor selection** — abstracted so this can be decided later (cost/quality bake-off) without touching application code.
4. **IRT migration timing** for adaptive quiz — deferred until sufficient response-data volume exists to fit reliable parameters.

---

*End of TRD v1.0 draft. Next: System Design (component diagrams, data-flow diagrams, deployment/scaling plan, failure-mode analysis) building directly on this stack, then the Test Plan tracing every SRS/FSD/TRD decision to concrete test cases.*
