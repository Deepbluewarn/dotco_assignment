'use server'

import { executeQuery, executeWithConnection, withTransaction } from "@/utils/db";
import { getUserInfo } from "./user"
import { IQuote, IQuoteRequest, IRequest, IRequestDetails, IRequestFile, IRequestWithClient, RequestStatus } from "@/interfaces/request";
import { uploadFileToS3 } from "@/utils/s3";
import { ResultSetHeader } from "mysql2";
import { REQUEST_STATUSES } from "@/utils/request";

export async function createRequest(data: FormData) {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        const userId = user.id;
        const title = data.get('title') as string;
        const description = data.get('description') as string;

        // Insert the request into the database
        const result = await executeQuery<ResultSetHeader>(
            'INSERT INTO requests (client_id, title, description) VALUES (?, ?, ?)',
            [userId, title, description]
        );

        console.log('createRequest data: ', data);

        console.log('createRequest insert result: ', result);
        
        // Get the inserted request ID
        const requestId = result.insertId;
        
        // Handle file uploads (if any)
        const files = data.getAll('file') as File[];
        if (files && files.length > 0) {
            // Process each file
            for (const file of files) {
                if (file.size > 0) {  // Skip empty files
                    // Upload to S3
                    const s3Key = await uploadFileToS3(file, `requests/${requestId}`);
                    
                    // Store file metadata in database
                    await executeQuery(
                        'INSERT INTO files (request_id, filename, size, s3_file_key) VALUES (?, ?, ?, ?)',
                        [
                            requestId,
                            file.name,
                            file.size,
                            s3Key,
                        ]
                    );
                }
            }
        }

        console.log('요청 생성 DB 결과: ', result);
        return { success: true, requestId };

    } catch (error) {
        console.error('요청 생성 중 오류:', error)
        throw new Error('요청을 생성하는데 실패했습니다.')
    }
}

export async function getRequestList() {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            return [];
        }

        // 기본 쿼리 (모든 필드 포함)
        let query = `
            SELECT 
                r.id, 
                r.status, 
                r.title, 
                r.description, 
                r.created_at,
                r.client_id,
                client.company_name as client_name,
                r.selected_quotes_id,
                (
                    SELECT supplier_id 
                    FROM quote_requests qr
                    JOIN quotes q ON q.quote_request_id = qr.id
                    WHERE q.quotes_id = r.selected_quotes_id
                    LIMIT 1
                ) as selected_supplier_id,
                (
                    SELECT u.company_name 
                    FROM quote_requests qr
                    JOIN quotes q ON q.quote_request_id = qr.id
                    JOIN users u ON qr.supplier_id = u.id
                    WHERE q.quotes_id = r.selected_quotes_id
                    LIMIT 1
                ) as selected_supplier_name
            FROM requests r
            JOIN users client ON r.client_id = client.id
        `;

        let params = [];

        // 권한에 따른 필터링
        if (user.role === 'CLIENT') {
            query += ' WHERE r.client_id = ?';
            params.push(user.id);
        }
        
        // 정렬
        query += ' ORDER BY r.created_at DESC';

        return await executeQuery<IRequest[]>(query, params);
    } catch (error) {
        console.error('요청 목록 조회 중 오류:', error);
        throw new Error('요청 목록을 조회하는데 실패했습니다.');
    }
}

export async function getQuoteRequests() {
    try {
        const user = await getUserInfo(false);

        if (!user || user.role !== 'SUPPLIER') {
            throw new Error('권한이 없습니다.');
        }

        const quoteRequests = await executeQuery<IQuoteRequest[]>(
            `SELECT 
                qr.id, 
                qr.request_id, 
                qr.supplier_id,
                supplier.company_name as supplier_name, 
                r.status, r.title, r.description, r.created_at,
                r.client_id,
                client.company_name as client_name,
                (SELECT COUNT(*) FROM quotes q WHERE q.quote_request_id = qr.id) > 0 as has_quote
             FROM quote_requests qr
             JOIN users supplier ON qr.supplier_id = supplier.id
             JOIN requests r ON r.id = qr.request_id
             JOIN users client ON r.client_id = client.id
             WHERE qr.supplier_id = ?
             ORDER BY qr.created_at DESC`,
            [user.id]
        );

        return quoteRequests;
    } catch (error) {
        console.error('견적 요청 조회 중 오류:', error);
        throw new Error('견적 요청을 조회하는데 실패했습니다.');
    }
}

