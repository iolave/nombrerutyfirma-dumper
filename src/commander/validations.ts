import { options } from './config'

export const validateOptions = (givenOpts: any): any => {
    Object.entries(options).forEach(opt => {
        console.log(opt)
    })
    // if (inputOptions.validations.required) {
    //     const optionsCount
    //     inputOptions.options.forEach(opt => {
    //         if(givenOpts[opt.name]) console.log('está')
    //     })
    // }
}

