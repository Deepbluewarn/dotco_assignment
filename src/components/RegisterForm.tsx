'use client'

import { RegisterFormData } from "@/actions/auth";
import useRegisterForm from "@/hooks/useRegisterForm";
import { IRole } from "@/interfaces/user";
import { Button, Flex, Text, TextInput, Box, Divider, Select } from "@mantine/core";
import Link from "next/link";
import { FormEvent, useState } from "react"

export default function RegisterForm() {
    const { isLoading, success, errors, handleSubmit } = useRegisterForm();
    const [formData, setFormData] = useState<RegisterFormData>({
        user_id: '',
        password: '',
        name: '',
        companyName: '',
        role: 'CLIENT' as IRole,
        contact: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value: string | null) => {
        const role = value as IRole;

        if (!role) {
            return;
        }
        setFormData(prev => ({ ...prev, role: value as IRole }));
    }

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSubmit(formData);
    };

    if (success) {
        return (
            <Flex>
                <Text>회원으로 가입하신것을 환영합니다!</Text>
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

                <Box>
                    <TextInput
                        id="name"
                        name="name"
                        type="text"
                        label="이름"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        error={errors.name}
                    />
                </Box>

                <Box>
                    <label htmlFor="companyName">회사명</label>
                    <TextInput
                        id="companyName"
                        name="companyName"
                        type="text"
                        label="회사명"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        error={errors.companyName}
                    />
                </Box>

                <Box>
                    <Select
                        id="role"
                        name="role"
                        label="역할"
                        value={formData.role}
                        onChange={handleRoleChange}
                        data={[
                            {value: 'CLIENT', label: '발주사'},
                            {value: 'SUPPLIER', label: '공급사'},
                            {value: 'DOTCO_ADMIN', label: '파트너사(닷코)'},
                        ]}
                        required
                    />
                    {errors.role && <p>{errors.role}</p>}
                </Box>

                <Box>
                    <TextInput
                        id="contact"
                        name="contact"
                        type="tel"
                        label="연락처 (선택)"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="010-0000-0000"
                    />
                </Box>
            </Flex>

            <Divider m={8}/>
            <Button
                type="submit"
                disabled={isLoading}
            >
                {isLoading ? '처리중...' : '회원가입'}
            </Button>
        </form>
    )
}