const errorCodes = [
    'cf_ip_banned',
    'cf_rate_limited',
    'fetch_error',
    'data_not_found',
    'no_jwt',
    'todo_handle_error',
] as const;

type ErrorCode = typeof errorCodes[number];

export class NRYFError extends Error {
    name: string;
    code: ErrorCode;
    message: string;

    constructor(name: string, code: ErrorCode, message: string) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
    }
}
