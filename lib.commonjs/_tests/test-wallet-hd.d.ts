declare global {
    class TextDecoder {
        decode(data: Uint8Array): string;
    }
}
export {};
