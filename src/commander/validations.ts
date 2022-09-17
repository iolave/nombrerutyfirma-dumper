import { optionsRules, options } from './config'

export const validateOptions = (programOpts: any): undefined|string => {
    var errMessage = undefined
    Object.entries(optionsRules).forEach(ruleObject => {
        const ruleName = ruleObject[0]
        const rules = ruleObject[1]

        const allowedOptions = options.filter(opt => opt.rule === ruleName)

        const givenOpts: Array<object> = []
        Object.entries(programOpts).forEach(opt => {
            const givenOpt = {name: opt[0], value: opt[1]}
            if (allowedOptions.map(e => e.name).indexOf(givenOpt.name) !== -1) {
                givenOpts.push(givenOpt)
            }
        })

        Object.values(rules).forEach(rule => {
            if (!rule(givenOpts)) {
                errMessage = `${ruleName} error: ${rule.name.replace( /([A-Z])/g, " $1" ).toLowerCase()}`
            }
        })
    })
    return errMessage
}

