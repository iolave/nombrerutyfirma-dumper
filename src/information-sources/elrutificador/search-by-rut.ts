import { unixTimestamp } from "../../util/date";
import { NRYFError } from '../../util/errors';
import log from "../../config/logger";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());


var cfToken = "";
export default async function elrutificadorByRut(rut: string, maxRetries?: number): Promise<ElRutificadorResponse> {
    try {
        log.debug(`elrutificador: querying person by rut ${rut}`);

        const token = await retrieveToken(rut, cfToken);
        log.debug(`elrutificador: retrieved token for rut ${rut}: ${token}`);

        const html = await retrieveHtml(token, cfToken);
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
    if (error.code === "ip_banned") sleepTime = 10000;
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

async function retrieveHtml(token: string, cloudFlareToken: string): Promise<string> {
    const url = new URL("https://elrutificador.com");
    url.pathname = "/resultados/";

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("Accept-Encoding", "gzip, deflate, br");
    headers.append("Accept-Language", "en-US,en;q=0.8");
    headers.append("Cache-Control", "no-cache");
    headers.append("Connection", "keep-alive");
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Cookie", `cf_clearance=${cloudFlareToken};cf_use_ob=0`);
    headers.append("Host", `elrutificador.com`);
    headers.append("Origin", `https://elrutificador.com`);
    headers.append("Pragma", "no-cache");
    headers.append("Referer", "https://elrutificador.com/");
    headers.append("Sec-Ch-Ua", '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"');
    headers.append("Sec-Ch-Ua-Mobile", "?0");
    headers.append("Sec-Ch-Ua-Platform", '"macOS"');
    headers.append("Sec-Fetch-Dest", "document");
    headers.append("Sec-Fetch-Mode", "navigate");
    headers.append("Sec-Fetch-Site", "same-origin");
    headers.append("Sec-Gpc", "1");
    headers.append("Upgrade-Insecure-Requests", "1");
    headers.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36");
   

    const formData = new FormData();
    formData.append("jwt", token);
    formData.append("MIME Type", "application/x-www-form-urlencoded");

    const requestInit: RequestInit = {
        method: "POST",
        headers,
        body: formData
    }

    
    const response = await fetch(url, requestInit);
    const responseText = await response.text();
    // console.log(responseText);
    
    if (responseText.toUpperCase().includes("BANNED")) throw new NRYFError("elrutificador_error", "ip_banned", "Cloudflare banned the active ip");
    if (responseText.toUpperCase().includes("ACCESS DENIED")) throw new NRYFError("elrutificador_error", "cf_clearance_expired", "");
    
    return responseText;
}

async function retrieveToken(rut: string, cloudFlareToken: string): Promise<string> {
    const url = new URL("https://elrutificador.com");

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8");
    headers.append("Accept-Language", "en-US,en;q=0.8");
    headers.append("Cache-Control", "no-cache");
    headers.append("Cookie", `cf_clearance=rFkbmtyoUKIMgh3.3E0ds.7q_9ebT_ogx.VknAwziug-1693957581-0-1-e30fb622.ce8d8159.7f0595c2-0.2.1693957581;${cloudFlareToken}`);
    headers.append("Origin", "https://elrutificador.com");
    headers.append("Pragma", "no-cache");
    headers.append("Referer", "https://elrutificador.com/");
    headers.append("Sec-Ch-Ua", '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"');
    headers.append("Sec-Ch-Ua-Mobile", "?0");
    headers.append("Sec-Ch-Ua-Platform", '"macOS"');
    headers.append("Sec-Fetch-Dest", "document");
    headers.append("Sec-Fetch-Mode", "navigate");
    headers.append("Sec-Fetch-Site", "same-origin");
    headers.append("Sec-Fetch-User", "?1");
    headers.append("Sec-Gpc", "1");
    headers.append("Upgrade-Insecure-Requests", "1");
    headers.append("User-Agent", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36");
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const formData = new FormData();
    formData.set("term", rut);
    formData.set("opt", "rut");

    const requestInit: RequestInit = {
        method: "POST",
        headers,
        body: formData,
    }

    const response = await fetch(url, requestInit);
    const responseText = await response.text();

    const match = responseText.match(/value='(.*)\.(.*)\.(.*)'/)

    console.log(match, responseText)
    process.exit(1);

    // if (responseText.toUpperCase().includes("BANNED")) throw new NRYFError("elrutificador_error", "ip_banned", "Cloudflare banned the active ip");
    // if (responseText.toUpperCase().includes("ACCESS DENIED")) throw new NRYFError("elrutificador_error", "cf_clearance_expired", "");


    // const setCookieHeader = response.headers.get("Set-Cookie");
    // if (!setCookieHeader) throw new NRYFError("elrutificador_error", "cf_clearance_expired", "");
    // const cookies = setCookieHeader.split(";");
    // const jwt = cookies.filter(c => c.includes("jwt=")).at(0);

    // if (!jwt) throw new NRYFError("elrutificador_error", "no_jwt", "Failed to retrieve jwt token from the set-cookie header");
    // return jwt.slice(4);
    // return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2VscnV0aWZpY2Fkb3IuY29tIiwiZXhwIjoyNjkzOTU1ODA3LCJuYmYiOjE2OTM5NTU4MDQsInRlcm0iOiIxOS40MDguMTM4LTMiLCJvcHQiOiJydXQifQ.4aVQUPI_Bpk1YtIXDfcpOB0uPryux5yKD-8sLzScWC0";
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