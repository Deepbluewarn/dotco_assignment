export type RequestStatus =
    | 'REGISTERED'   // 등록됨
    | 'REVIEWING'    // 검토 중
    | 'APPROVED'     // 승인됨
    | 'QUOTE_REQUESTED' // 견적 요청됨
    | 'QUOTE_COLLECTING' // 견적 접수 중
    | 'QUOTE_CLOSED'  // 견적 마감
    | 'ORDER_CONFIRMED' // 발주 확정됨
    | 'IN_PROGRESS'   // 진행 중
    | 'COMPLETED';    // 완료됨

export interface IRequest {
    id: number;
    client_id: number;
    selected_quotes_id: number | null;
    status: RequestStatus;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    client_name: string;    // 발주사 이름 추가
    selected_supplier_id?: number;   // 선택된 공급사 ID (있는 경우)
    selected_supplier_name?: string; // 선택된 공급사 이름 (있는 경우)
}

export interface IRequestWithClient extends IRequest {
    client_name: string;
    client_contact_name: string;
}

// For files query result
export interface IRequestFile {
    file_id: number;
    request_id: number;
    s3_file_key: string;
    filename: string;
    size: number;
    created_at: string;
}

// For quote requests query result
export interface IQuoteRequest {
    id: number; // 견적 요청 ID
    request_id: number; // 요청 ID
    supplier_id: number;
    supplier_name: string; // 공급사 이름
    client_id: string;
    client_name: string;
    status: RequestStatus;
    title: string;
    description: string;
    created_at: string;
    has_quote?: boolean;
}

// For quotes query result
export interface IQuote {
    quotes_id: number;
    quote_request_id: number;
    estimated_cost: number;
    production_time: number;
    notes: string;
    created_at: string;
    updated_at: string;
    supplier_id: number;
    supplier_name: string;
    client_id: number;
    client_company_name: string;
}

// Final combined result
export interface IRequestDetails extends IRequest {
    client_name: string;
    client_contact_name: string;
    files: IRequestFile[];
    quoteRequests: IQuoteRequest[];
    quotes: IQuote[];
}