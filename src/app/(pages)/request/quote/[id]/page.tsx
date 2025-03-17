import { getQuote } from '@/actions/quote';
import { getUserInfo } from '@/actions/user';
import { Paper, Title, Text, Group, Badge, Divider, Stack, Card } from '@mantine/core';
import { getQuoteRequestWithDetails } from '@/actions/requests';
import SelectQuoteButton from '@/components/Quote/SelectQuoteButton';
import Quote from '@/components/Quote/Quote';
import StatusBadge from '@/components/StatusBadge';

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
            
            <Quote quote={quote}/>
            
            {quoteRequest && (
                <Card shadow="sm" withBorder p="lg">
                    <Title order={3} mb="md">발주사 요청 정보</Title>
                    
                    <Group mb="md">
                        <StatusBadge status={quoteRequest.status}/>
                    </Group>
                    
                    <Stack gap="xs" mb="md">
                        <Text fw={500} size="lg">{quoteRequest.title}</Text>
                        
                        <Group>
                            <Text>요청일: {new Date(quoteRequest.created_at).toLocaleDateString()}</Text>
                        </Group>
                    </Stack>

                    <Stack>
                        {quoteRequest.description && (
                            <>
                                <Divider my="md" />
                                <Text fw={500} mb="xs">요청 설명</Text>
                                <Paper p="md" withBorder>
                                    <Text>{quoteRequest.description}</Text>
                                </Paper>
                            </>
                        )}

                        <SelectQuoteButton
                            quoteId={id}
                            requestId={Number(quoteRequest?.request_id)}
                            userRole={user.role}
                        />
                    </Stack>
                </Card>
            )}
        </div>
    );
}
