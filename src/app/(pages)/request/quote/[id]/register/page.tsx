import { redirect } from "next/navigation";
import { getUserInfo } from "@/actions/user";
import { Box, Text, Title } from '@mantine/core';
import { getQuoteRequestWithDetails } from "@/actions/requests";
import QuoteForm from "@/components/Quote/QuoteForm";

export default async function RegisterQuote(
    { params }:
    { params: Promise<{id: string}> }
) {
    const { id } = await params; // quote request ID

    const user = await getUserInfo(true);
    
    if (!user) {
        return <Text>로그인이 필요합니다.</Text>
    }

    if (user.role !== 'SUPPLIER') {
        return <Text>공급사가 아닙니다.</Text>
    }

    const quoteRequest = await getQuoteRequestWithDetails(parseInt(id));
    
    if (!quoteRequest) {
        return <Text>견적 요청 정보를 찾을 수 없습니다.</Text>
    }
    
    if (quoteRequest.supplier_id !== user.id) {
        return <Text>해당 견적 요청에 대한 권한이 없습니다.</Text>
    }
    
    if (quoteRequest.has_quote) {
        redirect(`/request/quote/${id}/edit`);
    }

    return (
        <Box >
            <Title>견적서 작성</Title>
            
            <Box>
                <Title order={2}>요청 정보</Title>
                <Text className="font-medium">요청 제목: {quoteRequest.title}</Text> 
                <Text className="font-medium">요청 내용: {quoteRequest.description}</Text> 
                <Text className="font-medium">공급사: {quoteRequest.supplier_name}</Text> 
                <Text className="font-medium">요청일: {new Date(quoteRequest.created_at).toLocaleDateString()}</Text>
            </Box>
            
            <QuoteForm quoteRequestId={id} />
        </Box>
    );
}