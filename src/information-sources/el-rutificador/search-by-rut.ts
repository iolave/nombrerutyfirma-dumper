import { unixTimestamp } from "../../util/date";
import { NRYFError } from '../../util/errors';
import log from "../../config/logger";
// import axios from "axios";
import fetch, { FetchError, Headers } from "node-fetch-commonjs";
import axios from "axios";
// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";

// puppeteer.use(StealthPlugin());

const source = 'elrutificador';
const baseUrl = 'https://elrutificador.com';

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
    if (!(error instanceof NRYFError)) throw error;

    if (error.code === 'fetch_error') {
        const sleepTime = 5000;
        log.warn(`${source}: ${error.code} - ${error.message}, retrying in ${sleepTime} ms...`);
        await new Promise(resolve => setTimeout(() => resolve(undefined), sleepTime))
        return await elrutificadorByRut(rut, retriesLeft ? retriesLeft-1 : retriesLeft);
    }
    else if (error.code === "cf_ip_banned") {
        const sleepTime = 10000;
        log.warn(`${source}: ${error.code} - ${error.message}, retrying in ${sleepTime} ms...`);
        await new Promise(resolve => setTimeout(() => resolve(undefined), sleepTime))
        return await elrutificadorByRut(rut, retriesLeft ? retriesLeft-1 : retriesLeft);
    }
    else if (error.code === "cf_rate_limited") {
        const sleepTime = 60000;
        log.warn(`${source}: ${error.code} - ${error.message}, retrying in ${sleepTime} ms...`);
        await new Promise(resolve => setTimeout(() => resolve(undefined), sleepTime))
        return await elrutificadorByRut(rut, retriesLeft ? retriesLeft-1 : retriesLeft);
    }

    throw error;
}

function formatBirthdate(str: string): string {
    if (str === "") return str;
    if (!str.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)) return str;
    return `${str.slice(6, 10)}-${str.slice(3, 5)}-${str.slice(0, 2)}`;
}

function extractDataFromHtml(html: string): ElRutificadorResponse {
    if (html.toUpperCase().includes("BANNED")) {
        if (html.toUpperCase().includes("YOU ARE BEING RATE LIMITED")) {
            throw new NRYFError(`${source}_error`, 'cf_rate_limited', `You are being rate limited`);
        }
        throw new NRYFError(`${source}_error`, "cf_ip_banned", "Cloudflare banned the active ip");
    }

    if (html.toUpperCase().includes("NO HAY RESULTADOS PARA ESTE RUT")) {
        throw new NRYFError(`${source}_error`, 'data_not_found', 'Data not found within raw html');
    }

    const withoutLineBreaks = html.replace(/[\r\n]/gm, '');
    const tableRegexp = /<table.*>.*<\/table>/;
    const htmlTable = withoutLineBreaks.match(tableRegexp)?.[0];

    if (!htmlTable) {
        throw new NRYFError(`${source}_error`, 'todo_handle_error', html);
    }

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
    body.set("jwtx", token);

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    headers.append("Content-Encoding", "gzip, deflate, br");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Origin", "https://elrutificador.com");
    headers.append("Pragma", "no-cache");
    headers.append("Referer", "https://elrutificador.com/");
    headers.append("Sec-Ch-Ua", "?0");
    headers.append("Sec-Ch-Ua-Mobile", '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"');
    headers.append("Sec-Ch-Ua-Platform", '"macOS"');
    headers.append("Sec-Fetch-Dest", "document");
    headers.append("Sec-Fetch-Mode", "navigate");
    headers.append("Sec-Fetch-Site", "same-origin");
    headers.append("Upgrade-Insecure-Requests", "1");
    headers.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36");
    headers.append("Cookie", "cf_clearance=pj3sL7u3Pai7eREQRkpe9kmOOzzXcPlskPrcmxhTRmA-1694026452-0-1-d7193ef.2bb64171.a81487b-0.2.1694026452");

    // const response = await fetch(`${baseUrl}/resultados/`, {
    //     method: 'POST',
    //     body,
    //     headers,
    // }).catch((err: FetchError) => {
    //     throw new NRYFError(`${source}_error`, 'fetch_error', err.message);
    // });

    // const html = await response.text()
    //     .catch((err: Error) => {
    //         throw new NRYFError(`${source}_error`, 'fetch_error', `${err.name} ${err.message}`)
    //     })
    // ;
    
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

    // return html;
    console.log(response.data)
    return response.data;

}

async function retrieveToken(rut: string): Promise<string> {
    const body = new FormData();
    body.append("term", rut);
    body.append("opt", "rut");

    const response = await fetch(baseUrl, {
        method: 'POST',
        body,
    }).catch((err: FetchError) => {
        throw new NRYFError(`${source}_error`, 'fetch_error', err.message);
    });

    const html = await response.text()
        .catch((err: Error) => {
            throw new NRYFError(`${source}_error`, 'fetch_error', `${err.name} ${err.message}`)
        })
    ;

    if (html.toUpperCase().includes("BANNED")) {
        if (html.toUpperCase().includes("YOU ARE BEING RATE LIMITED")) {
            throw new NRYFError(`${source}_error`, 'cf_rate_limited', `You are being rate limited`);
        }
        throw new NRYFError(`${source}_error`, "cf_ip_banned", "Cloudflare banned the active ip");
    }

    const match = html.match(/value='(.*)\.(.*)\.(.*)'/)?.at(0);
    if (!match) throw new NRYFError(`${source}_error`, "no_jwt", "No JWT found within response");

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