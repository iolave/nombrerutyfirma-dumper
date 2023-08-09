import { Option, program } from "commander";
import commanderAction, { Destination, InformationSource, destinations, informationSources } from "./business-logic/commander";

const sourceOption = new Option("--source <source>", "information source");
sourceOption.choices(informationSources);
sourceOption.makeOptionMandatory(true);

const outputOption = new Option('--output <dest>', "write to the desired output");
outputOption.choices(destinations);
outputOption.makeOptionMandatory(true);

const outPathOption = new Option('--out-path <path>', "out path");
// outPathOption.makeOptionMandatory(true).conflicts("output=console");

const rutOption = new Option('--rut <rut>', "search a single rut");
rutOption.makeOptionMandatory(true);

type ProgramOptions = {
    source: InformationSource;
    output: Destination;
    rut: string;
    outPath?: string;
}

program.name("nryf-dumper");
program.showHelpAfterError();
program.addOption(sourceOption);
program.addOption(outputOption);
program.addOption(outPathOption);
program.addOption(rutOption);
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
    
    commanderAction({
        destination: args.output,
        source: args.source,
        outFile: true,
        outPath: args.outPath,
        rut: args.rut,
    });
})

program.parse();
