import { getQuoteRequests } from "@/actions/requests";
import { getUserInfo } from "@/actions/user";
import QuoteRequestList from "@/components/RequestDetails/QuoteRequestList";
import { Text } from '@mantine/core';

export default async function RequestList() {
    const userInfo = await getUserInfo();

    if (!userInfo) {
        return <Text>회원 정보를 찾을 수 없습니다.</Text>
    }
    const userRole = userInfo.role;

    if (userRole === 'SUPPLIER') {
        // 회사로 들어온 발주 요청 목록을 조회한다.
        const list = await getQuoteRequests();
        return <QuoteRequestList quoteRequestList={list}/>
    } else {
        return <RequestList />
    }

    
}