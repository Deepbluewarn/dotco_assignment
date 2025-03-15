import { getRequestList } from "@/actions/requests";
import { Table, TableCaption, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from "@mantine/core";
import Link from "next/link";

export default async function RequestList() {
    const requestList = await getRequestList();

    const rows = requestList.map((r) => (
        <TableTr key={r.id}>
            <TableTd>{r.id}</TableTd>
            <TableTd>{r.selected_quotes_id}</TableTd>
            <TableTd>{r.status}</TableTd>
            <TableTd>{r.title}</TableTd>
            <TableTd>{r.description}</TableTd>
            <TableTd>{new Date(r.created_at).toDateString()}</TableTd>
            <TableTd><Link href={`/request/details/${r.id}`}>상세</Link></TableTd>
        </TableTr>
    ));

    return (
        <>
            <Title>요청 목록</Title>
            <Text>요청 목록을 확인할 수 있습니다.</Text>

            <Table stickyHeader stickyHeaderOffset={60}>
                <TableThead>
                    <TableTr>
                        <TableTh>ID</TableTh>
                        <TableTh>공급사</TableTh>
                        <TableTh>상태</TableTh>
                        <TableTh>제목</TableTh>
                        <TableTh>설명</TableTh>
                        <TableTh>생성일</TableTh>
                        <TableTh></TableTh>
                    </TableTr>
                </TableThead>
                <TableTbody>{rows}</TableTbody>
                <TableCaption>Scroll page to see sticky thead</TableCaption>
            </Table>
        </>
    )
}