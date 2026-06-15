export function isKeynet(url) {
    const hostname = new URL(url).hostname;
    return hostname.toLowerCase().endsWith('.keynet');
}
//# sourceMappingURL=isKeynet.js.map