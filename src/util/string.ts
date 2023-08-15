export function isNumber(str: string): boolean {
    const regex = /^[0-9]+$/;

    if (str.match(regex)) return true;
    return false; 
}
