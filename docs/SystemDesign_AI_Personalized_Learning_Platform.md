# System Design Document
## AI-Driven Personalized Learning and Academic Performance Prediction System ("LearnSense")

| Field | Value |
|---|---|
| Document Type | System Design Document |
| Version | 1.0 (Draft) |
| Traces From | TRD v1.0 |
| Traces To | Test Plan |
| Purpose | Component architecture, data flow, deployment topology, scaling plan, failure-mode analysis |

---

## 1. Component Architecture

```
                              ┌────────────────────────────────────────────┐
                              │              CLIENT LAYER                  │
                              │  Flutter Mobile App   │   React Web (Fac/Admin) │
                              └───────────────┬──────────────────────────────┘
                                              │ HTTPS/TLS 1.2+ (SRS-COM-01)
                                              ▼
                              ┌────────────────────────────────────────────┐
                              │            API GATEWAY LAYER               │
                              │  - TLS termination                         │
                              │  - Rate limiting (SRS-NFR-S03)              │
                              │  - Request routing, versioning (/v1)        │
                              └───────────────┬──────────────────────────────┘
                                              ▼
                              ┌────────────────────────────────────────────┐
                              │           AUTH MIDDLEWARE                  │
                              │  - JWT validation, role claim extraction    │
                              │  - Section/cohort scoping injection         │
                              └───────────────┬──────────────────────────────┘
                                              ▼
        ┌──────────────────────────────────────────────────────────────────────────┐
        │                        APPLICATION SERVICE LAYER (FastAPI monolith)       │
        │                                                                            │
        │  ┌─────────────┐ ┌───────────────┐ ┌────────────────┐ ┌──────────────┐    │
        │  │ Ingestion   │ │ Analytics /   │ │ Personalization │ │ Assessment  │    │
        │  │ Service     │ │ Prediction    │ │ Service          │ │ Service     │    │
        │  │             │ │ Service       │ │ (plan/reco)      │ │ (adaptive   │    │
        │  │             │ │               │ │                  │ │  quiz)      │    │
        │  └──────┬──────┘ └───────┬───────┘ └────────┬─────────┘ └──────┬───────┘    │
        │         │                │                   │                 │            │
        │  ┌──────┴──────┐ ┌───────┴───────┐ ┌────────┴─────────┐ ┌──────┴───────┐    │
        │  │ Faculty/     │ │ Notification  │ │ GenAI            │ │ Audit /      │    │
        │  │ Admin        │ │ Service       │ │ Orchestration     │ │ Compliance  │    │
        │  │ Service      │ │               │ │ Service           │ │ Service     │    │
        │  └─────────────┘ └───────────────┘ └──────────────────┘ └──────────────┘    │
        └───────────┬──────────────────────────┬───────────────────────┬─────────────┘
                    ▼                           ▼                       ▼
          ┌───────────────────┐      ┌───────────────────┐   ┌───────────────────────┐
          │   PostgreSQL       │      │   Redis            │   │  Celery Workers       │
          │  (transactional +  │◄────►│ (cache, rate-limit,│◄─►│ (batch, async recompute│
          │   telemetry)       │      │  task broker)       │   │  cascade, export)     │
          └───────────────────┘      └───────────────────┘   └───────────┬───────────┘
                                                                          ▼
                                                              ┌───────────────────────┐
                                                              │  GenAIProvider →       │
                                                              │  External LLM API      │
                                                              └───────────────────────┘
```

### 1.1 Service Responsibilities

| Service | Owns | Key SRS Refs |
|---|---|---|
| Ingestion | Manual entry, CSV import, telemetry capture, validation | SRS-F-001–003 |
| Analytics/Prediction | Mastery, risk, prediction computation | SRS-F-020–041 |
| Personalization | Plan generation, resource recommendation | SRS-F-060–063 |
| Assessment | Adaptive quiz delivery, question generation orchestration | SRS-F-070–072 |
| Faculty/Admin | Scoped views, intervention logging, taxonomy authoring | SRS-F-010–011, 110–122 |
| Notification | Trigger evaluation, delivery abstraction | SRS-F-130–131 |
| GenAI Orchestration | `GenAIProvider` interface implementation, caching, fallback | SRS-IF-02, TRD §7 |
| Audit/Compliance | Access logging, flag-as-wrong records | SRS-F-141–142 |

