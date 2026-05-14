# Data Spec Template

Use this reference when defining ERP data entities, fields, validation rules, ownership, migration, retention, integration mapping, and audit history.

## 1. Data Specification Overview

| 항목 | 내용 |
|---|---|
| 시스템/모듈 | 예: 재고 입출고 관리 |
| 데이터 목적 | 예: 창고별 품목 수량과 이동 이력 관리 |
| 주요 사용자 | 예: 물류 담당자, 재고 관리자, 회계 담당자 |
| 기준정보 소유 부서 | 예: 물류팀, 상품기획팀 |
| 트랜잭션 소유 부서 | 예: 창고 운영팀 |
| 연동 시스템 | 예: WMS, 회계 ERP, 쇼핑몰 |
| 보관 기간 | 예: 5년, 회계 데이터는 법정 기준 적용 |

## 2. Data Classification

| 분류 | 설명 | 예시 | 변경 빈도 | 소유자 |
|---|---|---|---|---|
| Master Data | 업무 기준이 되는 기본 데이터 | 고객, 품목, 거래처, 직원, 창고 | 낮음 | 기준정보 담당 |
| Transaction Data | 업무 발생 기록 | 주문, 발주, 입고, 전표, 결재 | 높음 | 업무 담당 |
| Reference Data | 코드와 분류 | 상태, 유형, 단위, 세율, 지역 | 낮음 | 시스템 관리자 |
| Derived Data | 계산 또는 집계 데이터 | 잔액, 가용재고, 합계, 마진 | 자동 | 시스템 |
| Audit Data | 변경/승인/접근 이력 | 변경 전후 값, 승인자, IP | 자동 | 시스템 |
| Attachment Data | 증빙 파일 | 계약서, 견적서, 영수증, 이미지 | 중간 | 업무 담당 |

## 3. Entity List

| 엔티티 | 분류 | 설명 | 주요 키 | 소유 부서 | 생성 주체 | 수정 주체 | 연동 여부 |
|---|---|---|---|---|---|---|---|
| Item | Master | 품목 기준정보 | item_id | 상품/물류 | 관리자 | 관리자 | WMS/쇼핑몰 |
| Warehouse | Master | 창고 기준정보 | warehouse_id | 물류 | 관리자 | 관리자 | WMS |
| StockTransaction | Transaction | 입출고/이동 기록 | tx_id | 물류 | 사용자/연동 | 제한 | 회계/WMS |
| StockBalance | Derived | 현재 재고 수량 | item_id + warehouse_id | 시스템 | 시스템 | 시스템 | BI |

## 4. Field Dictionary

| 필드 | 설명 | 타입 | 길이/형식 | 필수 | 기본값 | 예시 | 입력 주체 | 수정 가능 조건 | 이력 |
|---|---|---|---|---:|---|---|---|---|---:|
| item_code | 품목 코드 | string | 30 | Y | 없음 | SKU-001 | 관리자 | 사용 전 | Y |
| item_name | 품목명 | string | 100 | Y | 없음 | 프리미엄 샴푸 | 관리자 | 상시 | Y |
| status | 상태 | enum | active/inactive | Y | active | active | 관리자 | 관리자만 | Y |
| unit | 기본 단위 | enum | EA/BOX/KG | Y | EA | EA | 관리자 | 재고 발생 전 | Y |
| created_at | 생성일시 | datetime | ISO 8601 | Y | 자동 | 2026-05-14T09:00:00 | 시스템 | 불가 | N |
| updated_by | 최종 수정자 | user_id | - | Y | 자동 | user_123 | 시스템 | 불가 | N |

## 5. Validation Rules

