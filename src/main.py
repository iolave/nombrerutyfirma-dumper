import sys
from helpers.cliArguments import cliArgumentsParser

if __name__ == '__main__':
    cliArguments = cliArgumentsParser(sys.argv)
    print(cliArguments)
    print('Hello World!')