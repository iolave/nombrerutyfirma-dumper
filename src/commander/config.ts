import { dontAllowMultipleOptions, requiredOption } from './rules';

export const optionsRules = {
    'option.input': {
        requiredOption,
        dontAllowMultipleOptions
    }
}

export const inputOptions = {
    validations: {
        required: true,
        allowMultipe: false
    },
    options: [
        {
            type: 'options.inputs',
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

export const options = [
    {
        rule: 'option.input',
        name: 'ruts',
        flags: '-r --ruts <ruts...>',
        description: 'Input rut(s) to be queryied',
        defaultValue: undefined
    },
    {
        rule: 'option.input',
        name: 'file',
        flags: '-f --file <file_path>',
        description: 'Input file containing ruts to be queryied',
        defaultValue: undefined
    },
    {
        rule: 'option.output',
        name: 'file',
        flags: '-f --file <file_path>',
        description: 'Input file containing ruts to be queryied',
        defaultValue: undefined
    },
]