Each service is a **Python package boundary**, not a network boundary, in v1 (per TRD §2 monolith decision) — communicates via direct function calls within a request, and via Celery tasks for async work. No service directly queries another service's tables outside its designated schema ownership, even though they share one physical database — this discipline is what makes a future microservice split mechanical rather than a rewrite.

---

## 2. Data Flow Diagrams (Key Flows)

### 2.1 Flow: New Quiz Attempt → Updated Prediction

```
Student submits QuestionResponse
        │
        ▼
Assessment Service validates & persists response
        │
        ▼
Enqueue debounced recompute task (student_id) ── Celery
        │
        ▼
[after debounce window]
        │
        ▼
Mastery recompute (Analytics Service)
        │  reads: QuestionResponse, StudySession
        │  writes: TopicMastery
        ▼
Risk recompute
        │  reads: TopicMastery, AcademicRecord, Attendance
        │  writes: RiskScore (+ driver_factors)
        ▼
Prediction recompute
        │  reads: feature set (TRD §4.2)
        │  writes: Prediction (+ driver_factors)
        ▼
Plan regeneration check (SRS-F-061 triggers evaluated)
        │  conditionally writes: new LearningPlan
        ▼
Notification trigger evaluation
        │  conditionally writes: Notification, enqueues delivery
        ▼
[Redis cache for student's dashboard invalidated]
```

### 2.2 Flow: Student Views Dashboard

```
Client GET /v1/students/{id}/dashboard
        │
        ▼
Auth Middleware validates JWT, confirms id == token subject (or explicit faculty/admin override with scope check)
        │
        ▼
Check Redis cache (key: dashboard:{student_id}:{last_prediction_id})
        │
   ┌────┴────┐
  HIT        MISS
   │           │
   ▼           ▼
Return    Assemble from Postgres (latest Prediction, RiskScore, TopicMastery aggregate, active LearningPlan)
cached           │
response         ▼
             Populate cache, return response
```

### 2.3 Flow: GenAI Explanation Generation (with fallback)

```
Analytics Service computes driver_factors[] (structured, numeric)
        │
        ▼
GenAI Orchestration Service: check cache (entity_id + factors_hash)
        │
   ┌────┴────┐
  HIT        MISS
   │           │
   ▼           ▼
Return    Call GenAIProvider.generateExplanation()
cached          │
text       ┌────┴─────┐
          OK          Error/timeout
           │              │
           ▼              ▼
      Cache + return   Deterministic template fallback (TRD §7.4)
                        (not cached as "the" answer — retried next time)
```

### 2.4 Flow: Bulk CSV Import

```
Admin uploads CSV
        │
        ▼
Ingestion Service: parse, row-level validate (SRS-DATA-01..05)
        │
        ▼
Stage valid rows; build error report for invalid rows
        │
        ▼
Return pre-commit summary to Admin UI (N valid / M invalid)
        │
        ▼
Admin confirms commit
        │
        ▼
Upsert AcademicRecord rows (SRS-DATA-03 semantics)
        │
        ▼
Batch-enqueue recompute cascade, grouped per affected student
        (avoids one recompute storm — batched with a wider debounce window for bulk-import-sourced events)
```

---

## 3. Deployment Topology

### 3.1 Environments
`dev` → `staging` (pilot-representative data volume, used for load testing against `SRS-NFR-P02`) → `production` (single-institution pilot).

### 3.2 Topology (v1 — Pilot Scale)

```
                    ┌───────────────────────┐
                    │   Load Balancer /      │
                    │   TLS termination      │
                    └───────────┬───────────┘
                                ▼
                 ┌──────────────────────────────┐
                 │  API instances (N replicas,    │
                 │  stateless, autoscale on CPU/  │
                 │  request-latency)               │
                 └───────────┬──────────────────┘
                                ▼
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                       ▼
 ┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
 │ PostgreSQL   │     │ Redis (managed)  │     │ Celery Workers    │
 │ (primary +   │     │                  │     │ (autoscale on      │
 │ read replica │     │                  │     │  queue depth)      │
 │ for analytics│     │                  │     │                    │
 │ reads)       │     │                  │     │                    │
 └─────────────┘     └─────────────────┘     └──────────────────┘
```

- **Read replica** specifically to isolate heavy Admin/Faculty analytics aggregation queries (`SRS-F-120`, `SRS-F-112`/`121`) from the primary transactional path, protecting `SRS-NFR-P01` dashboard latency for students under concurrent load.
- Orchestration platform choice (Kubernetes vs. managed container service) left open per TRD §11.1 — this topology is expressible on either.

