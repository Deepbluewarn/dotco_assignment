'use client'

import { RegisterFormData } from "@/actions/auth";
import useRegisterForm from "@/hooks/useRegisterForm";
import { IRole } from "@/interfaces/user";
import { 
  Paper, Title, Button, Text, TextInput, Divider, 
  Select, Stack, Alert, Group, Center 
} from "@mantine/core";
import { 
  IconUser, IconLock, IconBuilding, IconUserCheck, 
  IconPhone, IconAlertCircle, IconCheck, IconArrowRight 
} from '@tabler/icons-react';
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
            <Paper shadow="md" p="xl" radius="md" withBorder>
                <Alert
                    icon={<IconCheck size={18} />}
                    title="회원가입 성공"
                    color="green"
                    mb="xl"
                >
                    회원으로 가입하신 것을 환영합니다! 로그인 후 시스템을 이용하실 수 있습니다.
                </Alert>
                <Center>
                    <Group>
                        <Button 
                            component={Link} 
                            href='/auth/login'
                            leftSection={<IconUser size={16} />}
                        >
                            로그인하기
                        </Button>
                        <Button 
                            component={Link} 
                            href='/'
                            variant="light"
                            rightSection={<IconArrowRight size={16} />}
                        >
                            홈으로 이동
                        </Button>
                    </Group>
                </Center>
            </Paper>
        )
    }

    return (
        <Paper shadow="md" p="xl" radius="md" withBorder>
            <Title order={3} mb="md" ta="center">회원가입</Title>

            {errors.form && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="가입 오류"
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
                        placeholder="아이디를 입력하세요"
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
                        autoComplete="new-password"
                    />

                    <TextInput
                        id="name"
                        name="name"
                        type="text"
                        label="이름"
                        placeholder="담당자 이름을 입력하세요"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        error={errors.name}
                        leftSection={<IconUser size={16} />}
                    />

                    <TextInput
                        id="companyName"
                        name="companyName"
                        type="text"
                        label="회사명"
                        placeholder="회사명을 입력하세요"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        error={errors.companyName}
                        leftSection={<IconBuilding size={16} />}
                    />

                    <Select
                        id="role"
                        name="role"
                        label="사용자 유형"
                        description="회사 유형에 맞는 역할을 선택하세요"
                        placeholder="역할 선택"
                        value={formData.role}
                        onChange={handleRoleChange}
                        data={[
                            {value: 'CLIENT', label: '발주사 (제품 주문)'},
                            {value: 'SUPPLIER', label: '공급사 (제품 생산)'},
                            {value: 'DOTCO_ADMIN', label: '파트너사 (닷코)'},
                        ]}
                        leftSection={<IconUserCheck size={16} />}
                        error={errors.role}
                        required
                    />

                    <TextInput
                        id="contact"
                        name="contact"
                        type="tel"
                        label="연락처"
                        placeholder="010-0000-0000"
                        value={formData.contact}
                        onChange={handleChange}
                        leftSection={<IconPhone size={16} />}
                        required
                    />
                </Stack>

                <Divider my="lg" />

                <Group justify="space-between">
                    <Text size="sm" c="dimmed" component={Link} href="/auth/login">
                        이미 계정이 있으신가요? 로그인하기
                    </Text>
                    <Button
                        type="submit"
                        loading={isLoading}
                        rightSection={<IconArrowRight size={16} />}
                    >
                        {isLoading ? '처리중...' : '회원가입'}
                    </Button>
                </Group>
            </form>
        </Paper>
    )
}