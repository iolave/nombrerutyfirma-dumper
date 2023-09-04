// import { unixTimestamp } from "../../util/date";
import log from "../../config/logger";

export default async function elrutificadorByRut(rut: string, maxRetries?: number): Promise<ElRutificadorResponse> {
    try {
        log.debug(`elrutificador: querying person by rut ${rut}`);
        const token = await retrieveToken(rut);
        log.debug(`elrutificador: retrieved token for rut ${rut}: ${token}`);
        // const html = await retrieveHtml(token);
        // console.log(html);
        process.exit(0);
        // log.debug(`elrutificador: retrieved html for ${rut}`);
        // const data = extractDataFromHtml(html);
        // log.debug(`elrutificador: scrapped html for ${rut}`);
        // return data;
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

// function formatBirthdate(str: string): string {
//     if (str === "") return str;
//     if (!str.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)) return str;
//     return `${str.slice(6, 10)}-${str.slice(3, 5)}-${str.slice(0, 2)}`;
// }

// function extractDataFromHtml(html: string): ElRutificadorResponse {
//     const withoutLineBreaks = html.replace(/[\r\n]/gm, '');
//     const tableRegexp = /<table.*>.*<\/table>/;
//     const htmlTable = withoutLineBreaks.match(tableRegexp)?.[0];

//     if (!htmlTable) throw new Error("elrutificador_error: no table found in html");

//     const itemsRegexp = /(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)(<tr>.*<\/tr>\s*)/
//     const itemRegexp = /<td.*>.*<\/td>\s*<td.*>(.*)<\/td>/

//     const items = htmlTable.match(itemsRegexp)?.map(e => e.match(itemRegexp)?.[1]);
//     return {
//         id: items?.at(2) ?? "",
//         name: items?.at(3) ?? "",
//         address: items?.at(5) ?? "",
//         gender: items?.at(6)?.toUpperCase() === "MASCULINO" ? "MALE": "FEMALE",
//         city: items?.at(7) ?? "",
//         birthdate: formatBirthdate(items?.at(8) ?? ""),
//         timestamp: unixTimestamp(),
//         source: "elrutificador.com",
//     };
// }

// async function retrieveHtml(token: string): Promise<string> {
//     const url = new URL("https://elrutificador.com");
//     url.pathname = "/resultados/";

//     const headers = new Headers();
//     headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
//     headers.append("Accept-Encoding", "gzip, deflate, br");
//     headers.append("Accept-Language", "en-US,en;q=0.9");
//     headers.append("Connection", "keep-alive");
//     headers.append("Host", "elrutificador.com");
//     headers.append("Origin", "https://elrutificador.com");
//     headers.append("Referer", "https://elrutificador.com/");
//     headers.append("Sec-Fetch-Site", "same-origin");
//     headers.append("Sec-Fetch-Mode", "Navigate");
//     headers.append("Sec-Fetch-Dest", "document");
//     headers.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15");
//     headers.append("Content-Type", "application/x-www-form-urlencoded");

//     const requestInit: RequestInit = {
//         method: "GET",
//         headers,
//     }
    
//     const res = await fetch(url, requestInit).then(res => res.text());
    
//     return res;
// }

async function retrieveToken(rut: string): Promise<string> {
    console.log(rut);
    const url = new URL("https://elrutificador.com");
    url.pathname = "/";

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
    headers.append("Accept-Encoding", "gzip, deflate, br");
    headers.append("Accept-Language", "en-US,en;q=0.8");
    headers.append("Cache-Control", "no-cache");
    headers.append("Cookie", "cf_clearance=YgFoRBZDMkr0lRWLuJKgozrJTw_9Xh9.P3kazNuVpbo-1693857837-0-1-d7193ef.2bb64171.7d8678ed-0.2.1693857837");
    headers.append("Origin", "https://elrutificador.com");
    headers.append("Pragma", "no-cache");
    headers.append("Referer", "https://elrutificador.com/");
    headers.append("Sec-Ch-Ua", '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"');
    headers.append("Sec-Ch-Ua-Mobile", "?0");
    headers.append("Sec-Ch-Ua-Platform", '"macOS"');
    headers.append("Sec-Fetch-Site", "same-origin");
    headers.append("Sec-Fetch-Mode", "navigate");
    headers.append("Sec-Fetch-Dest", "document");
    headers.append("Sec-Fetch-User", "?1");
    headers.append("Sec-Gpc", "1");
    headers.append("Upgrade-Insecure-Requests", "1");
    headers.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15");

    const formData = new FormData();
    formData.set("term", "roberto");
    formData.set("opt", "name");

    const requestInit: RequestInit = {
        method: "POST",
        headers,
        body: formData,
    }

    const jwt = await fetch(url, requestInit)
        .then(async res => { 
            if ((await res.text()).includes("Access denied")) throw new Error("Elrutificador cf_clearance cookie header expired");
            return res
        })
        .then(res => res.headers.get("Set-Cookie"))
        .then(setCookie => {
            if (!setCookie) throw new Error("No set-cookie header in elrutificador response");
            return setCookie;
        })
        .then(setCookie => setCookie.split(";"))
        .then(cookies => cookies.filter(c => c.includes("jwt=")).at(0))
        .then(cookie => {
            if (!cookie) throw new Error("No jwt within set-cookie header in elrutificador response");
            return cookie.slice(4)
        })
    ;

    return jwt;
}
