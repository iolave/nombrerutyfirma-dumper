import { Command } from "commander";
import { isNumber } from "../util/string";

export function intParser(cmd: Command, value: string, flags: string): number {
    if (!isNumber(value)) cmd.error(`${flags} value should be a number`);
    return parseInt(value);
}

export function numberArrayParser(cmd: Command, value: string, flags: string): number[] {
    const splittedValue = value.split(",");
    
    return splittedValue.map(e => {
        if (!isNumber(e)) cmd.error(`${flags} value should contain numbers`);
        return parseInt(e)
    });
}