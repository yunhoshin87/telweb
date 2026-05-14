# Improvement Opportunity Framework

Use this reference to identify and structure improvement opportunities in ERP and internal systems.

## 1. Improvement Categories

| Category | Look For | Example Improvement |
|---|---|---|
| Process bottleneck | waiting, approval delay, handoff delay | SLA alert, delegated approval, parallel review |
| Duplicate work | repeated entry, copy/paste, Excel upload | master data sync, API integration, reusable templates |
| Data quality | duplicates, missing owner, free-text codes | validation, ownership, code table, duplicate check |
| Control gap | excessive access, no SoD, no audit | RBAC, SoD rule, access review, audit log |
| Exception overload | too many manual exceptions | policy table, exception workflow, auto classification |
| UI friction | hard search, too many fields, unclear action | role-based screen, better filters, draft/save later |
| Reporting gap | manual report, KPI inconsistency | governed dashboard, metric dictionary, reconciliation |
| Integration failure | manual export/import, no retry | API, queue, retry, monitoring, reconciliation |
| Closing pain | month-end rush, late corrections | closing checklist, lock rules, correction workflow |
| Automation candidate | repetitive judgment-light task | rule engine, RPA, workflow automation |
| AI candidate | text-heavy, anomaly-heavy, triage-heavy task | summary, recommendation, anomaly detection |

## 2. Root Cause Patterns

Use these patterns when explaining why a problem happens:

- No clear data owner
- Master data and transaction data mixed together
- Status values do not represent real workflow
- Approval policy exists only verbally
- Permission model is menu-based but not data-scope based
- System lacks bulk actions for high-volume work
- Integration is file-based without validation or reconciliation
- Reports are not tied to governed metric definitions
- Exceptions bypass the system and are invisible
- Core ERP was customized where configuration or extension would be safer

## 3. Automation Candidate Test

A task is a good automation candidate when:

- It happens frequently
- Inputs are structured or can be structured
- Rules are stable
- Exceptions are identifiable
- Failure can be detected
- Human review is available for edge cases
- The action is reversible or low-risk

Avoid automation first when:

- Rules are politically disputed
- Data quality is poor
- The process is not standardized
- The action is financially/legal irreversible
- No owner exists for exceptions

## 4. AI Candidate Test

Good AI candidates:

- Summarizing long tickets, approvals, contracts, or reports
- Extracting fields from documents before human review
- Recommending account codes, categories, or approvers
- Detecting anomalies in expense, inventory, settlement, or access logs
- Drafting responses, memos, report narratives, or requirement summaries
- Prioritizing exceptions for human review

Risky AI candidates:

- Final payment approval
- Payroll changes
- Legal or tax decisions without review
- Customer-impacting cancellation/refund without policy
- Deleting or overwriting ERP records
- Granting privileged permissions

## 5. Opportunity Card

Use this format for each improvement:

| 항목 | 내용 |
|---|---|
| 개선 기회 |  |
| 현재 문제 |  |
| 근거 |  |
| 영향 | 시간, 비용, 통제, 데이터 품질, 사용자 경험 |
| 원인 가설 |  |
| 제안 개선안 |  |
| 필요 데이터/자료 |  |
| 관련 부서 |  |
| 예상 난이도 | Low/Medium/High |
| 우선순위 | P0/P1/P2/P3 |
| 확인 질문 |  |

## 6. Common ERP Improvements

### Quick Wins

- Search/filter improvements
- Required field cleanup
- Draft state
- Standard rejection reasons
- Status labels and next-action guidance
- Excel template validation
- Download audit log
- Role-based dashboard
- Duplicate master data warning
- Approval delay notification

### Medium Improvements

- Approval policy engine
- Bulk upload with validation preview
- Integration retry queue
- Master data ownership workflow
- Closing checklist
- Exception dashboard
- Field-level permission
- Report metric dictionary
- API-based integration replacement for file upload

### Strategic Improvements

- Process mining and event log analysis
- Clean core remediation
- Data governance operating model
- Enterprise integration layer
- AI-assisted exception handling
- Autonomous low-risk workflow execution
- Cross-module reconciliation
- Internal control automation

## 7. Finding To Task Conversion

Convert findings into tasks like this:

1. State the business issue.
2. Tie it to evidence.
3. Explain operational impact.
4. Define the smallest useful fix.
5. Identify owner and dependency.
6. Add acceptance criteria.

Example:

Finding: 구매 요청 반려 사유가 자유 텍스트라 반복 반려 원인 분석이 어렵다.

Task: 구매 요청 반려 시 표준 반려 사유 코드를 선택하도록 변경하고, 기타 선택 시 상세 사유를 필수 입력한다.

Acceptance criteria:

- 반려 시 표준 사유 1개 이상 선택 필수
- 기타 선택 시 상세 사유 20자 이상 입력
- 반려 사유별 월간 리포트 제공
