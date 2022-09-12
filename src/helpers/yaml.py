from typing import Any
import yaml

def yamlParser(filePath: str) -> Any:
    with open(filePath, "r") as stream:
        try:
            data = yaml.safe_load(stream)
            return(data)
        except yaml.YAMLError as exc:
            raise Exception(exc)