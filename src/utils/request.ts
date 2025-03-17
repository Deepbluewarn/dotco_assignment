import { RequestStatus } from "@/interfaces/request";

interface IRequestStatusMetadata {
    value: RequestStatus;
    label: string;
    index: number;
    description: string;
}
export const REQUEST_STATUSES: RequestStatus[] = [
    'REGISTERED',
    'REVIEWING',
    'APPROVED',
    'QUOTE_REQUESTED',
    'QUOTE_COLLECTING',
    'QUOTE_CLOSED',
    'ORDER_CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED'
];

// Array with metadata (status code, display name, description)
export const REQUEST_STATUS_META: IRequestStatusMetadata[] = [
    { value: 'REGISTERED', label: '등록됨', index: 0, description: '요청이 처음 생성된 상태' },
    { value: 'REVIEWING', label: '검토 중', index: 0, description: '파트너사가 요청을 검토하는 상태' },
    { value: 'APPROVED', label: '승인됨', index: 0, description: '파트너사가 요청을 승인한 상태' },
    { value: 'QUOTE_REQUESTED', label: '견적 요청됨', index: 0, description: '공급사에게 견적이 요청된 상태' },
    { value: 'QUOTE_COLLECTING', label: '견적 접수 중', index: 0, description: '공급사로부터 견적을 받고 있는 상태' },
    { value: 'QUOTE_CLOSED', label: '견적 마감', index: 0, description: '견적 선정이 완료된 상태' },
    { value: 'ORDER_CONFIRMED', label: '발주 확정됨', index: 0, description: '공급사에게 발주가 확정된 상태' },
    { value: 'IN_PROGRESS', label: '진행 중', index: 0, description: '제작이 진행 중인 상태' },
    { value: 'COMPLETED', label: '완료됨', index: 0, description: '모든 작업이 완료된 상태' }
];

// Function to get status display name
export function getStatusMetadata(status: RequestStatus): IRequestStatusMetadata | null {
    const metadata = REQUEST_STATUS_META.find(item => item.value === status);
    return metadata ?? null;
}

// 상태에 따른 배지 색상 지정
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        'REGISTERED': 'gray',
        'REVIEWING': 'blue',
        'APPROVED': 'teal',
        'QUOTE_REQUESTED': 'violet',
        'QUOTE_COLLECTING': 'indigo',
        'QUOTE_CLOSED': 'orange',
        'ORDER_CONFIRMED': 'green',
        'IN_PROGRESS': 'cyan',
        'COMPLETED': 'lime'
    };
    
    return colors[status] || 'gray';
}
