import { tmpdir } from "os";
import consoleAction from "./console";
import localFileAction from "./local-file";

export default async function commanderAction(opts: Options): Promise<never> {
    if (opts.destination === "console") {
        if (typeof opts.rut === "number") {
            await consoleAction({
                type: "single-rut",
                rut: opts.rut,
                source: opts.source,
            });
        } else {
            await consoleAction({
                type: "ruts-range",
                from: opts.rut.from,
                to: opts.rut.to,
                source: opts.source,
            });
        }
    }

    if (opts.destination === "local-file") {
        const path = opts.outPath ?? tmpdir();

        if (typeof opts.rut === "number") {
            await localFileAction({
                type: "single-rut",
                rut: opts.rut,
                source: opts.source,
                path,
            });
        } else {
            await localFileAction({
                type: "ruts-range",
                from: opts.rut.from,
                to: opts.rut.to,
                source: opts.source,
                path,
            });
        }
    }
    process.exit(1);
}

export type Options = {
    source: InformationSource;
    outFile: boolean;
    outPath?: string;
    rut: number | { from: number, to: number };
    destination: Destination;
}


export const informationSources = ["elrutificador"] as const;
export type InformationSource = typeof informationSources[number];

export const destinations = ["console", "local-file"] as const;
export type Destination = typeof destinations[number];
