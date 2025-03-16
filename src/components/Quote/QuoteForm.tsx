'use client';

import { useState } from 'react';
import { createQuote } from '@/actions/quote';
import { useRouter } from 'next/navigation';
import { Card, Textarea, NumberInput, Button, Group, Text, Alert } from '@mantine/core';

interface QuoteFormProps {
    quoteRequestId: string;
}

export default function QuoteForm({ quoteRequestId }: QuoteFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleCreateQuote = async (formData: FormData) => {
        // 서버 액션에 필요한 ID 추가
        formData.append('quote_request_id', quoteRequestId);
        
        try {
            const result = await createQuote(formData);
            
            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.message || '견적 생성 중 오류가 발생했습니다.');
            }
        } catch (error: any) {
            setError(error.message || '견적 생성 중 오류가 발생했습니다.');
        } finally {
            setError(null);
        }
    }

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            {
                error
            }
            {success ? (
                <Alert title="견적 제출 완료" color="green" variant="filled">
                    견적이 성공적으로 제출되었습니다.
                </Alert>
            ) : (
                <form action={handleCreateQuote}>
                    <NumberInput
                        withAsterisk
                        label="견적 금액 (원)"
                        name='estimated_cost'
                        placeholder="견적 금액을 입력하세요"
                        mb="md"
                        min={0}
                    />

                    <NumberInput
                        withAsterisk
                        label="생산 소요 시간 (일)"
                        name='production_time'
                        placeholder="생산 완료까지 소요되는 일수"
                        mb="md"
                        min={1}
                    />

                    <Textarea
                        label="견적 상세 내용"
                        name='notes'
                        placeholder="견적에 대한 상세 설명, 특이사항 등을 기재해주세요"
                        mb="xl"
                        minRows={4}
                    />

                    <Group justify="flex-end">
                        <Button 
                            variant="outline" 
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            취소
                        </Button>
                        <Button 
                            type="submit" 
                            loading={isSubmitting}
                        >
                            견적 제출하기
                        </Button>
                    </Group>
                </form>
            )}
        </Card>
    );
}