import { program, Option } from 'commander'
import { options } from './config'
import { name, version } from '../../package.json';
import { validateOptions } from './validations';

program.name(name)
program.allowExcessArguments(false)
program.allowUnknownOption(false)
program.showHelpAfterError(true)

program.option('Input options:')
options.filter(opt => opt.type.match(/option\.input.*/)).forEach(opt => {
    const option = new Option(opt.flags)
    option.description = opt.description
    option.defaultValue = opt.defaultValue
    if(opt.choices) option.choices(opt.choices)
    program.addOption(option)
})
program.option(' ')

program.option('Output options:')
options.filter(opt => opt.type.match(/option\.output.*/)).forEach(opt => {
    const option = new Option(opt.flags)
    option.description = opt.description
    option.defaultValue = opt.defaultValue
    if(opt.choices) option.choices(opt.choices)
    program.addOption(option)
})
program.option(' ')

program.option('Other options:')
options.filter(opt => opt.type.match(/option\.other.*/)).forEach(opt => {
    const option = new Option(opt.flags)
    option.description = opt.description
    option.defaultValue = opt.defaultValue
    if(opt.choices) option.choices(opt.choices)
    program.addOption(option)
})
program.version(`Version: ${version}`)
program.option(' ')

program.action(() => {
    const errMessage = validateOptions(program.opts())
    if(errMessage) program.error(errMessage)


})

export default program