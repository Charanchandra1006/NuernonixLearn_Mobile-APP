# Test Plan
## AI-Driven Personalized Learning and Academic Performance Prediction System ("LearnSense")

| Field | Value |
|---|---|
| Document Type | Test Plan (Strategy + Case-Level Detail) |
| Version | 1.0 (Draft) |
| Traces From | PRD, SRS, FSD, TRD, System Design (all v1.0) |
| Purpose | Define test strategy and concrete, traceable test cases across all layers |

---

## 1. Test Strategy Overview

### 1.1 Test Levels

| Level | Scope | Primary Owner Doc |
|---|---|---|
| Unit | Individual functions (mastery formula, risk composition, validators) | TRD §4, §5 |
| Integration | Service-to-service flows within the monolith, DB interactions | System Design §2 (data flows) |
| API/Contract | Endpoint request/response schema, auth/scoping | TRD §8, SRS §3 |
| End-to-End (E2E) | Full user journeys across client + backend | FSD screens, PRD §5 journeys |
| Model/ML Evaluation | Prediction accuracy, fairness, mastery correctness | TRD §4, §5 |
| Non-Functional | Performance, reliability, security, resilience | SRS §6, System Design §4 |
| UAT | Faculty/Admin/Student real-workflow validation | PRD success metrics §10 |

### 1.2 Environments

| Env | Purpose | Data |
|---|---|---|
| `dev` | Developer-local/CI unit+integration | Synthetic, small |
| `staging` | Pilot-representative load/E2E/model eval | Anonymized-scale-representative synthetic dataset (real pilot data not used pre-launch) |
| `production` (pilot) | Live single-institution pilot | Real, consented data |

### 1.3 Entry/Exit Criteria
- **Entry to staging**: All unit + integration tests passing; API contract tests passing; no open Critical/High defects.
- **Exit to production (pilot go-live)**: E2E journeys pass on staging; NFR targets met on staging load test; fairness check (§7) executed with no unresolved Critical disparity flag; UAT sign-off from at least one faculty and one student pilot user.

### 1.4 Defect Severity Definitions
- **Critical**: Data corruption, security/authorization bypass, prediction/risk shown without explanation (`SRS-CON-03` violation), incorrect cross-student data exposure.
- **High**: Core flow broken (e.g., plan not generating, quiz not adapting), NFR target missed by >50%.
- **Medium**: Incorrect but non-corrupting display (e.g., wrong trend arrow direction), edge case not handled gracefully.
- **Low**: Cosmetic, copy/tone issues.

---

## 2. Unit Test Cases (Representative Set)

| ID | Target | Case | Expected Result | Traces |
|---|---|---|---|---|
| UT-001 | `AcademicRecord` validation | value = -5, max_value = 100 | Rejected with row-level error | SRS-DATA-01 |
| UT-002 | `AcademicRecord` validation | value = 105, max_value = 100 | Rejected | SRS-DATA-01 |
| UT-003 | `Attendance` validation | percentage = 101 | Rejected | SRS-DATA-02 |
| UT-004 | Topic taxonomy cycle check | Set Topic A's parent to Topic B, where B's parent is already A | Rejected, cycle error, save blocked | SRS-DATA-04 |
| UT-005 | `QuestionResponse` time validation | time_taken_seconds = 0 | Excluded from mastery calc, flagged data-quality | SRS-DATA-05 |
| UT-006 | Mastery formula | attempt_count = 0 for topic | `mastery_score` = null (Not Yet Assessed), not 0 | TRD §5, SRS-F-040 edge case |
| UT-007 | Mastery formula | Recent correct streak after old failures | `practice_accuracy` weighted toward recent (higher than flat average would give) | TRD §5 |
| UT-008 | Mastery decay | No activity on topic for > decay window | `revision_stability` component decreases at recompute | TRD §5, SRS-F-040 |
| UT-009 | Risk composite | All sub-signals at worst values | risk_score approaches 100, tier = High | TRD §4.3 |
| UT-010 | Cold-start detection | Student with 2 graded records, 30% topic coverage | Classified cold-start; predictions labeled low-confidence | SRS-F-080 |
| UT-011 | Adaptive difficulty state machine | 3 consecutive incorrect on same topic | Circuit breaker triggers, concept explanation injected before next question | SRS-F-071 |
| UT-012 | Adaptive difficulty state machine | Correct at "hard" | Remains at "hard" (no overflow state) | TRD §6 |
| UT-013 | GenAI question validator | Generated question missing correct_answer_ref | Rejected, one retry, then fallback to bank | SRS-F-072 |
| UT-014 | Driver factor generation | Compute driver_factors for a known synthetic feature set | Output matches expected signed/magnitude values within tolerance | SRS-F-050 |
| UT-015 | Explanation fallback template | GenAI call raises timeout exception | Deterministic template string returned, no exception propagates to caller | TRD §7.4 |

