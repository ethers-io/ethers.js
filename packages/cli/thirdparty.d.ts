declare module "scrypt-js" {
    export class ScryptError extends Error {
        progress: number;
    }
    export type ScryptCallback = (error: ScryptError, progress: number, key: Uint8Array) => void;
    export default function(password: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, callback: ScryptCallback): void;
}
