import { Option, program } from "commander";
import { intParser } from "./parser";
import { InformationSource, Destination, destinations, informationSources } from "../business-logic/commander";
import { setLogLevel } from "../config/logger";

program.name("nryf-dumper");
program.showHelpAfterError();

const verboseOptionFlags = "--verbose [level]";
const verboseOption = new Option(verboseOptionFlags, "verbose level, see RFC5424");
verboseOption.argParser<number>((value: string) => intParser(program, value, verboseOptionFlags));

const sourceOptionFlags = "--source <source>";
const sourceOption = new Option(sourceOptionFlags, "information source");
sourceOption.choices(informationSources);
sourceOption.makeOptionMandatory(true);

const outputOptionFlags = "--output <dest>";
const outputOption = new Option(outputOptionFlags, "write to the desired output");
outputOption.choices(destinations);
outputOption.makeOptionMandatory(true);

const outPathOptionFlags = "--out-path <path>";
const outPathOption = new Option(outPathOptionFlags, "out path");
outPathOption.makeOptionMandatory(false);

const rutOptionFlags = "--rut <rut without dv>";
const rutOption = new Option(rutOptionFlags, "search a single rut");
rutOption.argParser((value) => intParser(program, value, rutOptionFlags));
rutOption.makeOptionMandatory(false);
rutOption.conflicts("fromRut");
rutOption.conflicts("toRut");

const fromRutOptionFlags = "--from-rut <rut without dv>";
const fromRutOption = new Option(fromRutOptionFlags, "search a bunch of ruts starting from this rut. eg: 1");
fromRutOption.makeOptionMandatory(false);
fromRutOption.conflicts("rut");
fromRutOption.argParser((value) => intParser(program, value, fromRutOptionFlags));

const toRutOptionFlags = "--to-rut <rut without dv>";
const toRutOption = new Option(toRutOptionFlags, "search a bunch of ruts ending with this rut. eg: 1000000");
toRutOption.makeOptionMandatory(false);
toRutOption.conflicts("rut");
toRutOption.argParser((value) => intParser(program, value, toRutOptionFlags));

program.addOption(verboseOption);
program.addOption(sourceOption);
program.addOption(outputOption);
program.addOption(outPathOption);
program.addOption(rutOption);
program.addOption(fromRutOption);
program.addOption(toRutOption);

// TODO: use zod for this
type ProgramOptions = {
    verbose?: boolean | number;
    source: InformationSource;
    output: Destination;
    outPath?: string;
    rut?: number;
    fromRut?: string;
    toRut?: string;
}

export default function parseProgram(): ProgramOptions {
    program.parse();

    const args = program.opts<ProgramOptions>();

    /* LOGGER LEVER */
    if (!args.verbose) setLogLevel(6); // 6 refers to info
    else if (typeof args.verbose === "boolean") args.verbose ? setLogLevel(7):setLogLevel(6); // 7 refers to debug
    else setLogLevel(args.verbose); // 7 refers to debug

    if (args.output === "console") {
        if (args.outPath) {
            program.error(`error: option '--out-path <path>' can not be used with '--output ${args.output}'`)
        }
    }
    
    if (args.output === "local-file") {
        if (!args.outPath) {
            program.error(`error: required option '--out-path <path>' not specified`)
        }
    }
    
    if (!args.rut) {
        if (!args.fromRut) {
            program.error(`error: required option '--from-rut <rut without dv>' not specified`)
        }
        if (!args.toRut) {
            program.error(`error: required option '--to-rut <rut without dv>' not specified`)
        }
    }

    return args;
}
