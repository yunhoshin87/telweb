# Continuous Learning Loop

Use this reference when the ERP planner should learn from analysis sessions, user corrections, accepted findings, rejected assumptions, workflow changes, and repeated implementation patterns.

## 1. Purpose

The ERP planner should improve over time by capturing what it learns from real projects. Learning must be explicit, reviewable, and safe.

The AI may collect learning candidates and propose updates. It must not silently rewrite the skill, change policy, or treat one-off project context as universal knowledge without human approval.

## 2. What To Capture

Capture reusable learning from:

- User corrections: when the user says an assumption was wrong
- Accepted findings: risks or improvements the user confirms as valid
- Rejected findings: analysis patterns that should be avoided
- Repeated questions: questions that appear across multiple ERP analyses
- Repeated missing fields: data fields commonly required but often omitted
- Repeated permission patterns: roles, data scopes, SoD rules, approval thresholds
- Repeated workflow structures: common current-state and target-state flows
- Domain terminology: company-specific or industry-specific words
- Change structures: before/after process, status transition, data model change, authority change
- Implementation outcomes: what was easy, hard, delayed, or misunderstood by developers
- Post-release feedback: defects, adoption issues, manual work that remained

Do not capture:

- Personal data
- Secrets, tokens, passwords, API keys
- Raw payroll, bank, tax, or resident ID data
- Named employee performance details
- One customer's confidential policy as a general ERP rule
- Unverified claims as confirmed patterns

## 3. Learning Candidate Log

Store learning candidates in this structure when a session produces reusable knowledge:

| ID | Source Session | Learning Type | Observation | Evidence | Reuse Value | Confidence | Proposed Destination | Status |
|---|---|---|---|---|---|---|---|---|

Learning Type examples:

- terminology
- checklist-addition
- template-field
- permission-rule
- data-rule
- workflow-pattern
- integration-pattern
- ai-governance-rule
- anti-pattern
- question-bank-addition
- prioritization-rule

Confidence:

- High: confirmed by user and supported by evidence
- Medium: confirmed by one source
- Low: plausible but needs more validation

Status:

- new
- needs-review
- approved
- rejected
- merged
- superseded

## 4. Session Retrospective

At the end of a meaningful analysis session, produce a short retrospective:

1. What assumptions were corrected?
2. What questions were especially useful?
3. What fields, statuses, permissions, or integrations were repeatedly missing?
4. What improvement opportunities were accepted?
5. What recommendations were rejected and why?
6. What should be added to a checklist, template, or workflow?
7. What should not be generalized?

## 5. Update Proposal Format

When proposing a skill update, use this format:

| 항목 | 내용 |
|---|---|
| 제안 ID |  |
| 변경 대상 파일 |  |
| 변경 유형 | 추가/수정/삭제/분리 |
| 변경 내용 요약 |  |
| 근거 |  |
| 기대 효과 |  |
| 위험 |  |
| 검토 필요 여부 | 항상 필요 |

Example:

| 항목 | 내용 |
|---|---|
| 제안 ID | CL-2026-001 |
| 변경 대상 파일 | references/discovery-question-bank.md |
| 변경 유형 | 추가 |
| 변경 내용 요약 | 구매 요청 분석 시 "긴급 구매 예외 승인 기준" 질문 추가 |
| 근거 | 3개 분석 세션에서 긴급 구매가 결재 우회 원인으로 확인됨 |
| 기대 효과 | 구매 프로세스 분석 시 통제 공백 조기 발견 |
| 위험 | 회사별 정책 차이 존재 |
| 검토 필요 여부 | 항상 필요 |

## 6. Safe Update Rules

Only update skill files when:

- The user explicitly asks to update the skill or approves the proposed update.
- The learning is reusable beyond a single narrow case.
- Sensitive details are removed or generalized.
- The proposed destination file is clear.
- The update does not contradict existing higher-level planning principles.

Prefer adding to reference files instead of expanding `SKILL.md` unless the learning affects the core workflow or trigger behavior.

## 7. Where To Put Updates

| Learning | Destination |
|---|---|
| New role/permission pattern | `references/permission-policy-template.md` |
| New data field or validation pattern | `references/data-spec-template.md` |
| New module-specific checklist item | `references/erp-module-checklists.md` |
| New analysis phase or evidence type | `references/system-analysis-workflow.md` |
| New stakeholder question | `references/discovery-question-bank.md` |
| New improvement category or anti-pattern | `references/improvement-opportunity-framework.md` |
| New scoring or roadmap rule | `references/issue-prioritization.md` |
| New autonomy/safety rule | `references/agent-operation-policy.md` |
| New data source or access requirement | `references/connector-requirements.md` |
| New learning-loop behavior | `references/continuous-learning-loop.md` |
| Core identity, trigger, or universal workflow | `SKILL.md` |

## 8. Change Structure Capture

When analyzing a system change, capture the before/after structure:

| Area | Before | After | Reason | Impact | Follow-up |
|---|---|---|---|---|---|
| Process |  |  |  |  |  |
| Data |  |  |  |  |  |
| Permission |  |  |  |  |  |
| Approval |  |  |  |  |  |
| Integration |  |  |  |  |  |
| Report |  |  |  |  |  |
| Automation/AI |  |  |  |  |  |

Use these records to identify reusable patterns, not to store project-confidential details.

## 9. Feedback Incorporation Workflow

1. Capture learning candidates during analysis.
2. Separate project-specific facts from reusable planning rules.
3. Remove sensitive or identifying details.
4. Assign confidence and proposed destination.
5. Present update proposal to the user.
6. Update the relevant reference file only after approval or explicit request.
7. Record what changed and why in the response.
8. If the update changes behavior, test with a small sample prompt.

## 10. Anti-Overfitting Rules

Avoid overfitting the skill to one company:

- Do not generalize a single company's approval chain as a standard rule.
- Do not add industry-specific terms to universal templates unless labeled.
- Do not make one ERP vendor's behavior the default unless the skill is scoped to that vendor.
- Do not add a checklist item if it is only useful for one edge case.
- Do not replace broad questions with narrow company-specific questions.

## 11. Suggested Output After Analysis

When a session contains learnable material, append:

## Skill Learning Candidates

| Candidate | Why It May Be Reusable | Proposed File | Confidence | Needs Approval |
|---|---|---|---|---|

Then ask the user whether to apply the proposed updates.
