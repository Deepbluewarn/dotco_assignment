'use client'

import { useState } from 'react';
import { RegisterFormData, registerUser } from '@/actions/auth';

type FormErrors = {
    user_id?: string;
    password?: string;
    name?: string;
    companyName?: string;
    role?: string;
    contact?: string;
    form?: string;
};

export default function useRegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [success, setSuccess] = useState(false);

    const validateForm = (data: RegisterFormData): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.user_id) {
            newErrors.user_id = '아이디를 입력해주세요';
        }

        if (!data.password) {
            newErrors.password = '비밀번호를 입력해주세요';
        } else if (data.password.length < 6) {
            newErrors.password = '비밀번호는 6자 이상이어야 합니다';
        }

        if (!data.name) {
            newErrors.name = '이름을 입력해주세요';
        }

        if (!data.companyName) {
            newErrors.companyName = '회사명을 입력해주세요';
        }

        if (!data.role) {
            newErrors.role = '역할을 선택해주세요';
        }

        return newErrors;
    };

    const handleSubmit = async (formData: RegisterFormData) => {
        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const result = await registerUser(formData);

            if (result.success) {
                setSuccess(true);
            } else {
                setErrors({ form: result.error });
            }
        } catch (error) {
            setErrors({ form: '서버 오류가 발생했습니다' });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        errors,
        success,
        handleSubmit
    };
}