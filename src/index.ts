import { Option, program } from "commander";
import commanderAction, { Destination, InformationSource, destinations, informationSources } from "./business-logic/commander";

const sourceOption = new Option("--source <source>", "information source");
sourceOption.choices(informationSources);
sourceOption.makeOptionMandatory(true);

const outputOption = new Option('--output <dest>', "write to the desired output");
outputOption.choices(destinations);
outputOption.makeOptionMandatory(true);

const outPathOption = new Option('--out-path <path>', "out path");
outPathOption.makeOptionMandatory(false);

const rutOption = new Option('--rut <rut>', "search a single rut");
rutOption.makeOptionMandatory(false);
rutOption.conflicts("fromRut");
rutOption.conflicts("toRut");

const fromRutOption = new Option('--from-rut <rut without dv>', "search a bunch of ruts starting from this rut. eg: 1");
fromRutOption.makeOptionMandatory(false);
fromRutOption.conflicts("rut");

const toRutOption = new Option('--to-rut <rut without dv>', "search a bunch of ruts ending with this rut. eg: 1000000");
toRutOption.makeOptionMandatory(false);
toRutOption.conflicts("rut");

type ProgramOptions = {
    source: InformationSource;
    output: Destination;
    rut?: string;
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
