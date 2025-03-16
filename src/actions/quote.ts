'use server'

import { executeQuery, withTransaction } from "@/utils/db";
import { getUserInfo } from "./user";
import { IQuote } from "@/interfaces/request";

/**
 * 공급사가 견적 요청에 대한 새로운 견적을 생성하는 함수
 */
export async function createQuote(data: FormData) {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        // 공급사만 견적 생성 가능
        if (user.role !== 'SUPPLIER') {
            throw new Error('견적을 생성할 권한이 없습니다.');
        }

        const quoteRequestId = data.get('quote_request_id') as string;
        const estimatedCost = Number(data.get('estimated_cost'));
        const productionTime = Number(data.get('production_time'));
        const notes = data.get('notes') as string;

        // 입력값 검증
        if (!quoteRequestId) {
            throw new Error('견적 요청 ID가 유효하지 않습니다.');
        }

        if (!estimatedCost || isNaN(estimatedCost) || estimatedCost <= 0) {
            throw new Error('유효한 견적 금액을 입력해주세요.');
        }

        if (!productionTime || isNaN(productionTime) || productionTime <= 0) {
            throw new Error('유효한 생산 소요 시간을 입력해주세요.');
        }

        return await withTransaction(async (connection) => {
            // 견적 요청이 존재하고 공급사에게 할당되었는지 확인
            const quoteRequests = await connection.execute(
                `SELECT qr.*, r.status as request_status 
                 FROM quote_requests qr
                 JOIN requests r ON qr.request_id = r.id
                 WHERE qr.id = ? AND qr.supplier_id = ? AND r.status IN ('QUOTE_REQUESTED', 'QUOTE_COLLECTING')`,
                [quoteRequestId, user.id]
            );

            const quoteRequestsResult = quoteRequests[0] as any[];

            if (quoteRequestsResult.length === 0) {
                throw new Error('유효하지 않은 견적 요청이거나 접근 권한이 없습니다.');
            }

            // 이미 견적을 제출했는지 확인
            const existingQuotes = await connection.execute(
                `SELECT * FROM quotes WHERE quote_request_id = ?`,
                [quoteRequestId]
            );

            const existingQuotesResult = existingQuotes[0] as any[];

            if (existingQuotesResult.length > 0) {
                throw new Error('이미 해당 견적 요청에 견적을 제출했습니다.');
            }

            // 견적 생성
            await connection.execute(
                `INSERT INTO quotes (
                    quote_request_id, 
                    estimated_cost, 
                    production_time, 
                    notes
                ) VALUES (?, ?, ?, ?)`,
                [quoteRequestId, estimatedCost, productionTime, notes || null]
            );

            // 요청 상태를 '견적 접수 중'으로 업데이트
            const quoteRequest = quoteRequestsResult[0];

            if (quoteRequest.request_status === 'QUOTE_REQUESTED') {
                await connection.execute(
                    `UPDATE requests SET status = 'QUOTE_COLLECTING' WHERE id = ?`,
                    [quoteRequest.request_id]
                );
            }

            return {
                success: true,
                message: '견적이 성공적으로 생성되었습니다.'
            };
        });
    } catch (error) {
        console.error('견적 생성 중 오류:', error);
        throw new Error('견적을 생성하는데 실패했습니다: ' + (error as Error).message);
    }
}

/**
 * 견적 정보 조회 함수
 */
export async function getQuote(quotesId: string) {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        const quotes = await executeQuery<IQuote[]>(
            `SELECT 
                q.*, 
                qr.supplier_id, 
                u.company_name as supplier_name,
                client.id as client_id,
                client.company_name as client_name
             FROM quotes q
             JOIN quote_requests qr ON q.quote_request_id = qr.id
             JOIN users u ON qr.supplier_id = u.id
             JOIN requests r ON qr.request_id = r.id
             JOIN users client ON r.client_id = client.id
             WHERE q.quote_request_id = ?`,
            [quotesId]
        );

        if (!quotes.length) {
            return null;
        }

        const quote = quotes[0];

        // 접근 권한 확인
        if (user.role === 'SUPPLIER' && quote.supplier_id !== user.id) {
            throw new Error('이 견적에 대한 접근 권한이 없습니다.');
        }

        return quote;
    } catch (error) {
        console.error('견적 조회 중 오류:', error);
        throw new Error('견적을 조회하는데 실패했습니다: ' + (error as Error).message);
    }
}

/**
 * 특정 견적을 선정하고 요청 상태를 업데이트하는 함수
 */
export async function selectQuote(quoteId: string, requestId: number) {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        // 파트너사(관리자)나 발주사(클라이언트)만 견적 선정 가능
        if (user.role !== 'DOTCO_ADMIN') {
            throw new Error('견적 선정 권한이 없습니다.');
        }

        // 트랜잭션 사용하여 안전하게 업데이트
        return await withTransaction(async (connection) => {
            // 견적이 존재하는지 확인
            const quoteResult = await connection.execute(
                `SELECT q.*, qr.request_id 
                FROM quotes q 
                JOIN quote_requests qr ON q.quote_request_id = qr.id 
                WHERE q.quotes_id = ? AND qr.request_id = ?`,
                [quoteId, requestId]
            );

            //  견적서 + 

            const quotes = quoteResult[0] as any[];

            if (quotes.length === 0) {
                throw new Error('유효하지 않은 견적이거나 해당 요청에 속하지 않습니다.');
            }

            // 요청 상태 업데이트 및 선택된 견적 설정
            await connection.execute(
                `UPDATE requests 
                SET status = 'QUOTE_CLOSED', selected_quotes_id = ? 
                WHERE id = ?`,
                [quoteId, requestId]
            );

            return {
                success: true,
                message: '견적이 성공적으로 선정되었습니다.'
            };
        });
    } catch (error) {
        console.error('견적 선정 중 오류:', error);
        throw new Error('견적 선정에 실패했습니다: ' + (error as Error).message);
    }
}