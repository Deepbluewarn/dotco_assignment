'use client'

import { Button, TextInput, Textarea, Group, FileInput, Box } from '@mantine/core'
import { useState } from 'react'
import { createRequest } from '@/actions/requests'
import { useRouter } from 'next/navigation'

export default function RequestForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>();

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);

        let resultMsg = '';

        try {
            await createRequest(formData)
            resultMsg = '요청이 생성되었습니다.';
        } catch (error) {
            console.error('요청 제출 오류:', error)
            resultMsg = '요청 생성 중 문제가 발생했습니다.';
        } finally {
            setIsSubmitting(false);
            alert(resultMsg);

            router.replace('/request/list');
        }
    }

    return (
        <Box maw={600}>
            <form action={handleSubmit}>
                <TextInput
                    label="제목"
                    name="title"
                    placeholder="요청 제목을 입력하세요"
                    required
                    mb="md"
                />

                <Textarea
                    label="상세 설명"
                    name="description"
                    placeholder="요청에 대한 상세 내용을 입력하세요"
                    minRows={4}
                    mb="md"
                />

                <FileInput
                    label="설계도 파일 첨부"
                    name="file"
                    placeholder="파일을 선택하세요"
                    multiple
                    mb="xl"
                    value={files}
                    onChange={setFiles}
                />

                <Group justify="flex-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? '제출 중...' : '요청 제출'}
                    </Button>
                </Group>
            </form>
        </Box>
    )
}