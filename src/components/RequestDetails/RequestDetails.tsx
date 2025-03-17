'use client'

import { IRequestDetails, RequestStatus } from "@/interfaces/request";
import { IUserSafe } from "@/interfaces/user";
import { getStatusMetadata, REQUEST_STATUS_META } from "@/utils/request";
import { 
    Button, Card, ComboboxItem, Divider, Grid, 
    Group, Paper, Select, Stack, Text, Title, Badge,
    Alert, Tabs
} from '@mantine/core';
import { useState } from "react";
import QuoteRequestList from "./QuoteRequestList";
import Attachments from "../Attachments";
import { updateRequestStatus } from "@/actions/requests";
import { useRouter } from "next/navigation";
import Quote from "../Quote/Quote";
import { 
    IconBuilding, IconCalendarTime, IconCertificate, IconClipboardText, 
    IconFileDescription, IconFolderPlus, IconInfoCircle, IconStatusChange,
} from '@tabler/icons-react';
import StatusBadge from "../StatusBadge";
import Link from "next/link";
import SupplierQuoteRequestManager from "./Admin";

export default function RequestDetails(
    { requestDetails, userInfo }:
        { requestDetails: IRequestDetails, userInfo: IUserSafe }
) {
    const statusMetadata = getStatusMetadata(requestDetails.status);
    const router = useRouter();
    const userRole = userInfo.role;
    
    const [requestStatus, setRequestStatus] = useState<ComboboxItem | null>({
        value: statusMetadata?.value || 'REGISTERED', 
        label: statusMetadata?.label || '등록됨',
    });

    if (!statusMetadata) {
        return (
            <Alert color="red" title="오류">
                유효하지 않은 요청 상태입니다.
            </Alert>
        );
    }
    
    const saveStatus = async () => {
        try {
            const res = await updateRequestStatus(requestDetails.id, requestStatus?.value as RequestStatus);

            if (res.success) {
                router.refresh()
            }
        } catch(err) {
            alert((err as Error).message)
        }        
    }
    
    // 선택된 견적서 찾기
    const selectedQuote = requestDetails.quotes.find(
        q => q.quotes_id === requestDetails.selected_quotes_id
    );
    
    return (
        <Stack gap="lg">
            <Title>요청 상세</Title>
            {/* 기본 요청 정보 카드 */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group mb="md">
                    <Group>
                        <IconClipboardText size={24} />
                        <Title order={3}>요청 상세 정보</Title>
                    </Group>
                    <StatusBadge status={statusMetadata.value} />
                </Group>
                
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Paper p="md" withBorder>
                            <Title order={4} mb="md">{requestDetails.title}</Title>
                            <Text size="sm" c="dimmed" mb="xl">
                                {requestDetails.description || "설명이 없습니다."}
                            </Text>
                            
                            <Divider my="md" />
                            
                            <Group gap="xl">
                                <Group gap="xs">
                                    <IconBuilding size={16} />
                                    <Text fw={500}>발주사:</Text>
                                    <Text>{requestDetails.client_name}</Text>
                                </Group>
                                
                                <Group gap="xs">
                                    <IconCalendarTime size={16} />
                                    <Text fw={500}>생성일:</Text>
                                    <Text>
                                        {new Date(requestDetails.created_at).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </Group>
                            </Group>
                        </Paper>
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Paper p="md" withBorder>
                            <Group mb="md">
                                <IconStatusChange size={20} />
                                <Title order={5}>상태 관리</Title>
                            </Group>
                            
                            <Select
                                label="요청 상태"
                                value={requestStatus ? requestStatus.value : null}
                                onChange={(_value, option) => setRequestStatus(option)}
                                disabled={userRole === 'CLIENT'}
                                data={REQUEST_STATUS_META.map(meta => ({
                                    value: meta.value, 
                                    label: meta.label
                                }))}
                                mb="md"
                            />
                            
                            <Button
                                fullWidth
                                disabled={statusMetadata.label === requestStatus?.label || userRole === 'CLIENT'}
                                onClick={saveStatus}
                                color={userRole === 'CLIENT' ? 'gray' : 'blue'}
                            >
                                {userRole === 'CLIENT' ? '권한 없음' : '상태 변경'}
                            </Button>
                            
                            {userRole === 'CLIENT' && (
                                <Text size="xs" c="dimmed" mt="xs" ta="center">
                                    발주사는 상태를 변경할 수 없습니다.
                                </Text>
                            )}
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Card>
            
            {/* 첨부 파일 섹션 */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group mb="md">
                    <IconFolderPlus size={20} />
                    <Title order={4}>첨부 파일</Title>
                </Group>
                
                <Attachments files={requestDetails.files} />
                
                {(!requestDetails.files || requestDetails.files.length === 0) && (
                    <Text c="dimmed" size="sm" mt="md">첨부된 파일이 없습니다.</Text>
                )}
            </Card>
            
            {/* 확정된 견적서 섹션 */}
            {selectedQuote ? (
                <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Group mb="md">
                        <IconCertificate size={20} color="green" />
                        <Title order={4} c="green">확정 견적서</Title>
                    </Group>
                    
                    <Quote quote={selectedQuote} />
                </Card>
            ) : requestDetails.status !== 'REGISTERED' && (
                <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Group mb="md">
                        <IconInfoCircle size={20} color="orange" />
                        <Title order={4} c="orange">견적서 미확정</Title>
                    </Group>
                    
                    <Text c="dimmed">
                        아직 확정된 견적서가 없습니다. 견적서가 선택되면 여기에 표시됩니다.
                    </Text>
                </Card>
            )}
            
            {/* 관리자 및 공급사용 섹션 */}
            {userRole !== 'CLIENT' && (
                <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Tabs defaultValue="quotes">
                        <Tabs.List mb="md">
                            <Tabs.Tab 
                                value="quotes" 
                                leftSection={<IconFileDescription size={16} />}
                            >
                                견적 요청 목록
                            </Tabs.Tab>
                        </Tabs.List>
                        
                        <Tabs.Panel value="quotes">
                            <QuoteRequestList quoteRequestList={requestDetails.quoteRequests} />
                        </Tabs.Panel>
                    </Tabs>
                </Card>
            )}

            {userRole === 'DOTCO_ADMIN' && (
                <Stack>
                    <SupplierQuoteRequestManager requestId={requestDetails.id} />
                </Stack>
            )}
        </Stack>
    )
}