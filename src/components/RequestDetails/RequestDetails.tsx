'use client'

import { IRequestDetails, RequestStatus } from "@/interfaces/request";
import { IUserSafe } from "@/interfaces/user";
import { getStatusMetadata, REQUEST_STATUS_META } from "@/utils/request";
import { Box, Button, ComboboxItem, Flex, Select, Text, Title } from '@mantine/core';
import { useState } from "react";
import RequestDetailsAdmin from "./Admin";
import QuoteRequestList from "./QuoteRequestList";
import Attachments from "../Attachments";
import { updateRequestStatus } from "@/actions/requests";
import { useRouter } from "next/navigation";
import Quote from "../Quote/Quote";

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
    const router = useRouter();
    const saveStatus = async () => {
        const res = await updateRequestStatus(requestDetails.id, requestStatus?.value as RequestStatus);

        if (res.success) {
            router.refresh()
        }
    }
    
    return (
        <>
            <Text>발주사: {requestDetails.client_name}</Text>
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

            <Title order={4}>확정 견적서</Title>

            <Quote quote={
                requestDetails.quotes.filter(
                    q => q.quotes_id === requestDetails.selected_quotes_id
                )[0]
            }/>

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