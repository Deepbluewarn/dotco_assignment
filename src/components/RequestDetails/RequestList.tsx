import {
    Group,
    Table, TableTbody, TableTd,
    TableTh, TableThead, TableTr,
    Text, Title, Tooltip, Button,
    Paper, Box, ScrollArea
} from "@mantine/core";
import { getRequestList } from "@/actions/requests";
import Link from "next/link";
import {
    IconBuilding, IconUserCheck, IconArrowRight,
    IconChecks, IconClock, IconFileDescription
} from '@tabler/icons-react';
import StatusBadge from "../StatusBadge";

// 클라이언트와 관리자를 위한 요청 목록을 표시하는 컴포넌트
export default async function RequestList() {
    const requestList = await getRequestList();

    const rows = requestList.map((r) => (
        <TableTr key={r.id}>
            <TableTd>{r.id}</TableTd>
            <TableTd>
                <StatusBadge status={r.status} />
            </TableTd>
            <TableTd>
                <Text fw={500} lineClamp={1}>{r.title}</Text>
            </TableTd>
            <TableTd>
                <Text size="sm" c="dimmed" lineClamp={1}>
                    {r.description || '-'}
                </Text>
            </TableTd>
            <TableTd>
                <Tooltip label="발주사">
                    <Group gap="xs">
                        <IconBuilding size={16} style={{ opacity: 0.7 }} />
                        <Text size="sm">{r.client_name}</Text>
                    </Group>
                </Tooltip>
            </TableTd>
            <TableTd>
                {r.selected_supplier_name ? (
                    <Tooltip label="선정된 공급사">
                        <Group gap="xs">
                            <IconUserCheck size={16} style={{ opacity: 0.7 }} />
                            <Text size="sm">{r.selected_supplier_name}</Text>
                        </Group>
                    </Tooltip>
                ) : (
                    <Text size="sm" c="dimmed" fs="italic">미선정</Text>
                )}
            </TableTd>
            <TableTd>
                <Group gap="xs">
                    <IconClock size={16} style={{ opacity: 0.7 }} />
                    <Text size="sm">{new Date(r.created_at).toLocaleDateString()}</Text>
                </Group>
            </TableTd>
            <TableTd>
                <Button
                    component={Link}
                    href={`/request/details/${r.id}`}
                    size="xs"
                    variant="light"
                    rightSection={<IconArrowRight size={14} />}
                >
                    상세보기
                </Button>
            </TableTd>
        </TableTr>
    ));

    return (
        <Paper p="md" radius="md" withBorder>
            <Group mb="md">
                <IconFileDescription size={24} />
                <Title order={3}>요청 목록</Title>
            </Group>
            <Text c="dimmed" mb="lg">요청 목록을 확인하고 상세 내용을 볼 수 있습니다.</Text>

            <Box mb="lg">
                <ScrollArea>
                    <Table stickyHeader highlightOnHover horizontalSpacing="md">
                        <TableThead>
                            <TableTr>
                                <TableTh>ID</TableTh>
                                <TableTh>상태</TableTh>
                                <TableTh>제목</TableTh>
                                <TableTh>설명</TableTh>
                                <TableTh>발주사</TableTh>
                                <TableTh>선정된 공급사</TableTh>
                                <TableTh>생성일</TableTh>
                                <TableTh></TableTh>
                            </TableTr>
                        </TableThead>
                        <TableTbody>
                            {rows.length > 0 ? (
                                rows
                            ) : (
                                <TableTr>
                                    <TableTd colSpan={8} align="center" p="xl">
                                        <Text c="dimmed">요청 내역이 없습니다.</Text>
                                    </TableTd>
                                </TableTr>
                            )}
                        </TableTbody>
                    </Table>
                </ScrollArea>
            </Box>

            <Group justify="flex-end">
                <Button
                    component={Link}
                    href="/request"
                    leftSection={<IconChecks size={16} />}
                >
                    새 요청 작성
                </Button>
            </Group>
        </Paper>
    );
}