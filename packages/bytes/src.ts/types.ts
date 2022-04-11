
export type BytesLike = Uint8Array | string;

export interface Hexable {
    toHexString(): string;
}
