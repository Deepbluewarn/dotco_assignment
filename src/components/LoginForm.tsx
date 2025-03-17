'use client'

import { LoginFormData } from "@/actions/auth";
import useLoginForm from "@/hooks/useLoginForm";
import { Button, Divider, Group, Paper, Text, TextInput, Title, Stack, Alert, Center } from "@mantine/core";
import { IconUser, IconLock, IconAlertCircle, IconArrowRight, IconCheck } from '@tabler/icons-react';
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginForm() {
    const { isLoading, success, errors, handleSubmit } = useLoginForm();
    const [formData, setFormData] = useState<LoginFormData>({
        user_id: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSubmit(formData);
    };

    if (success) {
        return (
            <Paper shadow="md" p="xl" radius="md" withBorder>
                <Alert
                    icon={<IconCheck size={16} />}
                    title="로그인 성공"
                    color="green"
                    mb="md"
                >
                    성공적으로 로그인했습니다. 메인 페이지로 이동합니다.
                </Alert>
                <Center>
                    <Button
                        component={Link}
                        href='/'
                        rightSection={<IconArrowRight size={16} />}
                        color="green"
                    >
                        메인 페이지로 이동
                    </Button>
                </Center>
            </Paper>
        )
    }

    return (
        <Paper shadow="md" p="xl" radius="md" withBorder>
            <Title order={3} mb="md" ta="center">로그인</Title>

            {errors.form && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="로그인 오류"
                    color="red"
                    mb="md"
                >
                    {errors.form}
                </Alert>
            )}

            <form onSubmit={onSubmit}>
                <Stack gap="md">
                    <TextInput
                        id="user_id"
                        name="user_id"
                        type="id"
                        label="아이디"
                        placeholder="로그인 아이디를 입력하세요"
                        value={formData.user_id}
                        onChange={handleChange}
                        required
                        error={errors.user_id}
                        leftSection={<IconUser size={16} />}
                        autoComplete="username"
                    />

                    <TextInput
                        id="password"
                        name="password"
                        type="password"
                        label="비밀번호"
                        placeholder="비밀번호를 입력하세요"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        error={errors.password}
                        leftSection={<IconLock size={16} />}
                        autoComplete="current-password"
                    />
                </Stack>

                <Divider my="md" />

                <Group justify="space-between" mt="lg">
                    <Text size="sm" c="dimmed" component={Link} href="/auth/register">
                        계정이 없으신가요? 회원가입하기
                    </Text>
                    <Button
                        type="submit"
                        loading={isLoading}
                        rightSection={<IconArrowRight size={16} />}
                    >
                        {isLoading ? '처리중...' : '로그인'}
                    </Button>
                </Group>
            </form>
        </Paper>
    )
}