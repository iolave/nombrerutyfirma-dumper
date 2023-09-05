export class NRYFError extends Error {
    name: string;
    message: string;
    code: string;

    constructor(name: string, message: string, code: string) {
        super();
        this.name = name;
        this.message = message;
        this.code = code;
    }
}