---

## 3. Integration Test Cases

| ID | Flow | Case | Expected Result | Traces |
|---|---|---|---|---|
| IT-001 | New QuizAttempt → recompute cascade | Submit final question of a quiz | Mastery → Risk → Prediction → Plan-check all recompute in correct order within debounce window | System Design §2.1, SRS-F-100 |
| IT-002 | Debounce dedup | 5 rapid `AcademicRecord` writes for same student within debounce window | Exactly one recompute cascade executes | TRD §9, SD §2.1 |
| IT-003 | Bulk CSV import | File with 100 valid rows, 10 invalid rows | Pre-commit summary shows 100/10 split; only valid rows commit after confirm | SRS-F-002, SD §2.4 |
| IT-004 | Bulk CSV import upsert | Re-import a file with an updated mark for an existing record | Existing record updated (upsert), prior value retained in history table | SRS-DATA-03 |
| IT-005 | Cache invalidation | Dashboard fetched, then new Prediction generated for same student | Subsequent dashboard fetch reflects new prediction, not stale cache | SD §2.2 |
| IT-006 | GenAI outage simulation | Mock provider to throw on `generateExplanation` | API response still includes non-empty `explanation` field (template fallback) | SRS-CON-03, TRD §7.4 |
| IT-007 | Faculty scoping | Faculty A (Section 1) queries At-Risk List | Only Section 1 students returned, even if Faculty A crafts a request implying broader scope | SRS-F-114 |
| IT-008 | Cross-section access attempt | Faculty A requests Student Detail for a Section 2 student via direct ID | 403 response, AuditLog entry created | SRS-F-114, SD §4 |
| IT-009 | Intervention log immutability | Attempt to edit/delete an existing InterventionLog entry via API | No update/delete endpoint exists; only new append succeeds | SRS-F-113 |
| IT-010 | Flag-as-wrong does not alter score | Student flags a Prediction as wrong | RiskScore/Prediction values unchanged after flag; review record created | SRS-F-142 |
| IT-011 | Intervention log does not alter scores | Faculty logs "met with student" intervention with no new academic data | Risk/mastery scores unchanged after this action alone | SRS-F-100 edge case |
| IT-012 | Taxonomy publish gate | AI-suggested topic tree generated but not explicitly published | Suggested tree not visible/active in student-facing taxonomy | SRS-F-011 |

---

## 4. API/Contract Test Cases

| ID | Endpoint | Case | Expected Result | Traces |
|---|---|---|---|---|
| API-001 | `GET /v1/students/{id}/subjects/{subject_id}/prediction` | Valid request by the student themself | 200, response includes `predicted_range`, `confidence`, `explanation` (non-null) | SRS-CON-03 |
| API-002 | Same endpoint | Request by a different student for someone else's ID | 403 | SRS-NFR-S01 |
| API-003 | `GET /v1/faculty/sections/{id}/at-risk` | Faculty requests own section | 200, list scoped correctly | SRS-F-111, SRS-F-114 |
| API-004 | Any authenticated endpoint | Expired JWT | 401, client prompted to refresh/re-auth | SRS-NFR-S01 |
| API-005 | `POST /v1/quiz/attempts/{id}/responses` | Malformed payload (missing required field) | 422 with field-level error, no partial write | SRS-F-070 |
| API-006 | `POST /v1/admin/taxonomy/publish` | Called by non-Admin role | 403 | SRS-F-140 |
| API-007 | `GET /v1/admin/reports/export` | Large cohort export request | 202 Accepted (async), notification on completion, no request timeout | SRS-F-122 |
| API-008 | Rate limiting | Exceed configured request rate on GenAI-backed endpoint | 429 after threshold | SRS-NFR-S03 |

---

## 5. End-to-End (E2E) Test Scenarios

### E2E-001: Cold-Start Onboarding → First Insight (traces PRD §5.1)
1. Register new student account.
2. Verify Dashboard shows cold-start state (no fabricated numeric score) — FSD A.2.
3. Complete diagnostic quiz for one subject.
4. Verify at least one `TopicMastery` record now exists and prediction confidence transitions from "insufficient" toward "low" (not yet "high," per threshold in SRS-F-080).
**Pass criteria**: No numeric prediction/risk shown before minimum data threshold met; correct state transition after diagnostic completion.

