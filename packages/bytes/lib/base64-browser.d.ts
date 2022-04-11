declare global {
    function atob(ascii: string): string;
    function btoa(binary: string): string;
}
import type { BytesLike } from "@ethersproject/logger";
export declare function decodeBase64(textData: string): Uint8Array;
export declare function encodeBase64(_data: BytesLike): string;
//# sourceMappingURL=base64-browser.d.ts.map