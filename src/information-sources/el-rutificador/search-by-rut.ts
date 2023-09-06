import { unixTimestamp } from "../../util/date";
import { NRYFError } from '../../util/errors';
import log from "../../config/logger";
// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
import axios from "axios";

// puppeteer.use(StealthPlugin());


export default async function elrutificadorByRut(rut: string, maxRetries?: number): Promise<ElRutificadorResponse> {
    try {
        log.debug(`elrutificador: querying person by rut ${rut}`);

        const token = await retrieveToken(rut);
        log.debug(`elrutificador: retrieved token for rut ${rut}: ${token}`);

        const html = await retrieveHtml(token);
        log.debug(`elrutificador: retrieved html for ${rut}`);

        const data = extractDataFromHtml(html);
        log.debug(`elrutificador: scrapped html for ${rut}`);

        return data;
    } catch (error: unknown) {
        return handleRetry(rut, error, maxRetries)
    }
}

type ElRutificadorResponse = {
    id: string;
    name: string;
    address: string;
    city: string;
    gender: "MALE" | "FEMALE";
    birthdate: string;
    timestamp: number;
    source: "elrutificador.com";
}

async function handleRetry(rut: string, error: unknown, retriesLeft?: number): Promise<ElRutificadorResponse> {
    if (!(error instanceof NRYFError)) {
        if (typeof error !== 'object' || error === null) throw error;
        if (!('cause' in error)) throw error;
        if (typeof error.cause !== 'object' || error.cause === null) throw error;
        if (!('code' in error.cause)) throw error;
    
        if (error.cause.code === "UND_ERR_CONNECT_TIMEOUT") {
            if (!retriesLeft || retriesLeft !== 0) {
                const sleepTime = 5000;
                log.warn(`elrutificador: connection timed out, retrying in ${sleepTime} ms...`);
                await new Promise(resolve => setTimeout(() => resolve(undefined), sleepTime))
                return await elrutificadorByRut(rut, retriesLeft ? retriesLeft-1 : retriesLeft);
            }
        }
    
        throw error;
    }


    var sleepTime = 5000;
    if (error.name !== "elrutificador_error") throw error;
    if (error.code === "cf_ip_banned") sleepTime = 10000;
    // if (error.code === "cf_clearance_expired") cfToken = await getCfClearance();

    log.warn(`elrutificador: ${error.code} - ${error.message}, retrying in ${sleepTime} ms...`);
    await new Promise(resolve => setTimeout(() => resolve(undefined), sleepTime))

    return await elrutificadorByRut(rut, retriesLeft ? retriesLeft-1 : retriesLeft);
}

function formatBirthdate(str: string): string {
    if (str === "") return str;
    if (!str.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)) return str;
    return `${str.slice(6, 10)}-${str.slice(3, 5)}-${str.slice(0, 2)}`;
}

function extractDataFromHtml(html: string): ElRutificadorResponse {
    const withoutLineBreaks = html.replace(/[\r\n]/gm, '');
    const tableRegexp = /<table.*>.*<\/table>/;
    const htmlTable = withoutLineBreaks.match(tableRegexp)?.[0];

    if (!htmlTable) throw new Error("elrutificador_error: no table found in html");

    const itemsRegexp = /(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)/
    const itemRegexp = /<td.*>.*<\/td>\s*<td.*>(.*)<\/td>/

    const items = htmlTable.match(itemsRegexp)?.map(e => e.match(itemRegexp)?.[1]);
    return {
        id: items?.at(2) ?? "",
        name: items?.at(3) ?? "",
        address: items?.at(5) ?? "",
        gender: items?.at(6)?.toUpperCase() === "MASCULINO" ? "MALE": "FEMALE",
        city: items?.at(7) ?? "",
        birthdate: formatBirthdate(items?.at(8) ?? ""),
        timestamp: unixTimestamp(),
        source: "elrutificador.com",
    };
}

async function retrieveHtml(token: string): Promise<string> {
    const body = new FormData();
    body.append("jwt", token);

    const response = await axios<any, { data: string }>({
        method: "post",
        url: "https://elrutificador.com/resultados",
        data: body,
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Content-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://elrutificador.com",
            "Pragma": "no-cache",
            "Referer": "https://elrutificador.com/",
            "Sec-Ch-Ua": "?0",
            "Sec-Ch-Ua-Mobile": '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
            "Sec-Ch-Ua-Platform": '"macOS"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Upgrade-Insecure-Requests": "1"
        }
    });

    return response.data
}

async function retrieveToken(rut: string): Promise<string> {

    const body = new FormData();
    body.append("term", rut);
    body.append("opt", "rut");

    const response = await axios<any, { data: string }>({
        method: "post",
        url: "https://elrutificador.com",
        data: body,
    });

    if (response.data.toUpperCase().includes("BANNED")) throw new NRYFError("elrutificador_error", "cf_ip_banned", "Cloudflare banned the active ip");
    const match = response.data.match(/value='(.*)\.(.*)\.(.*)'/)?.at(0);
    if (!match) throw new NRYFError("elrutificador_error", "no_jwt", "no jwt found within response");
    return match.slice(7,-12);
}

/* 
    on centos-like linux install to fix an issue:
        sudo yum install -y chromium
*/
// async function getCfClearance() {
//     const browser = await puppeteer.launch({ headless: true, args: [ '--no-startup-widnow' ] });
//     const page = await browser.newPage();
//     await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15");
//     await page.goto("https://elrutificador.com");
//     await new Promise(r => setTimeout(r, 10000));
//     const cookies = await page.cookies();

//     const cfClearanceCookie = cookies.filter(c => c.name === "cf_clearance").at(0);
//     if (!cfClearanceCookie) throw new Error("Elrutificador cf_clearance cookie generation error");

//     await browser.close();
//     return cfClearanceCookie.value;
// }