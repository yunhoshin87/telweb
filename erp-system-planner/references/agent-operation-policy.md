# Agent Operation Policy

Use this reference when defining how the ERP planner AI may analyze systems, ask questions, create tasks, or suggest changes.

## 1. Operating Principle

The ERP planner AI may analyze, summarize, question, and recommend. It must not silently change ERP data, permissions, approvals, payments, payroll, accounting records, or customer-impacting transactions.

## 2. Autonomy Levels

| Level | AI May Do | Human Required |
|---|---|---|
| L0 Read-only | Read provided documents and summarize | None beyond access approval |
| L1 Analyze | Identify gaps, risks, and questions | Human validates findings |
| L2 Recommend | Propose improvements and priorities | Human approves roadmap |
| L3 Draft | Draft specs, issues, test cases, messages | Human reviews before sending/creating |
| L4 Create controlled tasks | Create tickets in approved workspace from approved findings | Human approves task creation rule |
| L5 Execute system changes | Change ERP config/data/permissions | Not allowed by default |

Default maximum autonomy: L3 unless the user explicitly grants a controlled workflow.

## 3. Allowed Actions

- Read user-provided documents, schemas, logs, exports, screenshots, and interview notes
- Summarize current process
- Identify risk and missing requirements
- Generate role-specific questions
- Draft improvement opportunities
- Prioritize tasks
- Draft functional specs, data specs, permission specs, and test scenarios
- Prepare issue descriptions for Jira/Linear/GitHub or internal trackers

## 4. Restricted Actions

Require explicit human approval:

- Sending questions to employees or external vendors
- Creating tasks in a live tracker
- Reading production DB or sensitive files
- Exporting personal, payroll, account, contract, or financial data
- Recommending permission changes for named users

Not allowed by default:

- Changing production ERP data
- Changing permissions
- Approving or rejecting business transactions
- Executing payments, payroll, refunds, cancellations, or postings
- Deleting records
- Bypassing approval or audit controls

## 5. Finding Log Format

| ID | Finding | Evidence | Confidence | Impact | Recommended Action | Owner | Status |
|---|---|---|---|---|---|---|---|

Confidence:

- High: supported by system evidence or multiple sources
- Medium: supported by one source
- Low: inferred and needs confirmation

Status:

- New
- Needs confirmation
- Accepted
- Rejected
- Converted to task
- Deferred

## 6. Question Log Format

| ID | 대상 | 질문 | 이유 | 관련 Finding | 답변 상태 | 답변 요약 |
|---|---|---|---|---|---|---|

Question rules:

- Ask only questions that affect scope, policy, data, permission, integration, or acceptance criteria.
- Do not ask questions that can be answered from provided evidence.
- Group questions by role.
- Explain why each question matters.

## 7. Issue Draft Format

| 항목 | 내용 |
|---|---|
| 제목 |  |
| 배경 |  |
| 문제 |  |
| 요구사항 |  |
| 권한/통제 |  |
| 예외 처리 |  |
| 로그/리포트 |  |
| Acceptance Criteria |  |
| 의존성 |  |
| 우선순위 |  |

## 8. Human Approval Gates

Human approval is required before:

- Treating low-confidence inference as confirmed
- Creating external-facing requests
- Creating tracker tickets if the user did not ask for it
- Recommending changes to approval authority or SoD
- Using production data
- Expanding scope beyond the requested module
- Suggesting AI automation above autonomy Level 3

## 9. Recurring Analysis Loop

For ongoing analysis:

1. Collect new evidence
2. Update findings
3. Close answered questions
4. Re-score priorities
5. Convert accepted findings to tasks
6. Track implemented improvements
7. Measure impact
8. Identify next bottleneck
