'use client';

import { useState } from 'react';
import { Button, Text, Modal, Group } from '@mantine/core';
import { selectQuote } from '@/actions/quote';
import { useRouter } from 'next/navigation';

interface SelectQuoteButtonProps {
    quoteId: string;
    requestId: number;
    userRole: string;
}

export default function SelectQuoteButton({
    quoteId,
    requestId,
    userRole
}: SelectQuoteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // 견적 선정 가능한 사용자만 버튼 표시
    if (userRole !== 'DOTCO_ADMIN') {
        return null;
    }

    const handleSelectQuote = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await selectQuote(quoteId, requestId);

            if (result.success) {
                // 성공 시 모달 닫기 및 페이지 새로고침
                setIsOpen(false);
                router.refresh();
            } else {
                setError(result.message || '견적 선정에 실패했습니다.');
            }
        } catch (err: any) {
            setError(err.message || '견적 선정 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                color="green"
            >
                견적 선정하기
            </Button>

            <Modal
                opened={isOpen}
                onClose={() => setIsOpen(false)}
                title="견적 선정 확인"
                centered
            >
                <Text mb="xl">
                    이 견적을 선정하면 다른 견적은 자동으로 마감되며, 요청 상태가 '견적 마감'으로 변경됩니다.
                    계속하시겠습니까?
                </Text>

                {error && (
                    <Text c="red" mb="md">
                        {error}
                    </Text>
                )}

                <Group justify="flex-end" mt="lg">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        취소
                    </Button>
                    <Button
                        color="green"
                        onClick={handleSelectQuote}
                        loading={isLoading}
                    >
                        확인
                    </Button>
                </Group>
            </Modal>
        </>
    );
}