import { InformationSource } from ".";
import { calculateDv, formatRut } from "../../util/rut";
import log from "../../config/logger";
import elrutificadorByRut from "../../information-sources/el-rutificador/search-by-rut";
import NombreRutYFirma from "../../information-sources/nombre-rut-y-firma";
import { NRYFError } from "../../util/errors";

export type SingleRutOptions = {
    type: "single-rut",
    source: InformationSource,
    rut: number,
    maxRetries?: number,
}

export type RutsRangeOptions = {
    type: "ruts-range",
    source: InformationSource,
    from: number,
    to: number,
    batchSize?: number;
    maxRetries?: number,
}

export type MultipleRutsOptions = {
    type: "multiple-ruts",
    source: InformationSource,
    ruts: number[],
    batchSize?: number;
    maxRetries?: number,
}

export type ConsoleActionOptions = SingleRutOptions | RutsRangeOptions | MultipleRutsOptions;

export default async function consoleAction(opts: ConsoleActionOptions): Promise<never> {
    if (opts.type === "single-rut") {
        const rut = formatRut(`${opts.rut}-${calculateDv(opts.rut)}`);

        if (!rut) {
            log.error(`${opts.source}: given rut ${rut} is not a valid`);
            process.exit(1);
        }

        if (opts.source === "elrutificador") {
            await elrutificadorByRut(rut, opts.maxRetries)
                .then(JSON.stringify)
                .then(log.info)
                .catch((error: NRYFError) => {
                    if (error.code !== "data_not_found") {
                        log.error(`${opts.source}: ${JSON.stringify(error)}`);
                        throw error;
                    }

                    log.info(`${opts.source}: data not found for rut ${rut}`);
                    process.exit(1);
                })
            ;
            process.exit(0);
        }
        else if (opts.source === "nombrerutyfirma") {
            await NombreRutYFirma.searchByRut(rut)
                .then(JSON.stringify)
                .then(log.info)
                .catch((error: NRYFError) => {
                    if (error.code !== "data_not_found") {
                        log.error(`${opts.source}: ${JSON.stringify(error)}`);
                        throw error;
                    }

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
        const promises = [];
        var promise: Promise<any> = Promise.resolve(undefined);

        for (let i = opts.from;i <= opts.to;i++) {
            const rut = formatRut(`${i}-${calculateDv(i)}`);

            if (!rut) {
                log.error(`rut ${rut} is not valid, skipping`);
                break;
            };

            if (opts.source === "elrutificador") {
                promise = elrutificadorByRut(rut, opts.maxRetries)
                    .then(JSON.stringify)
                    .then(log.info)
                    .catch((error: NRYFError) => {
                        if (error.code !== "data_not_found") {
                            log.error(`${opts.source}: ${JSON.stringify(error)}`);
                            throw error;
                        }
                        log.info(`${opts.source}: data not found for rut ${rut}, skipping`);
                    })
                ;
            }
            else if (opts.source === "nombrerutyfirma") {
                promise = NombreRutYFirma.searchByRut(rut, opts.maxRetries)
                    .then(JSON.stringify)
                    .then(log.info)
                    .catch((error: NRYFError) => {
                        if (error.code !== "data_not_found") {
                            log.error(`${opts.source}: ${JSON.stringify(error)}`);
                            throw error;
                        }
                        log.info(`${opts.source}: data not found for rut ${rut}, skipping`);
                    })
                ;
            }

            if (!opts.batchSize) await promise;
            else {
                if (promises.length < opts.batchSize - 1) promises.push(promise);
                else {
                    await Promise.all(promises);
                    promises.splice(0, promises.length);
                }
            }

        }
        
        await Promise.all(promises);
        process.exit(0);
    }

    if (opts.type === "multiple-ruts") {
        const promises = [];
        var promise: Promise<any> = Promise.resolve(undefined);

        for (const rutWithoutDv of opts.ruts) {
            const rut = formatRut(`${rutWithoutDv}-${calculateDv(rutWithoutDv)}`);

            if (!rut) {
                log.error(`rut ${rut} is not valid, skipping`);
                break;
            };

            if (opts.source === "elrutificador") {
                promise = elrutificadorByRut(rut, opts.maxRetries)
                    .then(JSON.stringify)
                    .then(log.info)
                    .catch((error: NRYFError) => {
                        if (error.code !== "data_not_found") {
                            log.error(`${opts.source}: ${JSON.stringify(error)}`);
                            throw error;
                        }
                        log.info(`${opts.source}: data not found for rut ${rut}, skipping`);
                    })
                ;
            }
            else if (opts.source === "nombrerutyfirma") {
                promise = NombreRutYFirma.searchByRut(rut, opts.maxRetries)
                    .then(JSON.stringify)
                    .then(log.info)
                    .catch((error: NRYFError) => {
                        if (error.code !== "data_not_found") {
                            log.error(`${opts.source}: ${JSON.stringify(error)}`);
                            throw error;
                        }
                        log.info(`${opts.source}: data not found for rut ${rut}, skipping`);
                    })
                ;
            }

            if (!opts.batchSize) await promise;
            else {
                if (promises.length < opts.batchSize) promises.push(promise);
                else {
                    await Promise.all(promises);
                    promises.splice(0, promises.length);
                }
            }
        }

        await Promise.all(promises);
        process.exit(0);
    }

    process.exit(1);
}
