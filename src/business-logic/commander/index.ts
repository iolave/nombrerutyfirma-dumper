import { tmpdir } from "os";
import consoleAction from "./console";
import localFileAction from "./local-file";
import { ProgramOptions } from "../../cli";
import mongodbAction from "./mongodb";

export default async function commanderAction(opts: ProgramOptions): Promise<never> {
    if (opts.output === "console") {
        if (opts.queryType === "single-rut") {
            await consoleAction({
                type: opts.queryType,
                source: opts.source,
                rut: opts.rut,
                maxRetries: opts.maxRetries,
            });
        }
        if (opts.queryType === "ruts-range") {
            await consoleAction({
                type: opts.queryType,
                source: opts.source,
                from: opts.fromRut,
                to: opts.toRut,
                batchSize: opts.batchSize,
                maxRetries: opts.maxRetries,
            });
        }
        if (opts.queryType === "multiple-ruts") {
            await consoleAction({
                type: opts.queryType,
                source: opts.source,
                ruts: opts.ruts,
                batchSize: opts.batchSize,
                maxRetries: opts.maxRetries,
            });
        }
    }
    else if (opts.output === "local-file") {
        const path = opts.outPath ?? tmpdir();
        if (opts.queryType === "single-rut") {
            await localFileAction({
                type: opts.queryType,
                rut: opts.rut,
                source: opts.source,
                path,
                maxRetries: opts.maxRetries,
            });
        }
        if (opts.queryType === "ruts-range") {
            await localFileAction({
                type: opts.queryType,
                from: opts.fromRut,
                to: opts.toRut,
                source: opts.source,
                path,
                batchSize: opts.batchSize,
                maxRetries: opts.maxRetries,
            });
        }
        if (opts.queryType === "multiple-ruts") {
            await localFileAction({
                type: opts.queryType,
                ruts: opts.ruts,
                source: opts.source,
                path,
                batchSize: opts.batchSize,
                maxRetries: opts.maxRetries,
            });
        }
    }
    else if (opts.output === "mongodb") {
        if (opts.queryType === "single-rut") {
            await mongodbAction({
                type: opts.queryType,
                rut: opts.rut,
                source: opts.source,
                maxRetries: opts.maxRetries,
                uri: opts.uri??"",
            });
        }
        else if (opts.queryType === "ruts-range") {
            await mongodbAction({
                type: opts.queryType,
                from: opts.fromRut,
                to: opts.toRut,
                source: opts.source,
                maxRetries: opts.maxRetries,
                batchSize: opts.batchSize,
                uri: opts.uri??"",
            });
        }
        else if (opts.queryType === "multiple-ruts") {
            await mongodbAction({
                type: opts.queryType,
                ruts: opts.ruts,
                source: opts.source,
                maxRetries: opts.maxRetries,
                batchSize: opts.batchSize,
                uri: opts.uri??"",
            });
        }
        
        process.exit(0)
    }

    process.exit(1);
}

export const informationSources = [
    "elrutificador",
    "nombrerutyfirma",
    "rutificador-net",
] as const;
export type InformationSource = typeof informationSources[number];

export const destinations = [
    'console', 
    'local-file', 
    'mongodb',
] as const;
export type Destination = typeof destinations[number];
