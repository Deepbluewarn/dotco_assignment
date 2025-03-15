'use server'

import { IRole, IUser, IUserSafe } from "@/interfaces/user";
import { executeQuery } from "@/utils/db";
import { cookies } from "next/headers";

export async function getUserInfo<T extends boolean>(
    safe?: T, user_id?: string
): Promise<T extends true ? IUserSafe | null : IUser | null> {
    let _user_id = user_id;

    if(!user_id) {
        const cookieStore = await cookies();
        _user_id = cookieStore.get('user_id')?.value;
    }
    
    if (!_user_id) {
        return null;
    }

    const user = (await executeQuery<IUser[]>(
        'SELECT * FROM users WHERE user_id = ?',
        [_user_id]
    ))[0];

    if (!user) {
        return null;
    }

    const { password, ...safeUser } = user;

    return safe ? safeUser as any : user;
}

export async function getUsersByRole<T extends boolean>(
    role: IRole, 
    safe?: T
): Promise<T extends true ? IUserSafe[] | null : IUser[] | null> {
    const users = await executeQuery<IUser[]>(
        'SELECT * FROM users WHERE role = ?',
        [role]
    );

    if (!users || users.length === 0) {
        return null;
    }

    if (safe) {
        const safeUsers = users.map(user => {
            const { password, ...safeUser } = user;
            return safeUser as IUserSafe;
        });
        return safeUsers as any;
    }
    
    return users as any;
}
