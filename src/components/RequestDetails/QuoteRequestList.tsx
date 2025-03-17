import { IQuoteRequest } from "@/interfaces/request"
import { Button, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from "@mantine/core"
import Link from "next/link";
import StatusBadge from "../StatusBadge";

function getQuoteActionLink(quoteRequest: IQuoteRequest) {
    if (quoteRequest.has_quote) {
        return (
            <Button
                component={Link}
                href={`/request/quote/${quoteRequest.id}`}
                size="xs"
                variant="light"
                color="blue"
            >
                견적서 확인
            </Button>
        );
    } else {
        return (
            <Button
                component={Link}
                size="xs"
                href={`/request/quote/${quoteRequest.id}/register`}
                variant="light"
                color="green"
            >
                견적서 등록
            </Button>
        );
    }
}

function RequestDetailLink({ request_id } : { request_id: number }) {
    return (
        <Button
            component={Link}
            size="xs"
            href={`/request/details/${request_id}`}
            target="_blank"
            variant="light"
            color="green"
        >
            요청 상세
        </Button>
    )
}

export default function QuoteRequestList({ quoteRequestList }: { quoteRequestList: IQuoteRequest[] }) {
    const rows = quoteRequestList.map(qr => (
        <TableTr key={qr.id}>
            <TableTd>{qr.id}</TableTd>
            <TableTd>
                <RequestDetailLink request_id={qr.request_id}/>
            </TableTd>
            <TableTd>{qr.supplier_name}</TableTd>
            <TableTd>{qr.client_name}</TableTd>
            <TableTd>
                <StatusBadge status={qr.status}/>
            </TableTd>
            <TableTd>{qr.title}</TableTd>
            <TableTd>{qr.description}</TableTd>
            <TableTd>{new Date(qr.created_at).toDateString()}</TableTd>
            <TableTd>{getQuoteActionLink(qr)}</TableTd>
        </TableTr>
    ))

    return (
        <>
            <Title order={4}>견적 요청 목록</Title>
            <Table>
                <TableThead>
                    <TableTr>
                        <TableTh>ID</TableTh>
                        <TableTh>요청 ID</TableTh>
                        <TableTh>공급사</TableTh>
                        <TableTh>발주사</TableTh>
                        <TableTh>상태</TableTh>
                        <TableTh>제목</TableTh>
                        <TableTh>설명</TableTh>
                        <TableTh>생성일</TableTh>
                        <TableTh>견적서</TableTh>
                    </TableTr>
                </TableThead>
                <TableTbody>{rows}</TableTbody>
            </Table>
        </>
    )
}