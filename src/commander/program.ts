import { program } from 'commander'
import { inputOptions } from './config'
import { name, version } from '../../package.json';
import { validateOptions } from './validations';

program.name(name)

program.option('Input options:')
inputOptions.options.forEach(opt => {
    program.option(opt.flags, opt.description, opt.defaultValue)
})
program.option(' ')

program.option('Output options:')
program.option('-o --output <file_path>', 'Output result to a destination file')
// program.option('--mongodb <uri>', 'Insert output mongodb ')
program.option(' ')

program.option('Other options:')
program.option('-v --verbose', 'Output more log')
program.version(version)

program.allowExcessArguments(false)
program.allowUnknownOption(false)
program.showHelpAfterError(true)

program.action(() => {
    validateOptions(program.opts())
})

export default program