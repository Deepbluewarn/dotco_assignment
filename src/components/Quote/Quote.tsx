import { IQuote } from "@/interfaces/request";
import { Card, Group, Stack, Title, Text, Divider, Paper } from "@mantine/core";

export default function Quote({ quote } : { quote: IQuote }) {
    if (!quote) {
        return (
            <Text>견적서가 없습니다.</Text>
        )
    }
    return (
        <Card shadow="sm" withBorder p="lg" mb="xl">
            <Title order={3} mb="md">견적서</Title>

            <Group align="flex-start" grow mb="xl">
                <Stack gap="xs">
                    <Group>
                        <Text fw={500}>견적 금액:</Text>
                        <Text>{Number(quote.estimated_cost).toLocaleString()}원</Text>
                    </Group>

                    <Group>
                        <Text fw={500}>생산 소요 시간:</Text>
                        <Text>{quote.production_time}일</Text>
                    </Group>
                </Stack>

                <Stack gap="xs">
                    <Group>
                        <Text fw={500}>견적 제출일:</Text>
                        <Text>{new Date(quote.created_at).toLocaleDateString()}</Text>
                    </Group>

                    <Group>
                        <Text fw={500}>공급사:</Text>
                        <Text>{quote.supplier_name}</Text>
                    </Group>
                </Stack>

                <Stack gap="xs">
                    <Group>
                        <Text fw={500}>발주사: </Text>
                        <Text>{quote.client_name}</Text>
                    </Group>
                </Stack>
            </Group>

            {quote.notes && (
                <>
                    <Divider my="md" />
                    <Group mb="xs">
                        <Text fw={500}>견적 상세 내용</Text>
                    </Group>
                    <Paper p="md" withBorder>
                        <Text>{quote.notes}</Text>
                    </Paper>
                </>
            )}
        </Card>
    )
}