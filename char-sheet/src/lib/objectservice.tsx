import { useSyncExternalStore } from "react"

type Listener = () => void

class ObjectService {

    private obj: any
    private listeners: Map<string, Set<Listener>>
    private views: Map<string, View>

    constructor(obj: any = {}) {
        this.obj = obj
        this.listeners = new Map()
        this.views = new Map()
    }

    view(path: string) {
        // Cache these. This provides reliable identities
        let view = this.views.get(path)
        if (!view) {
            view = new View(this, path)
            this.views.set(path, view)
        }
        return view;
    }

    read(path: string): any {
        let node = this.obj
        for (let key of this.splitPath(path)) {
            node = node[key]
            if (!node)
                return undefined
        }
        return node
    }

    publish(path: string, value: any) {
        this.mutate(path, value)
        this.notify(path)
    }

    delete(path: string) {
        this.mutate(path, undefined)
        this.notify(path)
    }

    subscribe(path: string, cb: Listener): () => void {
        let listeners = this.listeners.get(path)
        if (listeners === undefined) {
            listeners = new Set();
            this.listeners.set(path,listeners)
        }
        listeners.add(cb)
        return () => this.listeners.get(path)?.delete(cb)
    }

    notify(path: string) {
        // TODO: we could store the listeners in a tree for performant listener invocation

        // Add on a trailing '/' to prevent partial matches on the last node
        let a = path + '/'
        for (const [listener_path, listeners] of this.listeners) {
            let b = listener_path + '/'
            // We want to notify parents or children, but not siblings.
            // changing "a/" does notify "a/b/"
            // changing "a/b/" does notify "a/"
            // changing "a/b1/" does not notify "a/b2/"
            if (a.startsWith(b) || b.startsWith(a)) {
                for (let listener of listeners)
                    listener()
            }
        }
    }

    private splitPath(path: string): string[] {
        if (path === "")
            return []
        return path.split("/")
    }

    private mutate(path: string, value: any) {
        // Modify an object, replacing all objects with affected children

        const keys = this.splitPath(path);

        if (keys.length === 0) {
            this.obj = value
        } else {
            let new_obj = { ...this.obj };
            let node = new_obj;

            for (let i = 0; i < keys.length - 1; i++) {
                const child = node[keys[i]];
                const new_child = child === undefined ? {} : { ...child };
                node[keys[i]] = new_child;
                node = new_child;
            }
            if (value === undefined)
                delete node[keys.length - 1]
            else
                node[keys[keys.length - 1]] = value;
            this.obj = new_obj // I guess we do this last in case of an error
        }
    }
}

class View {
    private service: ObjectService
    path: string
    
    constructor(service: ObjectService, path: string = "") {
        this.service = service
        this.path = path
        Object.freeze(this)
    }

    read(path: string) {
        return this.service.read(this.appendPath(path))
    }

    publish(path: string, value: any) {
        this.service.publish(this.appendPath(path), value)
    }

    delete(path: string) {
        this.service.delete(this.appendPath(path))
    }

    subscribe(path: string, cb: Listener): () => void {
        return this.service.subscribe(this.appendPath(path), cb)
    }

    view (path: string): View {
        return this.service.view(this.appendPath(path))
    }

    stableRead = () => this.service.read(this.path)
    stableSubscribe = (cb: Listener) => this.service.subscribe(this.path, cb)

    private appendPath(path: string): string {
        return resolvePath(`${this.path}/${path}`)
    }
}

function resolvePath(path: string): string {
    let stack: string[] = []
    for (const key of path.split("/")) {
        if (key === "..")
            stack.pop()
        else if (key === "")
            continue
        else
            stack.push(key)
        
    }
    return stack.join("/")
}

function useListener(view: View, path: string = '') {
    if (path !== '') {
        view = view.view(path)
    }
    return useSyncExternalStore(view.stableSubscribe, view.stableRead)
}

export { ObjectService, View, useListener };