/**
 * 특정 견적 요청 정보 조회 (공급사가 견적 작성을 위해 필요)
 */
export async function getQuoteRequestWithDetails(quoteRequestId: number) {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        // 발주사는 견적 요청 정보를 조회할 수 없음.
        if (user.role === 'CLIENT') {
            throw new Error('견적 요청 정보를 조회할 권한이 없습니다.');
        }

        console.log('getQuoteRequestWithDetails quoteRequestId: ', quoteRequestId)

        console.log('getQuoteRequestWithDetails user: ', user)

        const quoteRequests = await executeQuery<IQuoteRequest[]>(
            `SELECT 
                qr.id, 
                qr.request_id, 
                qr.supplier_id,
                r.title, 
                r.description,
                r.status,
                u.company_name as supplier_name,
                r.client_id,
                client.company_name as client_name,
                qr.created_at,
                (SELECT COUNT(*) FROM quotes q WHERE q.quote_request_id = qr.id) > 0 as has_quote
             FROM quote_requests qr
             JOIN requests r ON qr.request_id = r.id
             JOIN users u ON r.client_id = u.id
             JOIN users client ON r.client_id = client.id
             WHERE qr.id = ?`,
            [quoteRequestId]
        );

        if (quoteRequests.length === 0) {
            return null;
        }

        return quoteRequests[0];
    } catch (error) {
        console.error('견적 요청 정보 조회 중 오류:', error);
        throw new Error('견적 요청 정보를 조회하는데 실패했습니다: ' + (error as Error).message);
    }
}

// 특정 요청 상세 정보 조회
export async function getRequestDetail(requestId: number): Promise<IRequestDetails | null> {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        // 요청 기본 정보 조회
        const requests = await executeQuery<IRequestWithClient[]>(
            `SELECT r.*, u.company_name as client_name, u.name as client_contact_name
             FROM requests r
             JOIN users u ON r.client_id = u.id
             WHERE r.id = ?`,
            [requestId]
        );

        if (requests.length === 0) {
            return null;
        }

        const request = requests[0];

        // 접근 권한 확인
        if (user.role === 'CLIENT' && request.client_id !== user.id) {
            throw new Error('이 요청에 대한 접근 권한이 없습니다.');
        }

        let quoteRequestsQuery = `SELECT 
                qr.id, 
                qr.request_id, 
                qr.supplier_id, 
                u.company_name as supplier_name,
                r.client_id,
                client.company_name as client_name,
                r.status, r.title, r.description,
                qr.created_at,
                (SELECT COUNT(*) FROM quotes q WHERE q.quote_request_id = qr.id) > 0 as has_quote
            FROM quote_requests qr
            JOIN users u ON qr.supplier_id = u.id
            JOIN requests r ON qr.request_id = r.id
            JOIN users client ON r.client_id = client.id
            WHERE qr.request_id = ?`;
        let params = [requestId];

        if (user.role === 'SUPPLIER') {
            quoteRequestsQuery += ' AND qr.supplier_id = ?';
            params.push(user.id);
        }

        // 견적 요청 정보 조회 (공급사 정보 포함)
        const quoteRequests = await executeQuery<IQuoteRequest[]>(
            quoteRequestsQuery, params
        );

        if (quoteRequests.length === 0) {
            throw new Error('요청 상세 정보를 찾을 수 없습니다. 권한이 없거나 정보가 존재하지 않습니다.');
        }

        // 첨부 파일 정보 조회
        const files = await executeQuery<IRequestFile[]>(
            `SELECT * FROM files WHERE request_id = ?`,
            [requestId]
        );

        // 견적서 정보 조회
        const quotes = await executeQuery<IQuote[]>(
            `SELECT 
                q.*, 
                qr.supplier_id, 
                u.company_name as supplier_name,
                client.id as client_id,
                client.company_name as client_company_name
             FROM quotes q
             JOIN quote_requests qr ON q.quote_request_id = qr.id
             JOIN requests r ON q.quote_request_id = r.id
             JOIN users u ON qr.supplier_id = u.id
             JOIN users client ON r.client_id = client.id
             WHERE qr.request_id = ?`,
            [requestId]
        );

        return {
            ...request,
            files,
            quoteRequests,
            quotes
        };
    } catch (error) {
        console.error('요청 상세 조회 중 오류:', error);
        throw new Error('요청 정보를 조회하는데 실패했습니다: ' + (error as Error).message);
    }
}

