export interface CrowdsaleAccount {
    privateKey: string;
    address: string;
}
export declare function isCrowdsaleJson(json: string): boolean;
export declare function decryptCrowdsaleJson(json: string, _password: string | Uint8Array): CrowdsaleAccount;
//# sourceMappingURL=json-crowdsale.d.ts.map