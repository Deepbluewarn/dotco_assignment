'use client'

import { IRequestDetails, RequestStatus } from "@/interfaces/request";
import { IUserSafe } from "@/interfaces/user";
import { getStatusMetadata, REQUEST_STATUS_META } from "@/utils/request";
import { Box, Button, ComboboxItem, Flex, Select, Text } from '@mantine/core';
import { useState } from "react";
import RequestDetailsAdmin from "./Admin";
import QuoteRequestList from "./QuoteRequestList";
import Attachments from "../Attachments";
import { updateRequestStatus } from "@/actions/requests";

export default function RequestDetails(
    { requestDetails, userInfo }:
        { requestDetails: IRequestDetails, userInfo: IUserSafe }
) {
    const statusMetadata = getStatusMetadata(requestDetails.status);

    if (!statusMetadata) {
        return null;
    }
    const userRole = userInfo.role;
    const [requestStatus, setRequestStatus] = useState<ComboboxItem | null>({
        value: statusMetadata.value, label: statusMetadata.label,
    });
    const saveStatus = async () => {
        await updateRequestStatus(requestDetails.id, requestStatus?.value as RequestStatus);
    }
    return (
        <>
            <Text>제목: {requestDetails.title}</Text>
            <Text>설명: {requestDetails.description}</Text>
            <Text>요청 생성일: {new Date(requestDetails.created_at).toDateString()}</Text>
            <Flex direction='column' gap={8}>
                <Select
                    label="요청 상태"
                    value={requestStatus ? requestStatus.value : null}
                    onChange={(_value, option) => setRequestStatus(option)}
                    disabled={userRole === 'CLIENT'}
                    data={REQUEST_STATUS_META.map(meta => ({
                        value: meta.value, label: meta.label
                    }))}
                />
                <Button
                    disabled={statusMetadata.label === requestStatus?.label}
                    onClick={saveStatus}
                >
                    저장
                </Button>
            </Flex>
            
            <Box>
                <Text>첨부파일</Text>
                <Attachments files={requestDetails.files} />
            </Box>

            <Text>공급사: {requestDetails.selected_quotes_id ?? '미정'}</Text>

            {
                userRole !== 'CLIENT' ? (
                    <>
                        <RequestDetailsAdmin requestId={requestDetails.id} />
                        <QuoteRequestList quoteRequestList={requestDetails.quoteRequests} />
                    </>
                ) : null
            }
        </>
    )
}