import consoleAction from "./console";
import localFileAction from "./local-file";

export default async function commanderAction(opts: Options): Promise<never> {
    if (opts.destination === "console") await consoleAction(opts);
    if (opts.destination === "local-file") await localFileAction(opts);
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
