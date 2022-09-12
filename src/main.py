from logging import raiseExceptions
import sys
import os
from helpers.cliArguments import cliArgumentsParser # type: ignore
from helpers.yaml import yamlParser # type: ignore

__PATH_APP_ROOT__ = os.path.dirname(__file__)

if __name__ == '__main__':
    # Parsing cli arguments
    cliArguments = cliArgumentsParser(sys.argv)
    
    # Reading and parsing cli.schema.yaml file
    # to validate parsed cliArguments
    cliSchemaPath = os.path.join(__PATH_APP_ROOT__, 'schemas', 'cli.schema.yaml')
    cliSchema = yamlParser(cliSchemaPath)

    # Checking given arguments against cli schema
    for option in cliSchema['arguments']:
        exists = False
        if option['name'] in cliArguments.keys(): exists = True

        print(option, exists)

        if option['required'] == True:
            if exists == False:
                requiredArgError = 'Argument ' + option['name'] + ' is required'
                raise Exception(requiredArgError)
                
    for arg in cliArguments:
        print(cliArguments)