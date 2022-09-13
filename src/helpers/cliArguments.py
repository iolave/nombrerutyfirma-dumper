from ast import arguments
from typing import Any, Dict, List, Optional
from .list import listToString

# Input: An array of cli options
# Output: Python object with all 
# the given cli arguments in a 
# key value style 
# 
# example:
#   For input: ['--first=value']
#   Returns: {'--first': 'Value'}
def cliArgumentsParser(arr: List[str]) -> Dict[str,Optional[str]]:
    # Create an empty object to store all key-value
    # pairs
    res = { }

    for arg in arr:
        # If equals char is found, splits the arg
        # and obtain a key and a value pair.
        # Otherwise assumes None as key's value
        # which means it's default value
        if arg.find('=') != -1:
            key, value = arg.split('=')
        else:
            key, value = arg, None

        if key in res:
            dupedArgError = 'Argument "' + key + '" is already defined'
            raise Exception(dupedArgError)

        res[key] = value

    # Return all the key value pairs
    return(res)

# TODO: Add a not valid arguments checker
def cliArgumentsCheck(args: Dict[str,Optional[str]], schema: Any):
    for option in schema:
        cliKey = option['name']

        existsArgument = False
        if option['name'] in args.keys(): 
            existsArgument = True
            cliValue = args[option['name']]

        if option['required'] == True:
            if existsArgument == False:
                requiredArgError = 'Argument ' + cliKey + ' is required'
                raise Exception(requiredArgError)

        if option['requiresValue'] == True and cliValue == None:
            requiredValueError = 'Argument ' + cliKey + ' requires value. Eg: ' + cliKey + '=value'
            raise Exception(requiredValueError)

        if 'allowedValues' in option.keys():
            if option['allowedValues'] == None:
                schemaError = 'Key allowedValues can not be of type None'
                raise Exception(schemaError)

            allowedValues = list(map(lambda e: e['name'], option['allowedValues']))
            if args[cliKey] not in allowedValues:
                allowedValues = list(map(lambda e: e['name'], option['allowedValues']))
                allowedValuesStr = listToString(allowedValues)
                allowedValuesError = 'Allowed values for ' + cliKey + ' option are: ' + allowedValuesStr + '. Eg: ' + cliKey + '=value'
                raise Exception(allowedValuesError)

            for values in option['allowedValues']:
                if values['name'] == args[cliKey]: 
                    if 'arguments' in values.keys():
                        cliArgumentsCheck(args, values['arguments'])
                        break