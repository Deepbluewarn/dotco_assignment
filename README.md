# 금형 주문 관리 시스템
금형 제조 산업을 위한 주문-견적 관리 플랫폼입니다. 이 시스템은 발주사와 공급사 간의 중개를 통한 효율적인 금형 제작 프로세스를 제공합니다.

[데모 사이트](https://dotco-assignment-sjof.vercel.app/)

## 주요 기능
- 요청 관리: 발주사의 제품 요청부터 견적 수집, 제품 검토까지 전체 프로세스를 관리
- 파일 첨부: 도면 및 설계 문서를 안전하게 공유
- 견적 관리: 다양한 공급사로부터 견적서 수집 및 비교
- 상태 추적: 요청부터 완료까지 전체 프로세스 추적

## 기술 스택
- 프론트엔드: Next.js 15, TypeScript, Mantine UI
- 백엔드: Next.js API Routes, Server Actions
- 데이터베이스: MySQL
- 파일 스토리지: AWS S3
- 배포: Vercel

## 주요 구현 내용

### DB 구조
 - `users`: 사용자 정보 저장
    - 역할에 따라 발주사(Client), 공급사(Supplier), 관리자 (Admin)으로 구분
 - `requests`: 발주사의 요청 내역 저장
    - 요청 상태를 나타내는 `status` 필드 (ENUM 타입)
    - `selected_quotes_id`로 최종 선정된 견적서 참조
 - `quotes`: 공급사가 제출한 견적서 정보
    - `quote_request_id`로 어떤 견적 요청에 대한 것인지 참조
    - 견적 금액, 생산 소요 시간 등 포함
 - `quote_requests`: 특정 공급사에 대한 견적 요청 목록 저장
    -  `request_id`와 `supplier_id`로 관계 설정
 - `files`: 첨부파일 메타데이터 저장
    - S3 파일 참조를 위한 key 값이 저장 됨.

[전체 ERD](https://www.erdcloud.com/d/FMg8xZohqZZM7oBhK)

### 상태 관리 흐름

| 단계 | 프로세스 | 주체 | 설명 | 관련 화면 |
|-----|---------|-----|------|---------|
| 1 | **요청 생성** | 발주사 | 새 금형 제작 요청서 작성 및 도면/설계 문서 첨부 | 요청 작성 |
| 2 | **요청 검토** | 관리자 | 요청서 내용 검토 및 승인/반려 결정 | 요청 상세 |
| 3 | **공급사 선정** | 관리자 | 요청에 적합한 공급사 선정 및 견적 요청 발송 | 요청 상세 |
| 4 | **견적 확인** | 공급사 | 할당된 요청 확인 및 견적서 제출 | 견적 요청 목록, 견적서 작성 |
| 5 | **견적 수집** | 관리자 | 제출된 견적서 수집 및 관리 | 견적 상세 |
| 6 | **견적 비교** | 관리자 | 수집된 견적서 비교 및 최종 공급사 선정 | 견적 상세 |
| 7 | **발주 확정** | 공급사 | 요청 사항 최종 검토 및 계약 체결 | 요청 상세 |
| 8 | **생산 관리** | 공급사 | 생산 진행 상태 업데이트 및 관리 | 요청 상세 |
| 9 | **완료 처리** | 공급사/발주사 | 생산 완료 및 최종 납품 확인 | 요청 상세 |

### 파일 첨부 기능 상세
S3와 PreSigned URL 기능을 통한 안전한 파일 첨부 구현
 - FormData를 활용해 S3에 파일 저장
 - 클라이언트의 파일 다운로드 요청
 - S3 pre-signed URL 발급 후 리다이렉션

파일 다운로드를 위한 링크를 클라이언트로 직접 노출시키지 않고 파일을 안전하게 다운로드 할 수 있도록 구현함.

## 시작하기

### 필요사항
 - `node.js` v20.18.0
 - `mysql` 8.0.41
 - `AWS S3`

### 프로젝트 초기화
```bash
git clone https://github.com/username/dotco-assignment.git
cd dotco-assignment
npm i
```

### 환경변수 설정
```
# MYSQL DB 설정
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SALT_ROUND=10

# S3 관련 설정
AWS_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

### 데이터베이스 초기화
데이터베이스 스키마를 생성합니다:

#### MySQL 콘솔에 접속
mysql -u root -p

#### 데이터베이스 생성
CREATE DATABASE dotco_db;
USE dotco_db;

#### 스키마 생성 스크립트 실행
source ./sql/init_query.sql;
exit;

### 프로젝트 실행
```bash
npm run dev
```
