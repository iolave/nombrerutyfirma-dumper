export const dontAllowMultipleOptions: Function = (givenOpts: Array<Map<string, any>>): boolean => {
    if (givenOpts.length > 1) return false
    return true
}

export const requiredOption: Function = (givenOpts: Array<Map<string,any>>): boolean => {
    if (givenOpts.length === 0) return false
    return true
}