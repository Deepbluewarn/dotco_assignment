import { getRequestDetail } from "@/actions/requests";
import { getUserInfo } from "@/actions/user";
import RequestDetails from "@/components/RequestDetails/RequestDetails";
import { Title, Text } from "@mantine/core";

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const details = await getRequestDetail(parseInt(id, 10));
    const userInfo = await getUserInfo();

    if (!details) {
        return <Text>상세 정보를 가져올 수 없습니다.</Text>
    }

    if (!userInfo) {
        return <Text>회원 정보를 찾을 수 없습니다.</Text>
    }

    return (
        <>
            <Title>요청 상세</Title>

            <Text>{id}번 요청의 상세 내역입니다.</Text>

            <RequestDetails requestDetails={details} userInfo={userInfo} />
        </>
    )
}