// 요청 상태 업데이트 (파트너사/관리자만 가능)
export async function updateRequestStatus(requestId: number, newStatus: RequestStatus) {
    try {
        const user = await getUserInfo(false);
        let status = [...REQUEST_STATUSES];

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        if (user.role === 'CLIENT') {
            throw new Error('상태 변경 권한이 없습니다.');
        }

        if (user.role === 'SUPPLIER') {
            // 해당 요청에 대한 견적이 선정되었는지 확인
            // 공급사는 선정된 요청에 한해 발주 확정 및 진행 중으로만 변경 가능.
            const quoteRequests = await executeQuery(
                `SELECT * FROM quote_requests qr
                 JOIN requests r ON qr.request_id = r.id
                 WHERE qr.request_id = ? AND qr.supplier_id = ? AND r.selected_quotes_id IS NOT NULL`,
                [requestId, user.id]
            );

            if ((quoteRequests as any[]).length === 0) {
                throw new Error('상태 변경 권한이 없습니다.');
            }

            status = ['ORDER_CONFIRMED', 'IN_PROGRESS'];
        }

        if (status.indexOf(newStatus) === -1) {
            throw new Error('상태 변경 권한이 없습니다.');
        }

        // 상태 업데이트
        await executeQuery(
            `UPDATE requests SET status = ? WHERE id = ?`,
            [newStatus, requestId]
        );

        return { success: true };
    } catch (error) {
        console.error('요청 상태 업데이트 중 오류:', error);
        throw new Error('요청 상태를 업데이트하는데 실패했습니다: ' + (error as Error).message);
    }
}

/**
 * 파트너사(닷코)가 특정 요청에 여러 공급사를 지정하여 견적을 요청하는 함수
 * SQL 트랜잭션과 서브쿼리 활용 버전
 */
export async function createQuoteRequest(requestId: number, supplierIds: number[]) {
    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        // 파트너사(관리자)만 견적 요청 생성 가능
        if (user.role !== 'DOTCO_ADMIN') {
            throw new Error('견적 요청 생성 권한이 없습니다.');
        }
        
        return await withTransaction(async (connection) => {
            // 2. 유효한 공급사 ID만 필터링
            const validSuppliersResult = await executeWithConnection<{supplier_id: number}[]>(
                connection,
                `SELECT id as supplier_id FROM users 
                 WHERE id IN (${supplierIds.map(() => '?').join(',')}) AND role = 'SUPPLIER' AND
                 id NOT IN (SELECT supplier_id FROM quote_requests WHERE request_id = ?)`,
                [...supplierIds, requestId]
            );

            console.log('validSuppliersResult: ', validSuppliersResult)
            
            const validSupplierIds = validSuppliersResult.map(s => s.supplier_id);
            
            if (validSupplierIds.length === 0) {
                throw new Error('요청 가능한 유효한 공급사가 없습니다.');
            }
            
            // 3. 유효한 공급사들에게 견적 요청 생성
            for (const supplierId of validSupplierIds) {
                await executeWithConnection(
                    connection,
                    `INSERT INTO quote_requests (request_id, supplier_id) VALUES (?, ?)`,
                    [requestId, supplierId]
                );
            }
            
            // 4. 요청 상태를 '견적 요청됨'으로 업데이트
            await executeWithConnection(
                connection,
                `UPDATE requests SET status = 'QUOTE_REQUESTED' WHERE id = ?`,
                [requestId]
            );
            
            return { 
                success: true,
                message: `${validSupplierIds.length}개의 견적 요청이 생성되었습니다.`,
                supplierIds: validSupplierIds
            };
        });
        
    } catch (error) {
        console.error('견적 요청 생성 중 오류:', error);
        throw new Error('견적 요청을 생성하는데 실패했습니다: ' + (error as Error).message);
    }
}