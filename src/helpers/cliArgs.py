# Returns a python object with 
# all the given cli arguments
# in a key value maner
def cliArgumentsParser(arr):
    # The first argument argument is the bin file
    # so we pop it as we're not gonna parse it
    arr.pop(0)

    # Create an empty array to store all key value
    # pairs
    res = []
    for arg in arr:
        if arg.find('=') != -1:
            key, value = arg.split('=')
        else:
            key, value = arg, None
        res.append({"key": key, "value": value})
    return(res)