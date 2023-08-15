import { Option, program } from "commander";
import commanderAction, { Destination, InformationSource, destinations, informationSources } from "./business-logic/commander";
import { isNumber } from "./util/string";

const sourceOption = new Option("--source <source>", "information source");
sourceOption.choices(informationSources);
sourceOption.makeOptionMandatory(true);

const outputOption = new Option('--output <dest>', "write to the desired output");
outputOption.choices(destinations);
outputOption.makeOptionMandatory(true);

const outPathOption = new Option('--out-path <path>', "out path");
outPathOption.makeOptionMandatory(false);

const rutOptionFlags = "--rut <rut without dv>";
const rutOption = new Option(rutOptionFlags, "search a single rut");
rutOption.makeOptionMandatory(false);
rutOption.conflicts("fromRut");
rutOption.conflicts("toRut");
rutOption.argParser((value) => {
    if (isNumber(value)) return parseInt(value);
    program.error(`${rutOptionFlags} value should be a number`);
});

const fromRutOptionFlags = "--from-rut <rut without dv>";
const fromRutOption = new Option(fromRutOptionFlags, "search a bunch of ruts starting from this rut. eg: 1");
fromRutOption.makeOptionMandatory(false);
fromRutOption.conflicts("rut");
fromRutOption.argParser((value) => {
    if (isNumber(value)) return parseInt(value);
    program.error(`${fromRutOptionFlags} value should be a number`);
});

const toRutOptionFlags = "--to-rut <rut without dv>";
const toRutOption = new Option(toRutOptionFlags, "search a bunch of ruts ending with this rut. eg: 1000000");
toRutOption.makeOptionMandatory(false);
toRutOption.conflicts("rut");
toRutOption.argParser((value) => {
    if (isNumber(value)) return parseInt(value);
    program.error(`${fromRutOptionFlags} value should be a number`);
});

type ProgramOptions = {
    source: InformationSource;
    output: Destination;
    rut?: number;
    outPath?: string;
    fromRut?: string;
    toRut?: string;
}

program.name("nryf-dumper");
program.showHelpAfterError();

program.addOption(sourceOption);
program.addOption(outputOption);
program.addOption(outPathOption);
program.addOption(rutOption);
program.addOption(fromRutOption);
program.addOption(toRutOption);

program.action(async (args: ProgramOptions) => {
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

    const rut = args.rut ?? {
        from: parseInt(args.fromRut??""),
        to: parseInt(args.toRut??"")
    }
    
    commanderAction({
        destination: args.output,
        source: args.source,
        outFile: true,
        outPath: args.outPath,
        rut,
    });
})

program.parse();
