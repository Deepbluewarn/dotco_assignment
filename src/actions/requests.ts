'use server'

import { executeQuery, executeWithConnection, withTransaction } from "@/utils/db";
import { getUserInfo } from "./user"
import { IQuote, IQuoteRequest, IRequest, IRequestDetails, IRequestFile, IRequestWithClient, RequestStatus } from "@/interfaces/request";
import { uploadFileToS3 } from "@/utils/s3";
import { ResultSetHeader } from "mysql2";

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

        // 1. 발주사(CLIENT)인 경우 - 자신의 요청만 조회
        if (user.role === 'CLIENT') {
            const requests = await executeQuery<IRequest[]>(
                `SELECT * FROM requests WHERE client_id = ? ORDER BY created_at DESC`,
                [user.id]
            );
            return requests;
        }

        // 2. 파트너사(DOTCO_ADMIN)인 경우 - 비즈니스 관계가 있는 발주사의 요청만 조회
        else if (user.role === 'DOTCO_ADMIN') {
            const requests = await executeQuery<IRequest[]>(
                `SELECT r.*, u.company_name as client_name
                 FROM requests r
                 JOIN users u ON r.client_id = u.id
                 ORDER BY r.created_at DESC`
            );
            return requests;
        }

        // 3. 공급사(SUPPLIER)의 경우 - 직접 요청 목록은 조회 불가능
        else if (user.role === 'SUPPLIER') {
            // 공급사는 요청 목록을 직접 볼 수 없음
            return [];
        }

        return [];
    } catch (error) {
        console.error('요청 조회 중 오류:', error);
        throw new Error('요청을 조회하는데 실패했습니다.');
    }
}

export async function getQuoteRequests() {
    try {
        const user = await getUserInfo(false);

        if (!user || user.role !== 'SUPPLIER') {
            throw new Error('권한이 없습니다.');
        }

        const quoteRequests = await executeQuery<IQuoteRequest[]>(
            `SELECT qr.*, u.company_name as supplier_name
             FROM quote_requests qr
             JOIN users u ON qr.supplier_id = u.id
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

        if (user.role === 'SUPPLIER') {
            // 공급사는 자신에게 견적 요청된 요청만 볼 수 있음
            const quoteRequests = await executeQuery(
                `SELECT * FROM quote_requests 
                 WHERE request_id = ? AND supplier_id = ?`,
                [requestId, user.id]
            );

            if (quoteRequests.length === 0) {
                throw new Error('이 요청에 대한 접근 권한이 없습니다.');
            }
        }

        // 첨부 파일 정보 조회
        const files = await executeQuery<IRequestFile[]>(
            `SELECT * FROM files WHERE request_id = ?`,
            [requestId]
        );

        // 견적 요청 정보 조회 (공급사 정보 포함)
        const quoteRequests = await executeQuery<IQuoteRequest[]>(
            `SELECT qr.*, u.company_name as supplier_name
             FROM quote_requests qr
             JOIN users u ON qr.supplier_id = u.id
             WHERE qr.request_id = ?`,
            [requestId]
        );

        // 견적서 정보 조회
        const quotes = await executeQuery<IQuote[]>(
            `SELECT q.*, qr.supplier_id, u.company_name as supplier_name
             FROM quotes q
             JOIN quote_requests qr ON q.quote_request_id = qr.id
             JOIN users u ON qr.supplier_id = u.id
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

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        // 상태 변경 권한 확인
        if (user.role !== 'DOTCO_ADMIN') {
            // 공급사에게만 제한적으로 허용
            if (user.role === 'SUPPLIER') {
                // 공급사는 '발주 확정됨'과 '진행 중' 상태로만 변경 가능
                if (newStatus !== 'ORDER_CONFIRMED' && newStatus !== 'IN_PROGRESS') {
                    throw new Error('상태 변경 권한이 없습니다.');
                }

                // 해당 요청에 대한 견적이 선정되었는지 확인
                const quoteRequests = await executeQuery(
                    `SELECT * FROM quote_requests qr
                     JOIN requests r ON qr.request_id = r.id
                     WHERE qr.request_id = ? AND qr.supplier_id = ? AND r.selected_quotes_id IS NOT NULL`,
                    [requestId, user.id]
                );

                if ((quoteRequests as any[]).length === 0) {
                    throw new Error('이 요청에 대한 상태 변경 권한이 없습니다.');
                }
            } else {
                throw new Error('상태 변경 권한이 없습니다.');
            }
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
    console.log('createQuoteRequest requestId: ', requestId);
    console.log('createQuoteRequest supplierIds: ', supplierIds);

    try {
        const user = await getUserInfo(false);

        if (!user) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }

        // 파트너사(관리자)만 견적 요청 생성 가능
        if (user.role !== 'DOTCO_ADMIN') {
            throw new Error('견적 요청 생성 권한이 없습니다.');
        }
        
        // Use the transaction helper
        return await withTransaction(async (connection) => {
            // 1. 요청이 존재하고 견적 요청 가능한 상태인지 확인
            const requests = await executeWithConnection<IRequest[]>(
                connection,
                `SELECT * FROM requests WHERE id = ? AND status = 'APPROVED'`,
                [requestId]
            );

            if (requests.length === 0) {
                throw new Error('견적을 요청할 수 없는 상태이거나 요청이 존재하지 않습니다.');
            }
            
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