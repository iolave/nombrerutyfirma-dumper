import path from "path";
import fs from "fs";
import { EOL } from "os";
import { Options } from ".";
import { calculateDv, formatRut } from "../../util/rut";
import log from "../../config/logger";
import elrutificadorByRut from "../../information-sources/elrutificador/search-by-rut";

export default async function localFileAction(opts: Options): Promise<never> {
    const outFilePath = path.resolve(opts.outPath ?? "");
    const writeStream = fs.createWriteStream(outFilePath);

    if (typeof opts.rut === "number") {
        const rut = formatRut(`${opts.rut}-${calculateDv(opts.rut)}`);

        if (!rut) {
            log.error(`${opts.source}: given rut ${rut} is not a valid`);
            process.exit(1);
        }

        if (opts.source === "elrutificador") {
            await elrutificadorByRut(rut)
                .then(JSON.stringify)
                .then(res => res.concat(EOL))
                .then(Buffer.from)
                .then((buf) => { writeStream.write(buf) })
                .then(() => log.info(`${opts.source}: wrote found data for rut ${opts.rut} to ${opts.outPath}`))
                .then(() => writeStream.close())
                .catch((error: Error) => {
                    writeStream.close();
                    if (!error.message) throw error;
                    if (error.message !== "elrutificador_error: no table found in html") throw error;
                    log.info(`${opts.source}: data not found for rut ${rut}`);
                    process.exit(1);
                })
            ;

            process.exit(0);
        }

        process.exit(1);
    } else {
        if (opts.source === "elrutificador") {
            for (var i = opts.rut.from;i <= opts.rut.to;i++) {
                const rut = formatRut(`${i}-${calculateDv(i)}`);

                if (!rut) {
                    log.error(`${opts.source}: given rut ${rut} is not a valid`);
                    process.exit(1);
                }

                await elrutificadorByRut(rut)
                    .then(JSON.stringify)
                    .then(res => res.concat(EOL))
                    .then(Buffer.from)
                    .then((buf) => { writeStream.write(buf) })
                    .then(() => log.info(`${opts.source}: wrote found data for rut ${rut} to ${opts.outPath}`))
                    .catch((error: Error) => {
                        if (!error.message) {
                            writeStream.close();
                            throw error;
                        }
                        if (error.message !== "elrutificador_error: no table found in html") {
                            writeStream.close();
                            throw error;
                        }
                        log.info(`${opts.source}: data not found for rut ${rut}, skipping`);
                    })
                ;

            }
            writeStream.close();
            process.exit(0);
        }
        process.exit(1);
    }
}