### E2E-002: Rahul Scenario — Full Prediction→Intervention→Improvement Loop (traces PRD §32)
1. Seed a student profile matching the "Rahul" example data (attendance 78%, weak Probability/Integration).
2. Verify system surfaces High risk tier with Probability/Integration as top driver factors.
3. Verify generated weekly plan prioritizes Probability first (per §5.5 prioritization rules: risk contribution + assessment proximity + prerequisite dependency).
4. Simulate plan completion + improved quiz scores (44%→57%→68%→76% per PRD example).
5. Verify updated prediction range shifts upward and risk tier improves accordingly.
**Pass criteria**: End-to-end numbers are internally consistent at every step; explanation text updates to reflect the new drivers, not stale text.

### E2E-003: Faculty Weekly Triage (traces PRD §5.3)
1. Log in as Faculty; view Class Overview.
2. Drill into At-Risk List, sorted by risk score.
3. Open a student detail; verify only aggregated data visible (no raw telemetry — FSD B.3, PRD-TRUST-03).
4. Log an intervention; verify it appears immediately and is not editable afterward.
**Pass criteria**: All PRD-TRUST-03 boundary requirements hold; intervention log is append-only.

### E2E-004: Adaptive Quiz With Circuit Breaker (traces SRS-F-071)
1. Student answers 3 consecutive questions incorrectly on the same topic.
2. Verify a concept-explanation interstitial appears (not a 4th question at the same/harder difficulty).
3. Student proceeds; verify quiz resumes at a stepped-down difficulty.
**Pass criteria**: Circuit breaker fires exactly at the configured threshold, not before/after.

### E2E-005: GenAI Outage Resilience (traces SRS-NFR-R02)
1. Simulate GenAI provider outage (mock/staging toggle).
2. Verify: existing predictions/risk/plans still viewable; explanation falls back to template; AI Assistant shows explicit unavailable state (not a crash or infinite spinner); new AI-generated questions fall back to question bank.
**Pass criteria**: No screen in the app becomes fully unusable due to GenAI outage; only GenAI-dependent *new* generation is affected.

### E2E-006: Admin Taxonomy Authoring With AI Assist (traces SRS-F-011)
1. Admin uploads a syllabus document.
2. Review AI-suggested topic tree; edit one node, reject another.
3. Attempt to view the taxonomy from a student account before publishing — verify old taxonomy still shown (new one not live).
4. Publish; verify new taxonomy now live for students.
**Pass criteria**: Nothing AI-suggested becomes authoritative without the explicit publish action.

### E2E-007: High-Performer Advanced Track (traces SRS-F-062)
1. Seed a student profile with all topics Strong (≥75 mastery).
2. Verify weekly plan generation surfaces advanced/stretch content, not remedial content, and UI shows "Stretch Plan" badge (FSD A.8).
**Pass criteria**: No student with no weak topics ever receives a plan defaulting to remedial framing.

---

## 6. Non-Functional Test Cases

| ID | Category | Test | Target | Traces |
|---|---|---|---|---|
| NFR-T-001 | Performance | Load test dashboard endpoint at expected pilot concurrency | P95 ≤ 500ms | SRS-NFR-P01 |
| NFR-T-002 | Performance | Run full nightly batch against staging dataset sized to pilot scale | Completes within 4-hour window | SRS-NFR-P02 |
| NFR-T-003 | Performance | Adaptive quiz next-question latency under load | P95 ≤ 2s | SRS-NFR-P03 |
| NFR-T-004 | Reliability | Kill Postgres primary mid-load-test | Read replica serves read-only degraded mode; writes fail with clear retryable error | SD §4 |
| NFR-T-005 | Reliability | Simulate GenAI provider 100% failure for 10 minutes | No cascading failure into unrelated services; fallback behaviors all hold | SRS-NFR-R02 |
| NFR-T-006 | Security | Attempt SQL injection on all filterable/searchable fields | All inputs parameterized, no injection succeeds | SRS-NFR-S01 |
| NFR-T-007 | Security | Attempt to escalate role via crafted JWT claim | Server-side role re-validation rejects tampered token | SRS-NFR-S01 |
| NFR-T-008 | Security | Faculty attempts bulk enumeration of student IDs outside their section | Each attempt returns 403; repeated attempts logged, rate-limited if excessive | SRS-F-114, SRS-NFR-S03 |
| NFR-T-009 | Scalability | Simulate 10,000 concurrent active profiles on staging (synthetic) | System remains within NFR-T-001/002/003 targets or clearly identifies the next bottleneck | PRD-NFR-02 |
| NFR-T-010 | Auditability | Perform a set of faculty/admin data-access actions | Every access appears in `AuditLog` with correct actor/target/timestamp | SRS-F-141 |

