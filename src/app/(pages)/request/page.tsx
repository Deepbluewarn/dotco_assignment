import { getUserInfo } from "@/actions/user";
import RequestForm from "@/components/RequestForm";
import { Text, Title } from "@mantine/core";

export default async function Request() {
    const user = await getUserInfo(true);

    if (!user) {
        return <Text>로그인이 필요합니다.</Text>;
    }

    if (user.role !== 'CLIENT') {
        return <Text>요청은 발주사만 작성할 수 있습니다.</Text>;
    }

    return (
        <>
            <Title>요청 작성</Title>
            <Text>새로운 요청을 작성합니다.</Text>

            <RequestForm />
        </>
    )
}