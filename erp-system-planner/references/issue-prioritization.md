# Issue Prioritization

Use this reference to rank ERP improvements and convert analysis findings into a realistic roadmap.

## 1. Priority Levels

| Priority | Meaning | Examples |
|---|---|---|
| P0 | Must fix immediately because work is blocked or serious risk exists | payment error, payroll exposure, unauthorized access |
| P1 | High-value or high-risk issue for near-term delivery | approval gap, duplicate master data causing settlement errors |
| P2 | Useful improvement with moderate impact | better filters, dashboard refinement, bulk action |
| P3 | Nice-to-have or later optimization | cosmetic UI, advanced analytics, low-volume automation |

## 2. Scoring Model

Score each 1-5.

| Factor | 1 | 3 | 5 |
|---|---|---|---|
| Business impact | minor inconvenience | department-level impact | company-wide financial/operational impact |
| Risk reduction | low | moderate | audit, security, legal, financial control risk |
| Frequency | rare | weekly | daily/high-volume |
| User pain | low | visible frustration | severe bottleneck |
| Data value | no data impact | improves reporting | creates trustworthy source of truth |
| Effort | very high | moderate | low |
| Dependency | many blockers | some dependencies | independent |

Recommended score:

`Priority Score = impact + risk + frequency + pain + data value + effort advantage + dependency advantage`

Treat effort and dependency as advantage scores:

- Low effort = 5
- Medium effort = 3
- High effort = 1
- Independent = 5
- Some dependency = 3
- Many blockers = 1

## 3. Decision Matrix

| Type | Action |
|---|---|
| High impact, low effort | Quick win. Put in next sprint or Phase 1. |
| High impact, high effort | Strategic project. Plan discovery and phased delivery. |
| Low impact, low effort | Batch with related improvements. |
| Low impact, high effort | Defer or reject unless regulatory/strategic reason exists. |
| High risk | Prioritize even if user pain is low. |
| Blocks data integrity | Fix before AI/automation. |

## 4. Roadmap Phasing

### Phase 0: Stabilize

- Security and access risk
- Data corruption risk
- Payment/payroll/accounting errors
- Integration failures with no recovery
- Month-end closing blockers

### Phase 1: Standardize

- Status values
- Master data ownership
- Required fields and validation
- Approval rules
- Basic reports and reconciliation
- Clear screen actions

### Phase 2: Optimize

- Bulk actions
- Better search/filter
- Dashboards
- Automated notifications
- Integration retry and monitoring
- Role-based views

### Phase 3: Automate

- Rule-based approvals
- Document extraction with human review
- Exception routing
- Reconciliation assistance
- Low-risk automated transactions

### Phase 4: Intelligence

- AI recommendations
- Anomaly detection
- Process mining
- Predictive alerts
- Autonomous agent actions within policy

## 5. Prioritized Issue Table

| 우선순위 | 개선 과제 | 근거 | 영향 | 난이도 | 의존성 | 담당 | 다음 액션 |
|---|---|---|---|---|---|---|---|

## 6. Acceptance Criteria Format

Each prioritized task should include:

- User or role
- Trigger
- Required behavior
- Permission/control requirement
- Error/exception behavior
- Logging requirement
- Testable success condition

Example:

As a 구매 담당자, when an approved purchase request is converted to a purchase order, the system must copy approved item, quantity, supplier, and price fields, block price edits unless the user has price override permission, and log any override reason.
