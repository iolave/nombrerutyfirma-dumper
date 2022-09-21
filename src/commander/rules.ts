export const dontAllowMultipleOptions: Function = (givenOpts: {name: string, value: any}[]): boolean => {
    if (givenOpts.length > 1) return false
    return true
}

export const requiredOption: Function = (givenOpts: {name: string, value: any}[]): boolean => {
    if (givenOpts.length === 0) return false
    return true
}

export const requiresMongodb: Function = (givenOpts: {name: string, value: any}[]): boolean => {
    try {
        if(givenOpts.filter(opt => opt.name === 'database' && opt.value === 'mongodb')) return true
    } catch (error) {
        return false
    }
    return false
}