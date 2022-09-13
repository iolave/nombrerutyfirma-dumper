from typing import List


def listToString(arr: List[str]) -> str:
    res = '['
    for e in arr[0: len(arr) - 1]:
        res = res + '"' + str(e) + '",'
    for e in arr[len(arr) - 1:]:
        res = res + '"' + str(e) + '"'
    res = res + ']'

    return(res)
    