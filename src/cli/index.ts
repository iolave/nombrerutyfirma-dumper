import { Option, program } from "commander";
import { intParser, numberArrayParser } from "./parser";
import { InformationSource, Destination, destinations, informationSources } from "../business-logic/commander";
import { setLogLevel } from "../config/logger";
import packageJson from "../../package.json"

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

    if (args.queryType === "single-rut") {
        if (!args.rut) program.error(`error: required option '${rutOptionFlags}' not specified`);
    }
    else if (args.queryType === "ruts-range" ) {
        if (!args.fromRut) program.error(`error: required option '${fromRutOptionFlags}' not specified`);
        if (!args.toRut) program.error(`error: required option ${toRutOptionFlags}' not specified`);
    }
    else if (args.queryType === "multiple-ruts") {
        if (!args.ruts) program.error(`error: required option '${rutsOptionFlags}' not specified`);
    }
    else {
        const errorMsg = new String()
            .concat("error: no input specified\n\n")
            .concat("specify one of the following options\n")
            .concat(`  ${rutOptionFlags}\n`)
            .concat(`  ${fromRutOptionFlags}\n`)
            .concat(`  ${toRutOptionFlags}\n`)
            .concat(`  ${rutsOptionFlags}\n`)
        ;

        program.error(errorMsg);
    }

    return args;
}

// TODO: use zod for this
interface ProgramOptionsBase {
    verbose?: boolean | number;
    source: InformationSource;
    output: Destination;
    outPath?: string;
    maxRetries?: number;
}

interface SingleRutProgramOptions extends ProgramOptionsBase {
    queryType: "single-rut",
    rut: number;
}

interface RutsRangeProgramOptions extends ProgramOptionsBase {
    queryType: "ruts-range",
    fromRut: number;
    toRut: number;
    batchSize?: number;
}

interface MultipleRutsProgramOptions extends ProgramOptionsBase {
    queryType: "multiple-ruts",
    ruts: number[];
    batchSize?: number;
}

export type ProgramOptions = SingleRutProgramOptions | RutsRangeProgramOptions | MultipleRutsProgramOptions;

program.name("nryf-dumper");
program.showHelpAfterError();
program.version(packageJson.version);

const verboseOptionFlags = "--verbose [level]";
const verboseOption = new Option(verboseOptionFlags, "set verbosity level (see RFC5424)");
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
rutOption.conflicts("ruts");
rutOption.implies({ queryType: "single-rut" });

const fromRutOptionFlags = "--from-rut <rut without dv>";
const fromRutOption = new Option(fromRutOptionFlags, "search a bunch of ruts starting from this rut. i.e.: 1");
fromRutOption.makeOptionMandatory(false);
fromRutOption.conflicts("rut");
fromRutOption.conflicts("ruts");
fromRutOption.argParser((value) => intParser(program, value, fromRutOptionFlags));
fromRutOption.implies({ queryType: "ruts-range" });

const toRutOptionFlags = "--to-rut <rut without dv>";
const toRutOption = new Option(toRutOptionFlags, "search a bunch of ruts ending with this rut. i.e.: 1000000");
toRutOption.makeOptionMandatory(false);
toRutOption.conflicts("rut");
toRutOption.conflicts("ruts");
toRutOption.argParser((value) => intParser(program, value, toRutOptionFlags));
toRutOption.implies({ queryType: "ruts-range" });

const rutsOptionFlags = "--ruts <...ruts without dv>";
const rutsOption = new Option(rutsOptionFlags, "search a bunch of ruts. i.e.: 123456,123457,1234568");
rutsOption.makeOptionMandatory(false);
rutsOption.conflicts("rut");
rutsOption.conflicts("fromRut");
rutsOption.conflicts("toRut");
rutsOption.argParser((value) => numberArrayParser(program, value, rutsOptionFlags));
rutsOption.implies({ queryType: "multiple-ruts" });

const batchSizeOptionFlags = "--batch-size <number>";
const batchSizeOption = new Option(batchSizeOptionFlags, "number of simultaneous requests");
batchSizeOption.makeOptionMandatory(false);
batchSizeOption.conflicts("rut");
batchSizeOption.argParser((value) => intParser(program, value, batchSizeOptionFlags));

const maxRetriesOptionFlags = "--max-retries <number>";
const maxRetriesOption = new Option(maxRetriesOptionFlags, "number of max retries on specific scenarios. defaults to infinte");
maxRetriesOption.makeOptionMandatory(false);
maxRetriesOption.argParser((value) => intParser(program, value, maxRetriesOptionFlags));

program.addOption(verboseOption);
program.addOption(sourceOption);
program.addOption(outputOption);
program.addOption(outPathOption);
program.addOption(rutOption);
program.addOption(fromRutOption);
program.addOption(toRutOption);
program.addOption(rutsOption);
program.addOption(batchSizeOption);
program.addOption(maxRetriesOption);
