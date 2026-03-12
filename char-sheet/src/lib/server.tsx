const SERVER_URI = 'https://caltrops.tlembedded.com/api/'

export interface ServerItem {
    owner: string,
    time: string,
    id: string,
    title: string,
    content?: any,
}

async function post(body: any): Promise<any> {
    const result = await fetch(SERVER_URI, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    const json = await result.json()
    if (json.error) {
        throw Error(json.error)
    }
    return json;
}

async function listContent(token: string): Promise<ServerItem[]> {
    const result = await post({
        token: token,
        list: "*",
    })
    return result.list;
}

async function readContent(id: string): Promise<ServerItem> {
    const result = await post({
        read: [ id ]
    })
    if (!result.read.length || !result.read[0]) {
        throw Error(`Sheet ${id} not found!`)
    }
    return result.read[0]
}

async function writeContent(token: string, id: string, title: string, content: any): Promise<boolean> {
    const result = await post({
        token: token,
        write: [
            {
                id: id,
                title: title,
                content: content,
            }
        ]
    })
    return true;
}

async function deleteContent(token: string, id: string): Promise<ServerItem[]> {
    const result = await post({
        token: token,
        delete: [
            id
        ],
        list: "*",
    })
    return result.list
}

async function requestToken(email: string): Promise<boolean> {
    const result = await post({
        register: email
    })
    return true;
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
    list: listContent,
    read: readContent,
    write: writeContent,
    delete: deleteContent,
    parseToken: parseToken,
    requestToken: requestToken,
}

export default server;