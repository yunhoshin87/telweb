# System Analysis Workflow

Use this reference when the ERP planner must analyze an existing internal system and produce findings, questions, and improvement tasks.

## 1. Analysis Goal

The goal is not to describe the system as-is. The goal is to identify:

- What business process the system actually supports
- Where the process is slow, risky, duplicated, unclear, or manually patched
- Which data, permission, approval, integration, and reporting gaps matter
- Which questions must be answered by humans
- Which improvements should become concrete tasks

## 2. Evidence Inputs

Use any available evidence. Label missing evidence clearly.

| Evidence | What To Extract | Common Risk |
|---|---|---|
| 기획서/명세서 | intended process, roles, rules, screens | outdated or aspirational |
| 화면 캡처 | actual UI, fields, actions, status, friction | hidden backend rules |
| DB schema | entities, keys, relationships, missing constraints | no business meaning |
| API docs | data contracts, integrations, side effects | undocumented consumers |
| 로그/이벤트 | actual usage, errors, retries, bottlenecks | incomplete instrumentation |
| 엑셀 양식 | manual work, missing system fields, shadow process | unofficial source of truth |
| 인터뷰 | pain points, exceptions, approval reality | subjective and inconsistent |
| 운영 티켓 | recurring defects, support burden | symptoms without root cause |
| 리포트 | KPI, reconciliation, management needs | unclear calculation logic |

## 3. Analysis Phases

### Phase 1: Scope And Context

Define:

- Business domain
- Departments and roles
- System/module boundaries
- Current pain points
- Critical periods such as month-end, payroll day, settlement day, inventory count, or audit
- Known constraints: legacy ERP, regulations, budget, timeline, integrations

Output:

- Scope summary
- Assumptions
- Missing evidence list

### Phase 2: Process Reconstruction

Reconstruct the real workflow:

1. Trigger
2. Request or data creation
3. Review
4. Approval or confirmation
5. Processing
6. Integration or downstream impact
7. Closing
8. Correction or exception handling
9. Reporting

Check for:

- Steps happening outside the system
- Manual copy/paste or Excel reconciliation
- Informal approval through messenger/email
- Duplicate data entry
- Status values that do not match real work
- Hidden dependencies on a specific person

Output:

- Current process
- Target process hypothesis
- Off-system work list

### Phase 3: Data Analysis

Identify:

- Master data
- Transaction data
- Reference/code data
- Attachments and evidence files
- Audit data
- Calculated/reporting data

Check:

- Duplicate master data
- Missing owner
- Missing required fields
- Free-text fields used as code
- Inconsistent units, dates, tax, currency, or organization criteria
- Unclear source of truth
- No retention or deletion policy

Output:

- Entity map
- Data quality risks
- Data ownership questions

### Phase 4: Permission And Control Analysis

Identify:

- Roles
- Menu/action permissions
- Data scope
- Field-level sensitive information
- Approval authority
- Admin override
- Audit logs

Check:

- Users can see too much data
- Users can edit after approval or closing
- Same person can request and approve
- Downloads are unrestricted
- Admin actions are not logged
- No periodic access review

Output:

- Permission risk list
- Control gap list
- Required approvals/questions

### Phase 5: Integration And Automation Analysis

Identify:

- Connected systems
- Data direction
- Trigger timing
- Retry/failure handling
- Reconciliation method
- Manual fallback

Check:

- Manual file uploads where API would reduce risk
- No duplicate prevention
- No failure visibility
- No ownership for failed sync
- Automation writes data without human review
- AI suggestions are not logged

Output:

- Integration map
- Failure scenarios
- Automation candidates

### Phase 6: UI And Workflow Friction Analysis

Check:

- Too many fields at initial registration
- Required fields that users do not know yet
- No draft state
- No bulk action for repetitive tasks
- Search/filter missing for operational volume
- Status and next action unclear
- Error messages do not tell users how to recover
- Mobile/field worker needs ignored

Output:

- UX friction list
- Screen improvement tasks
- Required bulk actions

### Phase 7: Reporting And Management Analysis

Check:

- KPI definitions unclear
- Report values cannot be reconciled to source transactions
- Reports are exported and manually edited
- No role-based dashboards
- No exception report
- No closing checklist
- No operational SLA metrics

Output:

- Report gap list
- KPI definition questions
- Reconciliation needs

### Phase 8: Findings And Task Generation

For each finding, produce:

- Finding
- Evidence
- Impact
- Root cause hypothesis
- Recommended fix
- Owner
- Priority
- Dependency
- Open question

## 4. Final Analysis Output

Use this structure:

1. 분석 범위
2. 사용한 자료
3. 핵심 발견 요약
4. 현행 업무 흐름
5. 주요 리스크
6. 개선 기회
7. 현업 확인 질문
8. 우선순위 개선 과제
9. 빠른 개선안
10. 중장기 개선안
11. 추가로 필요한 자료

## 5. Evidence Confidence

Label confidence:

| Level | Meaning |
|---|---|
| High | Supported by system data, logs, schema, or multiple sources |
| Medium | Supported by one document or one interview |
| Low | Reasonable inference but needs confirmation |

Do not present inferred workflow as confirmed fact.
