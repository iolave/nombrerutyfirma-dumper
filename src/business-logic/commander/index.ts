import { tmpdir } from "os";
import consoleAction from "./console";
import localFileAction from "./local-file";
import { ProgramOptions } from "../../cli";

export default async function commanderAction(opts: ProgramOptions): Promise<never> {
    if (opts.output === "console") {
        if (opts.queryType === "single-rut") {
            await consoleAction({
                type: opts.queryType,
                rut: opts.rut,
                source: opts.source,
            });
        }
        if (opts.queryType === "ruts-range") {
            await consoleAction({
                type: opts.queryType,
                from: opts.fromRut,
                to: opts.toRut,
                source: opts.source,
            });
        }
    }

    if (opts.output === "local-file") {
        const path = opts.outPath ?? tmpdir();
        
        if (opts.queryType === "single-rut") {
            await localFileAction({
                type: opts.queryType,
                rut: opts.rut,
                source: opts.source,
                path,
            });
        }
        if (opts.queryType === "ruts-range") {
            await localFileAction({
                type: opts.queryType,
                from: opts.fromRut,
                to: opts.toRut,
                source: opts.source,
                path,
            });
        }
    }
    process.exit(1);
}

export const informationSources = ["elrutificador"] as const;
export type InformationSource = typeof informationSources[number];

export const destinations = ["console", "local-file"] as const;
export type Destination = typeof destinations[number];
