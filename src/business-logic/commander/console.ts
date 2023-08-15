import { InformationSource } from ".";
import { calculateDv, formatRut } from "../../util/rut";
import log from "../../config/logger";
import elrutificadorByRut from "../../information-sources/elrutificador/search-by-rut";

export type SingleRutOptions = {
    type: "single-rut",
    source: InformationSource,
    rut: number,
}

export type RutsRangeOptions = {
    type: "ruts-range",
    source: InformationSource,
    from: number,
    to: number,
}

export type ConsoleActionOptions = SingleRutOptions | RutsRangeOptions;

export default async function consoleAction(opts: ConsoleActionOptions): Promise<never> {
    if (opts.type === "single-rut") {
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

        log.error(`${opts.source}: source information handler not found`);
        process.exit(1);
    }

    if (opts.type === "ruts-range") {
        for (let i = opts.from;i <= opts.to;i++) {
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

    process.exit(1);
}
