import { dontAllowMultipleOptions, requiredOption, requiresMongodb } from './rules';

export const optionsRules = {
    'option.input': {
        requiredOption,
        dontAllowMultipleOptions,
    },
    'option.output': {
        requiredOption,
        dontAllowMultipleOptions,
    },
    'option.output.db.mongodb': {
        requiresMongodb,
        requiredOption
    },
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
        type: 'option.input',
        name: 'ruts',
        flags: '-r --ruts <ruts...>',
        description: 'Input rut(s) to be queryied',
        defaultValue: undefined,
        choices: undefined,
    },
    {
        type: 'option.input',
        name: 'file',
        flags: '-f --file <file_path>',
        description: 'Input file containing ruts to be queryied',
        defaultValue: undefined,
        choices: undefined,
    },
    {
        type: 'option.output',
        name: 'output',
        flags: '-o --output <file_path>',
        description: 'Output result to a destination file',
        defaultValue: undefined,
        choices: undefined,
    },
    {
        type: 'option.output',
        name: 'console',
        flags: '--console',
        description: 'Output result to the terminal',
        defaultValue: undefined,
        choices: undefined,
    },
    {
        type: 'option.output',
        name: 'database',
        flags: '--database <database>',
        description: 'Output result to a desired database engine',
        defaultValue: undefined,
        choices: ['mongodb'],
    },
    {
        type: 'option.output.db.mongodb',
        name: 'uri',
        flags: '--uri <uri>',
        description: 'Uri string',
        defaultValue: undefined,
        choices: undefined,
    },
    {
        type: 'option.other',
        name: 'verbose',
        flags: '-v --verbose',
        description: 'Output more log',
        defaultValue: undefined,
        choices: undefined,
    },
]