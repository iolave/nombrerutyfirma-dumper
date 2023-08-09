import { Option, program } from "commander";
import commanderAction, { InformationSource, informationSources } from "./business-logic/commander";

const sourceOption = new Option("--source <source>", "information source");
sourceOption.choices(informationSources);
sourceOption.makeOptionMandatory(true);

const outFileOption = new Option('--out-file <path>', "write output to a local file");
outFileOption.makeOptionMandatory(true);

const rutOption = new Option('--rut <rut>', "search a single rut");
rutOption.makeOptionMandatory(true);

type ProgramOptions = {
    source: InformationSource;
    outFile: string;
    rut: string;
}

program.name("nryf-dumper");
program.showHelpAfterError();
program.addOption(sourceOption);
program.addOption(outFileOption);
program.addOption(rutOption);
program.action(async (args: ProgramOptions) => {
    commanderAction({
        source: args.source,
        outFile: true,
        outPath: args.outFile,
        rut: args.rut,
    });
})
program.parse();

