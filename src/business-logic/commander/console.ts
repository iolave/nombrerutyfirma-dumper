import { Options } from ".";
import { calculateDv, formatRut } from "../../util/rut";
import log from "../../config/logger";
import elrutificadorByRut from "../../business-logic/elrutificador/search-by-rut";

export default async function consoleAction(opts: Options): Promise<never> {
    if (typeof opts.rut === "number") {
        const rut = formatRut(`${opts.rut}-${calculateDv(opts.rut)}`);

        if (!rut) {
            log.error(`${opts.source}: given rut ${rut} is not a valid`);
            process.exit(1);
        }
        
        if (opts.source === "elrutificador") {
            await elrutificadorByRut(rut)
                .then(JSON.stringify)
                .then(log.info)
                .catch((error: Error) => {
                    if (!error.message) throw error;
                    if (error.message !== "elrutificador_error: no table found in html") throw error;
                    log.info(`${opts.source}: data not found for rut ${rut}`);
                    process.exit(1);
                })
            ;
            process.exit(0);
        }

        process.exit(1);
    }
    // when rut.from and rut.to properties are available
    else {        
        for (let i = opts.rut.from;i <= opts.rut.to;i++) {
            const rut = formatRut(`${i}-${calculateDv(i)}`);

            if (!rut) {
                log.error(`rut ${rut} is not valid, skipping`);
                break;
            };

            await elrutificadorByRut(rut)
                .then(JSON.stringify)
                .then(log.info)
                .catch((error: Error) => {
                    if (!error.message) throw error;
                    if (error.message !== "elrutificador_error: no table found in html") throw error;
                    log.info(`${opts.source}: data not found for rut ${rut}, skipping`);
                })
            ;
        }

        process.exit(0);
    }
}
