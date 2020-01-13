declare module "scrypt-js" {
    export type ProgressCallback = (progress: number) => boolean | void;
    export function scrypt(password: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, callback?: ProgressCallback): Promise<Uint8Array>;
    export function scryptSync(password: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number): Uint8Array;
}
