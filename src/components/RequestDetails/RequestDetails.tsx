'use client'

import { IRequestDetails } from "@/interfaces/request";
import { IUserSafe } from "@/interfaces/user";
import { getStatusMetadata, REQUEST_STATUS_META } from "@/utils/request";
import { Box, Flex, Select, Text } from '@mantine/core';
import Link from "next/link";
import { useState } from "react";
import RequestDetailsAdmin from "./Admin";
import QuoteRequestList from "./QuoteRequestList";

export default function RequestDetails(
    { requestDetails, userInfo }: 
    { requestDetails: IRequestDetails, userInfo: IUserSafe }
) {
    const statusMetadata = getStatusMetadata(requestDetails.status);

    if (!statusMetadata) {
        return null;
    }
    const userRole = userInfo.role;
    const [ requestStatus, setRequestStatus ] = useState<string | null>(statusMetadata.label);

    return (
        <>
            <Text>제목: {requestDetails.title}</Text>
            <Text>설명: {requestDetails.description}</Text>
            <Text>요청 생성일: {new Date(requestDetails.created_at).toDateString()}</Text>
            <Select
                label="요청 상태"
                value={requestStatus}
                onChange={setRequestStatus}
                disabled={userRole === 'CLIENT'}
                data={REQUEST_STATUS_META.map(meta => meta.label)}
            />

            {/* 공통 영역 */}
            <Box>
                <Text>첨부파일</Text>
                <Flex gap={8}>
                    {
                        requestDetails.files.map(file => {
                            return <Link key={file.file_id} href={`/api/file/${file.file_id}`}>{file.filename}</Link>
                        })
                    }
                </Flex>

            </Box>

            <Text>공급사: {requestDetails.selected_quotes_id ?? '미정'}</Text>

            {/* 관리자 */}

            <RequestDetailsAdmin requestId={requestDetails.id}/>

            <QuoteRequestList quoteRequestList={requestDetails.quoteRequests}/>
        </>
    )
}