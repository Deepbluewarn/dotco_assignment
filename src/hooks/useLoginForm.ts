'use client'

import { useState } from 'react';
import { login, LoginFormData } from '@/actions/auth';

type FormErrors = {
    form?: string;
    user_id?: string;
    password?: string;
};

export default function useLoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [success, setSuccess] = useState(false);

    const validateForm = (data: LoginFormData): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.user_id) {
            newErrors.user_id = '아이디를 입력해주세요';
        }

        if (!data.password) {
            newErrors.password = '비밀번호를 입력해주세요';
        }

        return newErrors;
    };

    const handleSubmit = async (formData: LoginFormData) => {
        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const result = await login(formData);

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