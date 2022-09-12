# Input: An array of cli options
# Output: Python object with all 
# the given cli arguments in a 
# key value style 
# 
# example:
#   For input: ['--first']
#   Returns: [{'key': 'first', 'value':None}]
def cliArgumentsParser(arr):
    # The first argument argument is the bin file
    # so we pop it as we're not gonna parse it
    arr.pop(0)

    # Create an empty array to store all key value
    # pairs
    res = []


    for arg in arr:
        # If equals char is found, splits the arg
        # and obtain a key and a value pair.
        # Otherwise assumes None as key's value
        # which means it's default value
        if arg.find('=') != -1:
            key, value = arg.split('=')
        else:
            key, value = arg, None
        res.append({"key": key, "value": value})

    # Return all the key value pairs
    return(res)