| 대상 | 규칙 | 오류 메시지 | 적용 시점 | 예외 |
|---|---|---|---|---|
| 품목 코드 | 중복 불가 | 이미 사용 중인 품목 코드입니다. | 저장 시 | 없음 |
| 기본 단위 | 재고 발생 후 변경 불가 | 재고 이력이 있는 품목은 단위를 변경할 수 없습니다. | 수정 시 | 관리자 보정 절차 |
| 입고 수량 | 0보다 커야 함 | 입고 수량은 0보다 커야 합니다. | 저장 시 | 없음 |
| 출고 수량 | 가용재고 이하 | 가용재고를 초과하여 출고할 수 없습니다. | 확정 시 | 음수재고 허용 창고 제외 |
| 거래일 | 마감월 이전 불가 | 마감된 기간의 거래는 등록할 수 없습니다. | 확정 시 | 마감 해제 승인 |

## 6. Relationship And Key Rules

| 관계 | 설명 | 기준 |
|---|---|---|
| Item 1:N StockTransaction | 한 품목은 여러 입출고 이력을 가진다 | item_id |
| Warehouse 1:N StockTransaction | 한 창고는 여러 입출고 이력을 가진다 | warehouse_id |
| StockTransaction N:1 User | 입출고는 처리자를 가진다 | user_id |
| StockTransaction N:1 Approval | 특정 거래는 승인 문서를 가진다 | approval_id |

Key rules:

- Business key와 system key를 구분한다.
- 외부 시스템 코드가 있으면 external_id를 별도 관리한다.
- 삭제 대신 inactive, canceled, closed 같은 상태값을 우선 검토한다.
- 변경 이력이 필요한 기준정보는 valid_from, valid_to, revision_no를 고려한다.

## 7. Data Lifecycle

| 단계 | 설명 | 담당 | 통제 |
|---|---|---|---|
| 생성 | 신규 데이터 등록 또는 연동 수신 | 업무 담당/시스템 | 필수값 검증 |
| 검토 | 중복, 정확성, 승인 필요 여부 확인 | 검토자 | 중복 검사 |
| 사용 | 거래/리포트/연동에서 참조 | 전체 | 권한 제한 |
| 변경 | 정책에 따라 수정 | 소유 부서 | 변경 이력 |
| 비활성 | 더 이상 신규 거래에 사용하지 않음 | 관리자 | 참조 이력 유지 |
| 보관 | 법정/업무 기준에 따라 보관 | 시스템 | 접근 제한 |
| 파기 | 보관 기간 종료 후 삭제/익명화 | 관리자 | 파기 로그 |

## 8. Migration Checklist

| 항목 | 확인 내용 |
|---|---|
| 원천 데이터 | 기존 ERP, 엑셀, DB, SaaS export 등 출처 확인 |
| 매핑 | 기존 필드와 신규 필드 매핑 |
| 정제 | 중복, 공백, 코드 불일치, 형식 오류 정리 |
| 기준일 | 마이그레이션 기준일과 cutover 시점 |
| 검증 | 건수, 합계, 잔액, 샘플 상세 검증 |
| 롤백 | 실패 시 이전 시스템으로 복구 가능한가 |
| 책임자 | 현업 검수자와 최종 승인자 |

## 9. Integration Mapping

| 내부 필드 | 외부 시스템 | 외부 필드 | 방향 | 변환 규칙 | 실패 처리 |
|---|---|---|---|---|---|
| item_code | WMS | sku | 양방향 | 대문자 변환 | 오류 큐 |
| item_name | WMS | sku_name | ERP -> WMS | 원문 전송 | 재시도 |
| stock_qty | BI | quantity | ERP -> BI | 일 단위 집계 | 다음 배치 |
| tx_date | 회계 ERP | posting_date | ERP -> 회계 | 확정일 기준 | 수동 재처리 |

## 10. Open Questions

- 기준정보의 최종 소유 부서는 어디인가?
- 코드 체계는 기존 코드를 유지하는가, 새로 설계하는가?
- 중복 데이터는 자동 병합하는가, 수동 검토하는가?
- 데이터 변경 이력은 어떤 필드까지 보존해야 하는가?
- 마감 후 데이터 보정은 원거래 수정인가, 보정거래 생성인가?
- 개인정보나 민감정보가 포함되는가?
- 외부 시스템과의 정합성 검증 리포트가 필요한가?
