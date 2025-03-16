import { getQuote } from '@/actions/quote';
import { getUserInfo } from '@/actions/user';
import { Paper, Title, Text, Group, Badge, Divider, Stack, Card } from '@mantine/core';
import { getQuoteRequestWithDetails } from '@/actions/requests';

export default async function ViewQuote(
    { params }:
    { params: Promise<{id: string}> }
) {
    const { id } = await params;
    const user = await getUserInfo(true);
    
    if (!user) {
        return <Text>회원 정보를 찾을 수 없습니다.</Text>
    }
    
    const quote = await getQuote(id);
    
    if (!quote) {
        return <Text>견적서 정보를 찾을 수 없습니다.</Text>
    }
    
    const quoteRequest = await getQuoteRequestWithDetails(quote.quote_request_id);
    
    return (
        <div className="container mx-auto py-8">
            <Title order={2} mb="lg">견적서 정보</Title>
            
            <Card shadow="sm" withBorder p="lg" mb="xl">
                <Title order={3} mb="md">기본 정보</Title>
                
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
            
            {quoteRequest && (
                <Card shadow="sm" withBorder p="lg">
                    <Title order={3} mb="md">원본 요청 정보</Title>
                    
                    <Group mb="md">
                        <Badge color={getStatusColor(quoteRequest.status)}>{quoteRequest.status}</Badge>
                    </Group>
                    
                    <Stack gap="xs" mb="md">
                        <Text fw={500} size="lg">{quoteRequest.title}</Text>
                        
                        <Group>
                            <Text>요청일: {new Date(quoteRequest.created_at).toLocaleDateString()}</Text>
                        </Group>
                    </Stack>
                    
                    {quoteRequest.description && (
                        <>
                            <Divider my="md" />
                            <Text fw={500} mb="xs">요청 설명</Text>
                            <Paper p="md" withBorder>
                                <Text>{quoteRequest.description}</Text>
                            </Paper>
                        </>
                    )}
                </Card>
            )}
        </div>
    );
}

// 상태에 따른 배지 색상 지정
function getStatusColor(status: string): string {
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