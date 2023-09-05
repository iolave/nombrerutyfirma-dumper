export class NRYFError extends Error {
    name: string;
    code: string;
    message: string;

    constructor(name: string, code: string, message: string) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
    }
}
