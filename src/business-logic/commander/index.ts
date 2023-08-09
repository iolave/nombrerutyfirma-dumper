import path from "path";
import fs from "fs";
import { EOL } from "os";
import log from "../../config/logger";
import searchByRut from "../../business-logic/elrutificador/search-by-rut";
import { formatRut } from "../../util/rut";

export default async function commanderAction(opts: Options) {
    if (opts.source === "elrutificador") {
        if (opts.outFile) {
            const outFilePath = path.resolve(opts.outPath ?? "");
            const writeStream = fs.createWriteStream(outFilePath);

            const formattedRut = formatRut(opts.rut);
            if (!formattedRut) {
                log.error(`given rut ${opts.rut} is not a valid`)
                process.exit(1);
            };

            const data = await searchByRut(formattedRut);
            log.debug(outFilePath);
            writeStream.write(Buffer.from(JSON.stringify(data).concat(EOL)));
            writeStream.close();
        }
    }
}

type Options = {
    source: InformationSource;
    outFile: boolean;
    outPath?: string;
    rut: string;
}


export const informationSources = ["elrutificador"] as const;
export type InformationSource = typeof informationSources[number];
