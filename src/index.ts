import parseProgram from "./cli";
import commanderAction from "./business-logic/commander";

const args = parseProgram();

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
