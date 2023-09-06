import fetch, { FetchError } from 'node-fetch-commonjs';
import { NRYFError } from '../../util/errors';
import log from "../../config/logger";
import { unixTimestamp } from '../../util/date';

const source = 'nombrerutyfirma';
const baseUrl = 'https://www.nombrerutyfirma.com/';

export default async function searchByRut(rut: string, maxRetries?: number): Promise<NombreRutYFirmaResponse> {
    try {
        log.debug(`${source}: querying person by rut ${rut}`);
        const html = await retrieveHtml(rut);

        const data = extractDataFromHtml(html);
        return data;
    } catch (error: unknown) {
        return handleRetry(rut, error, maxRetries)
    }
}

function extractDataFromHtml(html: string): NombreRutYFirmaResponse {
    if (html.toUpperCase().includes("YOU ARE BEING RATE LIMITED")) {
        throw new NRYFError(
            `${source}_error`,
            'cf_rate_limited',
            `You are being rate limited`,
        );
    }

    const htmlWithoutLineBreaks = html.replace(/[\r\n]/gm, '');
    
    const tableRegex = /<tbody>.*<\/tbody>/
    const tableRegexMatch = htmlWithoutLineBreaks.match(tableRegex);

    if (!tableRegexMatch) {
        // TODO: add cloudflare errors
        throw new NRYFError(
            `${source}_error`,
            'todo_handle_error',
            `no table regex match`,
        );
    }

    const rawHtmlTable = tableRegexMatch.at(0);
    if (!rawHtmlTable) {
        // TODO: set a proper error
        throw new NRYFError(
            `${source}_error`,
            'todo_handle_error',
            `no raw table found`,
        )
    }

    const dataRegex = /<td>(.*)<\/td>.*<td.*>(.*)<\/td>.*<td>(.*)<\/td>.*<td>(.*)<\/td>.*<td>(.*)<\/td>.*/
    const dataMatch = rawHtmlTable.match(dataRegex);

    if (dataMatch === null) {
        throw new NRYFError(
            `${source}_error`,
            'data_not_found',
            `no table found within html`,
        );
    }

    return {
        id: dataMatch.at(2)??"",
        name: dataMatch.at(1)??"",
        gender: dataMatch?.at(3)?.toUpperCase() === "VAR" ? "MALE": dataMatch?.at(3)?.toUpperCase() === "MUJ" ? "FEMALE" : null,
        address: dataMatch?.at(4)??null,
        city: dataMatch?.at(5)??null,
        timestamp: unixTimestamp(),
        source: "nombrerutyfirma.com",
    }
}

async function retrieveHtml(rut: string): Promise<string> {
    const body = new FormData();
    body.append("term", rut);

    const response = await fetch(`${baseUrl}/rut`, {
        method: "POST",
        body,
    }).catch((err: FetchError) => {
        throw new NRYFError(
            `${source}_error`,
            'fetch_error',
            err.message,
        );
    });

    const html = await response.text().catch((err: Error) => {
        throw new NRYFError(
            `${source}_error`,
            'fetch_error',
            `${err.name} ${err.message}`,
        );
    })

    return html
}

export async function handleRetry(rut: string, error: unknown, retriesLeft?: number): Promise<NombreRutYFirmaResponse> {
    if (!(error instanceof NRYFError)) throw error
    
    if (error.code === 'fetch_error') {
        const sleepTime = 5000;
        log.warn(`${source}: ${error.code} - ${error.message}, retrying in ${sleepTime} ms...`);
        await new Promise(resolve => setTimeout(() => resolve(undefined), sleepTime))
        return await searchByRut(rut, retriesLeft ? retriesLeft-1 : retriesLeft);
    }

    if (error.code === 'cf_rate_limited') {
        const sleepTime = 600000;
        log.warn(`${source}: ${error.code} - ${error.message}, retrying in ${sleepTime} ms...`);
        await new Promise(resolve => setTimeout(() => resolve(undefined), sleepTime))
        return await searchByRut(rut, retriesLeft ? retriesLeft-1 : retriesLeft);
    }

    throw error;
}

type NombreRutYFirmaResponse = {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    gender: "MALE" | "FEMALE" | null;
    timestamp: number;
    source: "nombrerutyfirma.com";
}
