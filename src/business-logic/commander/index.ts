import path from "path";
import fs from "fs";
import { EOL } from "os";
import log from "../../config/logger";
import searchByRut from "../../business-logic/elrutificador/search-by-rut";
import { formatRut } from "../../util/rut";

export default async function commanderAction(opts: Options) {
    if (opts.destination === "console") {
        const formattedRut = formatRut(opts.rut);
        if (!formattedRut) {
            log.error(`${opts.source}: given rut ${opts.rut} is not a valid`)
            process.exit(1);
        }
        
        if (opts.source === "elrutificador") {
            const data = await searchByRut(formattedRut);
            console.table(data);
            process.exit(0);
        }
        process.exit(0);
    }
    else if (opts.destination === "local-file") {
        const outFilePath = path.resolve(opts.outPath ?? "");
        const writeStream = fs.createWriteStream(outFilePath);

        const formattedRut = formatRut(opts.rut);
        if (!formattedRut) {
            log.error(`${opts.source}: given rut ${opts.rut} is not a valid`)
            process.exit(1);
        }

        if (opts.source === "elrutificador") {
            const data = await searchByRut(formattedRut);
            log.info(`${opts.source}: data found for rut ${opts.rut}`);
            writeStream.write(Buffer.from(JSON.stringify(data).concat(EOL)));
            log.info(`${opts.source}: wrote found data for rut ${opts.rut} to ${opts.outPath}`);
            writeStream.close();
            process.exit(0);
        }
        process.exit(0);
    }
}

type Options = {
    source: InformationSource;
    outFile: boolean;
    outPath?: string;
    rut: string;
    destination: Destination;
}


export const informationSources = ["elrutificador"] as const;
export type InformationSource = typeof informationSources[number];

export const destinations = ["console", "local-file"] as const;
export type Destination = typeof destinations[number];
