'use server'

import { hash, compare } from 'bcrypt';
import { executeQuery } from '@/utils/db';
import { cookies } from 'next/headers';
import { IRole, IUser } from '@/interfaces/user';
import { redirect } from 'next/navigation';

const SALT_ROUND = parseInt(process.env.DB_SALT_ROUND || '10', 10);
export type RegisterFormData = {
    user_id: string;
    password: string;
    name: string;
    companyName: string;
    role: IRole;
    contact?: string;
};

export type LoginFormData = {
    user_id: string;
    password: string;
}

export async function registerUser(data: RegisterFormData) {
    try {
        // 아이디 중복 확인
        const users = await executeQuery(
            'SELECT * FROM users WHERE user_id = ?',
            [data.user_id]
        );

        if (users.length > 0) {
            return { success: false, error: '이미 사용 중인 아이디입니다.' };
        }

        // 비밀번호 해시화
        const hashedPassword = await hash(data.password, SALT_ROUND);

        // 사용자 생성
        await executeQuery(
            `INSERT INTO users 
            (user_id, password, name, company_name, role, contact) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.user_id,
                hashedPassword,
                data.name,
                data.companyName,
                data.role,
                data.contact || null
            ]
        );
        return { success: true };
    } catch (error) {
        console.error('회원가입 에러:', error);
        return { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' };
    }
}

export async function login(data: LoginFormData) {
    const cookieStore = await cookies()
    
    try {
        const users = await executeQuery<IUser[]>(
            'SELECT * FROM users WHERE user_id = ?',
            [data.user_id]
        );

        if (!users || users.length <= 0) {
            return { success: false, error: '존재하지 않는 회원입니다.' };
        }

        // 비밀번호 검증
        const match = await compare(data.password , users[0].password);

        if (!match) {
            return { success: false, error: '로그인에 실패했습니다.' };
        }

        cookieStore.set('user_id', users[0].user_id);

        return { success: true };
    } catch(error) {
        return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_id');

    redirect('/');
}
