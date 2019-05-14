declare module "xmlhttprequest" {
    export class XMLHttpRequest {
        readyState: number;
        status: number;
        responseText: string;

        constructor();
        open(method: string, url: string, async?: boolean): void;
        setRequestHeader(key: string, value: string): void;
        send(body?: string): void;
        abort(): void;

        onreadystatechange: () => void;
        onerror: (error: Error) => void;
    }
}

