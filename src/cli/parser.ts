import { Command } from "commander";
import { isNumber } from "../util/string";

export function intParser(cmd: Command, value: string, flags: string): number {
    if (!isNumber(value)) cmd.error(`${flags} value should be a number`);
    return parseInt(value);
}