### 3.3 Scaling Plan Against `PRD-NFR-02` (10,000 concurrent profiles)
- API layer: stateless, horizontally scaled — bottleneck is expected to be DB, not API compute, given the request profile (mostly reads with caching).
- DB: vertical scaling first (simpler), read replica for analytics offload; revisit sharding only if pilot data shows a real bottleneck — explicitly not over-engineered upfront.
- Celery workers: scaled on queue depth, particularly around the nightly batch window (`SRS-NFR-P02`'s 4-hour target) — batch job itself is chunked per-cohort-segment so it parallelizes across workers rather than running as one long serial job.

---

## 4. Failure Mode Analysis

| Failure | Detection | System Behavior | User-Visible Impact |
|---|---|---|---|
| Prediction model service error | Exception caught in Analytics Service | Serve last-known `Prediction` from Postgres/cache with `stale_data` flag | Dashboard shows "Updated [date]" label (FSD A.2) — no hard error |
| GenAI provider timeout/outage | Timeout on `GenAIProvider` call | Fallback per component (TRD §7.4 table) | Explanations still shown (templated); assistant shows unavailable state |
| Postgres primary unavailable | Connection failure | Read replica can serve read-only degraded mode for analytics views; writes fail fast with clear "try again" error, not silent data loss | Faculty/Admin views may still work read-only; write actions (intervention log, quiz submission) blocked with explicit retry messaging |
| Celery worker backlog (batch overrun) | Queue depth monitoring | Autoscale workers; if still behind, nightly batch prioritizes highest-risk-tier students first (partial completion is still useful, ordered by importance) | Some students see stale prediction longer than target SLA — logged as an SLA breach for review, not hidden |
| Bulk import with high error rate | Validation summary at pre-commit stage | Admin is shown the full error report before anything commits — no partial silent commit of a majority-bad file without explicit confirmation | Admin decision point, not automatic partial success |
| Debounce storm (many rapid events) | Task dedup key collision (by design) | Only one recompute cascade runs per debounce window per student | No user-visible impact — internal efficiency safeguard |
| Cross-tenant/section data leak attempt | Auth middleware scope check fails | 403 response, `AuditLog` entry | Faculty sees explicit access-denied screen (FSD B.3 edge case) |

---

## 5. Observability

- **Metrics**: API latency (P50/P95/P99) per endpoint group, batch job duration vs. `SRS-NFR-P02` target, GenAI call success/fallback rate, cache hit rate, queue depth.
- **Logging**: Structured logs correlated by `request_id`; `AuditLog` entries are a separate, immutable, queryable table (not just log-file entries) since they carry compliance weight (`SRS-F-141`).
- **Alerting thresholds (initial)**: Batch job running >75% of the maintenance window budget; GenAI fallback rate >20% sustained (signals a provider issue worth investigating); API P95 latency breach of `SRS-NFR-P01` sustained over 15 minutes.

---

## 6. Data Flow Privacy Boundary (Visual Summary)

```
 Raw behavioral telemetry (StudySession, QuestionResponse)
        │
        ▼  [aggregation happens here]
 TopicMastery / RiskScore / Prediction (derived, aggregated)
        │
        ├──────────────► Student: sees own raw + derived data
        │
        ├──────────────► Faculty: sees derived/aggregated only (PRD-TRUST-03 boundary,
        │                          enforced at query layer — Faculty-scoped repository
        │                          methods never expose raw StudySession/QuestionResponse tables)
        │
        └──────────────► GenAI Provider: sees only driver_factors[] / topic IDs,
                                   never raw telemetry or full PII (TRD §10)
```

This boundary is implemented as **separate repository/query classes** per consumer (`StudentRepository`, `FacultyScopedRepository`, `GenAIContextBuilder`) rather than a single generic data-access layer with ad-hoc filtering — makes the privacy boundary a structural property of the codebase, not a convention that can be accidentally bypassed.

---

## 7. Open Items Carried Into Test Plan

- Load-test targets derived from `SRS-NFR-P01`–`P03` need to be executed against `staging` before production sign-off.
- Failure-mode table above (§4) should map 1:1 to chaos/resilience test cases in the Test Plan.
- Fairness check (TRD §4.4) needs a defined subgroup dataset in staging to be testable at all — flagged as a data-availability dependency for that specific test category.

---

*End of System Design v1.0 draft. Final doc: Test Plan — test strategy, environment matrix, and case-level detail tracing every PRD/SRS/FSD/TRD/System-Design ID produced so far.*
