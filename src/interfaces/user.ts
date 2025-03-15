export type IRole = 'DOTCO_ADMIN' | 'CLIENT' | 'SUPPLIER';
export interface IUser {
    id: number;
    user_id: string;
    password: string;
    name: string;
    company_name: string;
    role: IRole;
    contact: string;
    created_at: string | Date;
}

export type IUserSafe = Omit<IUser, 'password'>;