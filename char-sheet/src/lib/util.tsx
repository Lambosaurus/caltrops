export interface Dictionary<T> { [key: string]: T }

export function setTheme(theme: string) {
    if (document.documentElement.getAttribute("data-theme") !== theme ) {
        document.documentElement.setAttribute("data-theme", theme);
    }
}

export enum EditMode {
  None = 0,
  Live = 1,
  Full = 2,
}

export type Modifier<T> = (input: T) => T;

export function keyModifier<T, K extends keyof T>(key: K, modifier: Modifier<T[K]> ): (obj: T) => T {
  return (obj) => { return { ...obj, [key]: modifier(obj[key]) }}
}

/*
 * Returns a new object by cloning the source object and then inserting the specified key
 */
export function modifyObject<t>(obj: t, key: string, value: any): t {
    return { ...obj, [key]: value }
}

export function downloadObject(obj: any, filename: string, pretty: boolean = false) {
    // Could instead look at https://github.com/eligrey/FileSaver.js

    let data = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify(obj, undefined, pretty ? 2 : undefined)
    );
    let node = document.createElement('a');
    node.setAttribute("href",     data);
    node.setAttribute("download", filename);
    document.body.appendChild(node); // required for firefox
    node.click();
    node.remove();
}

export function saveObject(name: string, obj: any,) {
    localStorage.setItem(name, JSON.stringify(obj))
}

export function loadObject(name: string): any | null {
    const text = localStorage.getItem(name)
    if (text) {
        return JSON.parse(text)
    }
    return null;
}

export function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
}

export function filterObject<T>(obj: Dictionary<T> | undefined, predicate: (key: string, value: T) => boolean): Dictionary<T> {
  if (!obj) {
    return {}
  }
  return Object.fromEntries(Object.entries(obj).filter(([k,v]) => predicate(k,v)))
}

export function timeSince(date: Date): string {
    var seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    function formatInterval(interval: number, name: string): string {
      interval = Math.floor(interval)
      if (interval > 1) {
        return `${interval} ${name}s`
      }
      return `1 ${name}` 
    }
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return formatInterval(interval, "year");
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return formatInterval(interval, "month");
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return formatInterval(interval, "day");
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return formatInterval(interval, "hour");
    }
    interval = seconds / 60;
    if (interval > 1) {
      return formatInterval(interval, "minute");
    }
    return formatInterval(seconds, "second");
  }

  export function setPrecision(n: number, precision: number): number {
    const p = Math.pow(10, precision)
    return Math.floor(n * p) / p
  }

  export function isEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }