import path from "path";
import fs from "fs";
import { EOL } from "os";
import log from "../../config/logger";
import searchByRut from "../../business-logic/elrutificador/search-by-rut";
import { formatRut, calculateDv } from "../../util/rut";

export default async function commanderAction(opts: Options) {
    if (opts.destination === "console") {
        if (typeof opts.rut === "string") {
            const formattedRut = formatRut(opts.rut);
            if (!formattedRut) {
                log.error(`${opts.source}: given rut ${opts.rut} is not a valid`)
                process.exit(1);
            }
            
            if (opts.source === "elrutificador") {
                const data = await searchByRut(formattedRut);
                console.table(data);
                process.exit(1);
            }
            process.exit(1);
        }
        process.exit(1);
    }
    else if (opts.destination === "local-file") {
        const outFilePath = path.resolve(opts.outPath ?? "");
        const writeStream = fs.createWriteStream(outFilePath);
        if (typeof opts.rut === "string") {
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
            process.exit(1);
        } else {
            
            if (opts.source === "elrutificador") {
                for (var i = opts.rut.from;i <= opts.rut.to;i++) {
                    const rut = `${i}-${calculateDv(i)}`;
                    const formattedRut = formatRut(rut);
                    if (!formattedRut) {
                        log.error(`${opts.source}: given rut ${opts.rut} is not a valid`)
                        process.exit(1);
                    }
                    const data = await searchByRut(formattedRut)
                        .catch(() => undefined)
                    ;

                    if (data) {
                        log.info(`${opts.source}: data found for rut ${rut}`);
                        writeStream.write(Buffer.from(JSON.stringify(data).concat(EOL)));
                        log.info(`${opts.source}: wrote found data for rut ${rut} to ${opts.outPath}`);
                    } else {
                        log.info(`${opts.source}: data not found for rut ${rut}, skipping`);
                    }
                }
                writeStream.close();
                process.exit(0);
            }
            process.exit(1);
        }
        process.exit(1);
    }
}

type Options = {
    source: InformationSource;
    outFile: boolean;
    outPath?: string;
    rut: string | { from: number, to: number };
    destination: Destination;
}


export const informationSources = ["elrutificador"] as const;
export type InformationSource = typeof informationSources[number];

export const destinations = ["console", "local-file"] as const;
export type Destination = typeof destinations[number];
