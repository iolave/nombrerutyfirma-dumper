import parseProgram from "./cli";
import commanderAction from "./business-logic/commander";

const args = parseProgram();
    
commanderAction(args);
