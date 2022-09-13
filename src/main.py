import sys
import os
from helpers.cliArguments import cliArgumentsParser, cliArgumentsCheck # type: ignore
from helpers.yaml import yamlParser # type: ignore

__PATH_APP_ROOT__ = os.path.dirname(__file__)

if __name__ == '__main__':
    # Parsing cli arguments
    cliArguments = cliArgumentsParser(sys.argv[1:])
    
    # Reading and parsing cli.schema.yaml file
    # to validate parsed cliArguments
    cliSchemaPath = os.path.join(__PATH_APP_ROOT__, 'schemas', 'cli.schema.yaml')
    cliSchema = yamlParser(cliSchemaPath)

    # Checking given arguments against cli schema
    cliArgumentsCheck(cliArguments, cliSchema['arguments'])
        


