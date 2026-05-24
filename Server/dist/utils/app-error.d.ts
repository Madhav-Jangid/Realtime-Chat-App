export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare function asyncHandler(fn: Function): (req: any, res: any, next: any) => void;
