import { Dictionary } from "./rules"

const SERVER_URI = 'https://caltrops.tlembedded.com/api/v2'

export interface Document {
    owner: string,
    time: string,
    id: string,
    title: string,
    type: string,
    content?: any,
}

async function request(method: "GET"|"POST"|"PATCH"|"PUT"|"DELETE", resource: string, token: string|undefined = undefined, body: any = undefined): Promise<any> {

    let headers: any = {
        'Accept': 'application/json'
    }
    if (body) {
        headers['Content-Type'] = "application/json"
        body =  JSON.stringify(body)
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const result = await fetch( `${SERVER_URI}/${resource}`, {
            method: method,
            headers: headers,
            body: body
        })

    const text = await result.text()
    const json = text ? JSON.parse(text) : null

    if (result.status > 299) {
        throw Error(json.error)
    }

    return json
}

async function listDocuments(token: string, type: string): Promise<Document[]> {
    return await request("GET", `documents?type=${type}`, token)
}

async function readDocument(id: string): Promise<Document> {
    return await request("GET", `documents/${id}`)
}

async function writeDocument(token: string, id: string, type: string, title: string, content: any) {
    await request("PUT", `documents/${id}`, token, {
        type: type,
        title: title,
        content: content
    })
}

async function deleteDocument(token: string, id: string) {
    await request("DELETE", `documents/${id}`, token)
}

async function updateDocument(token: string, id: string, content: any, path: string|undefined = undefined, share_token: string|undefined = undefined) {
    await request("PATCH", `documents/${id}`, token, {
        path: path,
        content: content,
        token: share_token
    })
}

async function shareDocument(token: string, id: string, user: string|undefined, path: string|undefined) {
    let result = await request("POST", `documents/${id}/share`, token, {
        path: path,
        user: user,
    })
    return result.token;
}

async function requestToken(email: string) {
    await request("POST", "register", undefined, {
        user: email
    })
}

function parseToken(token: string): string | null {
    try {
        const [text, signature] = token.split('.')
        const sig_size = (atob(signature).length * 8)
        if (sig_size !== 256) {
            return null
        }
        const payload = JSON.parse(atob(text)) //JSON.parse(Buffer.from(text, 'base64').toString())
        return payload.user ?? null
    }
    catch {
        return null;
    }
}

const server = {
    list: listDocuments,
    read: readDocument,
    write: writeDocument,
    update: updateDocument,
    delete: deleteDocument,
    share: shareDocument,
    parseToken: parseToken,
    requestToken: requestToken,
}

export default server;