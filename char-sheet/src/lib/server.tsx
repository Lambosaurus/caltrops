const SERVER_URI = 'https://nad7hr2keheheljlwvlkiyjtq40mwgzl.lambda-url.ap-southeast-2.on.aws/'

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

async function listContent(user: string): Promise<ServerItem[]> {
    const result = await post({
        user: user,
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

async function writeContent(user: string, id: string, title: string, content: any): Promise<boolean> {
    const result = await post({
        user: user,
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

async function login(user: string | null = null): Promise<string | null> {
    if (user){
        localStorage.setItem('caltrops-user', user)
    }
    return user;
}

async function logout(): Promise<string | null> {
    localStorage.removeItem('caltrops-user')
    return null
}

function restoreLogin(): string | null {
    return localStorage.getItem('caltrops-user')
}

const server = {
    list: listContent,
    read: readContent,
    write: writeContent,
    login: login,
    logout: logout,
    restoreLogin: restoreLogin,
}

export default server;