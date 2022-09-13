from typing import List, Any

def listToString(arr: List[Any]) -> str:
    res = '['
    for e in arr[0: len(arr) - 1]:
        res = res + '"' + str(e) + '",'
    for e in arr[len(arr) - 1:]:
        res = res + '"' + str(e) + '"'
    res = res + ']'

    return(res)

def duplicates(arr: List[Any]) -> List[Any]:
    seen = set()
    dupes = []

    for x in arr:
        if x in seen:
            dupes.append(x)
        else:
            seen.add(x)
    
    return(dupes)
    
