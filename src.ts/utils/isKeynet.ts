export function isKeynet(url: string): boolean {
    const hostname = new URL(url).hostname;
    return hostname.toLowerCase().endsWith('.keynet');
}
