# Connector Requirements

Use this reference when specifying what information the ERP planner AI needs from systems, files, logs, databases, APIs, and collaboration tools.

## 1. Connector Goal

Connectors should provide enough evidence for analysis without granting unnecessary write access. Prefer read-only, scoped, auditable access.

## 2. Recommended Access By Source

| Source | Minimum Access | Useful Data | Notes |
|---|---|---|---|
| Documents | read selected files | specs, manuals, policies, meeting notes | version/date required |
| Screenshots | upload/read images | UI fields, actions, states | include role/context |
| Database schema | read schema only | tables, columns, keys, indexes | no row data needed initially |
| Sample DB rows | masked read | examples, data quality | avoid sensitive data |
| API docs | read | endpoints, payloads, auth, errors | identify side effects |
| Event logs | read filtered logs | status transitions, usage, errors | anonymize users if possible |
| Audit logs | read filtered logs | permission changes, data edits | sensitive, restrict access |
| BI reports | read/export | KPI definitions, reports | validate metric logic |
| Ticket system | read project/queue | recurring issues, requests | useful for pain analysis |
| Collaboration tools | read selected channels/docs | informal workflow | needs consent/scope |

## 3. Data Minimization

Start with:

1. Process documents
2. Screen list and screenshots
3. Role/permission matrix
4. DB schema
5. Sample masked data
6. Logs for selected period
7. Integration docs
8. Operational tickets

Avoid collecting:

- Full production data dumps
- Payroll details
- Full resident registration numbers or equivalent IDs
- Bank account numbers unless masked
- Passwords, tokens, secrets
- Unscoped employee messages

## 4. DB Evidence Requirements

For schema analysis:

- Table names
- Column names
- Data types
- Nullable flags
- Primary keys
- Foreign keys
- Indexes
- Enum/code tables
- Created/updated/deleted columns
- Audit/history tables

For sampled data:

- Mask personal data
- Limit rows
- Include status variety
- Include edge cases if known
- Include created/updated timestamps

## 5. Log Evidence Requirements

Useful logs:

- Login/access logs
- Action logs
- Status transition logs
- Approval logs
- Error logs
- Integration sync logs
- Batch job logs
- Download logs
- Admin override logs
- AI action/tool logs

For each log source, define:

- Time range
- User/role scope
- Event types
- Fields available
- Retention period
- Known gaps

## 6. API/Integration Evidence Requirements

Collect:

- Endpoint list
- Request/response payloads
- Authentication method
- Rate limits
- Retry policy
- Error codes
- Idempotency rules
- Webhook events
- Batch schedule
- Source-of-truth decision
- Reconciliation report

## 7. Process Mining Readiness

Process mining is useful when event logs include:

- Case ID: order_id, approval_id, request_id, ticket_id
- Activity name: submitted, approved, rejected, posted, closed
- Timestamp
- Actor or role
- Status before/after
- Optional attributes: amount, department, vendor, item, channel

If case ID or timestamps are missing, recommend instrumentation before process mining.

## 8. Connector Permission Policy

Default:

- Read-only
- Least privilege
- Time-bound
- Module-scoped
- Logged access
- No production write access
- No secret exposure

Write access requires:

- Explicit user approval
- Clear action boundary
- Rollback plan
- Audit logging
- Test environment validation first

## 9. Connector Request Template

| 항목 | 요청 내용 |
|---|---|
| 목적 | 예: 구매 프로세스 병목 및 권한 리스크 분석 |
| 필요한 자료 | 화면 목록, 권한표, DB schema, 승인 로그 |
| 기간 | 예: 최근 3개월 |
| 범위 | 예: 구매 요청/발주/입고 모듈 |
| 민감정보 처리 | 마스킹 또는 제외 |
| 접근 권한 | read-only |
| 산출물 | 분석 리포트, 확인 질문, 개선 과제 |

## 10. Evidence Gap Output

When evidence is missing, output:

| 필요한 자료 | 이유 | 없을 때의 한계 | 대체 자료 |
|---|---|---|---|

Example:

| 승인 로그 | 실제 승인 지연과 반려 패턴 확인 | 인터뷰 기반 추정만 가능 | 결재 문서 export, 티켓 기록 |
