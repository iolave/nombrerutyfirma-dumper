import { unixTimestamp } from "../../util/date";
import log from "../../config/logger";

export default async function elrutificadorByRut(rut: string): Promise<ElRutificadorResponse> {
    log.debug(`elrutificador: querying person by rut ${rut}`)
    const token = await retrieveToken(rut);
    log.debug(`elrutificador: retrieved token for rut ${rut}`);
    const html = await retrieveHtml(token);
    log.debug(`elrutificador: retrieved html for ${rut}`);
    const data = extractDataFromHtml(html);
    log.debug(`elrutificador: scrapped html for ${rut}`);
    return data;
}

type ElRutificadorResponse = {
    id: string;
    name: string;
    address: string;
    city: string;
    gender: "MALE" | "FEMALE";
    birthdate: string;
    timestamp: number;
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
    };
}

async function retrieveHtml(token: string): Promise<string> {
    const url = new URL("https://elrutificador.com");
    url.pathname = "/resultados";

    const headers = new Headers();
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.append("Accept-Encoding", "gzip, deflate, br");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("Connection", "keep-alive");
    headers.append("Host", "elrutificador.com");
    headers.append("Origin", "https://elrutificador.com");
    headers.append("Referer", "https://elrutificador.com/");
    headers.append("Sec-Fetch-Site", "same-origin");
    headers.append("Sec-Fetch-Mode", "Navigate");
    headers.append("Sec-Fetch-Dest", "document");
    headers.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15");
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const data = new URLSearchParams();
    data.append("t", token);
    data.append("MIME Type", "application/x-www-form-urlencoded");

    const requestInit: RequestInit = {
        method: "POST",
        headers,
        body: data.toString(),
    }

    const res = await fetch(url, requestInit).then(res => res.text());
    
    return res;
}

async function retrieveToken(rut: string): Promise<string> {
    const url = new URL("https://elrutificador.com");
    url.pathname = "/ctk/t";

    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Accept-Encoding", "gzip, deflate, br");
    headers.append("Accept-Language", "en-US,en;q=0.9");
    headers.append("Connection", "keep-alive");
    headers.append("Content-Type", "application/json");
    headers.append("Host", "elrutificador.com");
    headers.append("Origin", "https://elrutificador.com");
    headers.append("Referer", "https://elrutificador.com/");
    headers.append("Sec-Fetch-Site", "same-origin");
    headers.append("Sec-Fetch-Mode", "cors");
    headers.append("Sec-Fetch-Dest", "empty");
    headers.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15");

    const requestInit: RequestInit = {
        method: "POST",
        headers,
        body: JSON.stringify({
            trm: rut,
            method: "rut"
        })
    }

    const res = await fetch(url, requestInit).then(res => res.text());
    if (!res.match(/^[a-zA-Z0-9]+$/)) throw new Error(res);

    return res;
}
