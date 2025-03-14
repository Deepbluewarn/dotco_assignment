'use client'

import { LoginFormData } from "@/actions/auth";
import useLoginForm from "@/hooks/useLoginForm";
import { Box, Button, Divider, Flex, Text, TextInput } from "@mantine/core";
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
            <Flex>
                <Text>성공적으로 로그인했습니다.</Text>
                <Button component={Link} href='/'>
                    메인 페이지
                </Button>
            </Flex>
        )
    }

    return (
        <form onSubmit={onSubmit}>
            {errors.form && (
                <Text c='red'>
                    {errors.form}
                </Text>
            )}

            <Flex direction={'column'} gap={8}>
                <Box>
                    <TextInput
                        id="user_id"
                        name="user_id"
                        type="id"
                        label="아이디"
                        value={formData.user_id}
                        onChange={handleChange}
                        required
                        error={errors.user_id}
                    />
                </Box>

                <Box>
                    <TextInput
                        id="password"
                        name="password"
                        type="password"
                        label="비밀번호"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        error={errors.password}
                    />
                </Box>
            </Flex>

            <Divider m={8} />
            <Button
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? '처리중...' : '로그인'}
            </Button>
        </form>
    )
}