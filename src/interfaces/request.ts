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
    selected_quotes_id: string | null;
    status: RequestStatus;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
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
    id: number;
    request_id: number;
    supplier_id: number;
    supplier_name: string; // From JOIN with users table
    created_at: string;
    updated_at: string;
}

// For quotes query result
export interface IQuote {
    id: number;
    quote_request_id: number;
    supplier_id: number;
    supplier_name: string; // From JOIN with users table
    price: number;
    description: string;
    delivery_date: string;
    created_at: string;
    updated_at: string;
}

// Final combined result
export interface IRequestDetails extends IRequest {
    client_name: string;
    client_contact_name: string;
    files: IRequestFile[];
    quoteRequests: IQuoteRequest[];
    quotes: IQuote[];
}