---

## 7. Model / ML Evaluation Test Cases

| ID | Test | Method | Pass Criteria | Traces |
|---|---|---|---|---|
| ML-T-001 | Prediction accuracy | Compare candidate model vs. baseline linear regression on held-out validation set | Candidate beats baseline by pre-registered margin (≥5% relative MAE) before promotion | TRD §4.1, PRD-GOAL-01 |
| ML-T-002 | Prediction MAE (pilot target) | Evaluate on staging validation set | MAE ≤ 8 percentage points | PRD-GOAL-01 |
| ML-T-003 | Risk lead time | Simulate historical data, measure days between High-Risk flag and next assessment date | Average ≥ 21 days | PRD-GOAL-02, SRS-F-032 |
| ML-T-004 | Weak-topic mapping accuracy | Manual review sample of flagged weaknesses against SME judgment | ≥ 90% map to a correct, specific topic node | PRD-GOAL-03 |
| ML-T-005 | Fairness check | Compute prediction MAE and risk-tier distribution by consented subgroup on staging | No subgroup disparity exceeds defined threshold (e.g., >20% relative MAE difference) without being explicitly flagged for Admin review | TRD §4.4, SRS-NFR-F01 |
| ML-T-006 | Explainability consistency | For a sample of predictions, verify displayed explanation's stated direction/magnitude matches the underlying structured `driver_factors[]` exactly (no GenAI drift from source numbers) | 100% match on structured facts (phrasing may vary, numbers/direction may not) | SRS-F-050, TRD §7.1 |
| ML-T-007 | Cold-start confidence labeling | Verify no student below the minimum data threshold is ever shown a "high confidence" prediction | 0 violations in test sample | SRS-F-080 |

**Note**: ML-T-001, ML-T-005 require a real (or realistically synthetic) dataset with sufficient volume and, for ML-T-005, consented subgroup labels — flagged as a data-availability dependency, consistent with the open item noted in System Design §7.

---

## 8. User Acceptance Testing (UAT)

| ID | Participant | Scenario | Success Signal |
|---|---|---|---|
| UAT-001 | Pilot student | Full week of normal use: check dashboard, complete plan items, take one adaptive quiz | Student reports the plan felt specific/actionable (not generic), per PRD-GOAL-06 intent |
| UAT-002 | Pilot faculty | One week of triage using Faculty view only | Faculty reports reduced time identifying at-risk students vs. their prior manual process (PRD-GOAL-05) |
| UAT-003 | Pilot admin | Review Cohort Analytics and export one report | Report is usable for a real departmental review conversation without manual rework |
| UAT-004 | Pilot student | Deliberately flag a prediction as wrong | Student understands (from the UI copy) that flagging gives feedback but doesn't auto-change the score |

---

## 9. Regression Suite Composition

For every release after v1, the regression suite must include, at minimum: all Critical/High severity cases from every category above, plus any case that previously caught a production defect (defect-driven regression cases added permanently, not removed after the immediate bug is fixed).

---

## 10. Full Traceability Snapshot (PRD Goal → Test Coverage)

| PRD Goal | Primary Test Coverage |
|---|---|
| PRD-GOAL-01 (prediction accuracy) | ML-T-001, ML-T-002 |
| PRD-GOAL-02 (early warning lead time) | ML-T-003 |
| PRD-GOAL-03 (topic-level specificity) | ML-T-004 |
| PRD-GOAL-04 (mastery uplift via intervention) | E2E-002, longer-horizon pilot measurement (not a pre-launch test — requires real usage data) |
| PRD-GOAL-05 (faculty triage time reduction) | UAT-002 |
| PRD-GOAL-06 (plan completion engagement) | UAT-001, ongoing production analytics (not a pre-launch pass/fail test) |

**Note on PRD-GOAL-04 and PRD-GOAL-06**: These are inherently outcome metrics that can only be fully validated with real pilot usage over time — the Test Plan can verify the *mechanism* works correctly (E2E-002, UAT-001) but the *goal itself* is a post-launch measurement, not a pre-launch gate. This distinction is called out explicitly rather than pretending a pre-launch test can prove a real-world behavior-change outcome.

---

*End of Test Plan v1.0 draft — final document in this set. All six documents (PRD, SRS, FSD, TRD, System Design, Test Plan) now cross-reference each other via stable IDs, from product goal down to individual test case.*
