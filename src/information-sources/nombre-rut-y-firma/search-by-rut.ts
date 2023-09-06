import fetch, { FetchError } from 'node-fetch-commonjs';
import { NRYFError } from '../../util/errors';

export default async function searchByRut(rut: string): Promise<string> {
    const html = await retrieveHtml(rut);
    console.log(html);
    return html;
}

async function retrieveHtml(rut: string): Promise<string> {
    const body = new FormData();
    body.append("term", rut);

    const response = await fetch('https://www.nombrerutyfirma.com/rut', {
        method: "POST",
        body,
    }).catch((error: FetchError) => {
        throw new NRYFError(
            'nombrerutyfirma_error',
            'fetch_error',
            error.message,
        )
    })

    return response.text()
}