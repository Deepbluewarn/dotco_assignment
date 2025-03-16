'use client'

import { createQuoteRequest } from "@/actions/requests";
import { IRole, IUserSafe } from "@/interfaces/user";
import { fetchWithType } from "@/utils/common";
import { Button, Checkbox, Flex, Modal, Table, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SUPPLIER_ROLE_NAME: IRole = 'SUPPLIER';
interface ISupplierList {
    success: boolean;
    data: IUserSafe[];
}

export default function RequestDetailsAdmin({ requestId } : { requestId: number }) {
    const [opened, { open, close }] = useDisclosure(false);
    const [suppliers, setSuppliers] = useState<IUserSafe[] | null>([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
    const router = useRouter();
    
    const request = async () => {
        try {
            const res = await createQuoteRequest(requestId, selectedSuppliers);
    
            alert(res.message);
            location.reload();
            router.refresh();
        } catch(err) {
            alert(err)
        }
    }

    useEffect(() => {
        const asyncFn = async () => {
            const res = await fetchWithType<ISupplierList>(`/api/users?role=${SUPPLIER_ROLE_NAME}`);
            console.log(res.data);
            setSuppliers(res.data);
        }

        asyncFn()
    }, []);

    const rows = suppliers?.map(s => (
        <Table.Tr key={s.company_name}>
            <Table.Td>
                <Checkbox
                    aria-label="Select row"
                    checked={selectedSuppliers.includes(s.id)}
                    onChange={(event) =>
                        setSelectedSuppliers(
                            event.currentTarget.checked
                                ? [...selectedSuppliers, s.id]
                                : selectedSuppliers.filter((id) => id !== s.id)
                        )
                    }
                />
            </Table.Td>
            <Table.Td>{s.company_name}</Table.Td>
            <Table.Td>{s.name}</Table.Td>
            <Table.Td>{s.contact}</Table.Td>
            <Table.Td>{new Date(s.created_at).toDateString()}</Table.Td>
        </Table.Tr>
    ))

    return (
        <>
            <Modal opened={opened} onClose={close} title="공급사 선택">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th />
                            <Table.Th>회사명</Table.Th>
                            <Table.Th>이름</Table.Th>
                            <Table.Th>연락처</Table.Th>
                            <Table.Th>가입일</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>

                {
                    selectedSuppliers.length > 0 ? (
                        <Button onClick={request}>{selectedSuppliers.length}개 공급사에 견적 요청</Button>
                    ) : null
                }
            </Modal>

            <Button onClick={open}>견적 요청</Button>
        </>

    )
}