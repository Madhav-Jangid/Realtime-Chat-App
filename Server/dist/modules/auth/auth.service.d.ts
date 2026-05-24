import { IUser } from '../../models/user.model.js';
export declare function signup(data: {
    username: string;
    name: string;
    email: string;
    password: string;
}): Promise<{
    user: Partial<IUser>;
    token: string;
}>;
export declare function login(data: {
    email: string;
    password: string;
}): Promise<{
    user: Partial<IUser>;
    token: string;
}>;
