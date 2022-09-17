
export const inputOptions = {
    validations: {
        required: true,
        allowMultipe: false
    },
    options: [
        {
            name: 'ruts',
            flags: '-r --ruts <ruts...>',
            description: 'Input rut(s) to be queryied',
            defaultValue: undefined
        },
        {
            name: 'file',
            flags: '-f --file <file_path>',
            description: 'Input file containing ruts to be queryied',
            defaultValue: undefined
        },
    ],
}

export const options = {
    inputOptions: {
    },
    outputOptions: {
    },
    otherOptions: {
    }
}