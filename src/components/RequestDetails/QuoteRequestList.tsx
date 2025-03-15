'use client'

import { IQuoteRequest } from "@/interfaces/request"
import { Table, Title } from "@mantine/core"

export default function QuoteRequestList({ quoteRequestList }: { quoteRequestList: IQuoteRequest[] }) {
    const rows = quoteRequestList.map(qr => (
        <Table.Tr key={qr.id}>
            <Table.Td>{qr.request_id}</Table.Td>
            <Table.Td>{qr.supplier_name}</Table.Td>
            <Table.Td>{new Date(qr.created_at).toDateString()}</Table.Td>
            <Table.Td>견적서 확인</Table.Td>
        </Table.Tr>
    ))

    return (
        <>
            <Title order={4}>견적 요청 목록</Title>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>요청 ID</Table.Th>
                        <Table.Th>공급사</Table.Th>
                        <Table.Th>생성일</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </>
    )
}