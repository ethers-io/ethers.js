var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-nocheck
import { hethers } from "@hashgraph/hethers";
import { readFileSync } from "fs";
const abiTokenWithArgs = JSON.parse(readFileSync('packages/tests/contracts/TokenWithArgs.json').toString());
const bytecodeTokenWithArgs = readFileSync('packages/tests/contracts/TokenWithArgs.bin').toString();
const hederaEoaED = {
    account: "0.0.34100425",
    privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
    isED25519Type: true
};
const hederaEoaEC = {
    account: '0.0.29562194',
    privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d'
};
const provider = hethers.providers.getDefaultProvider('testnet');
// @ts-ignore
const walletED = new hethers.Wallet(hederaEoaED, provider);
const walletEC = new hethers.Wallet(hederaEoaEC, provider);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contractFactory = new hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, walletED);
        const contract = yield contractFactory.attach("0x00000000000000000000000000000000020ac5d6"); //.deploy(hethers.BigNumber.from('10000'), { gasLimit: 3000000 });
        // await contract.deployed();
        // client wallet init
        // let clientWallet = hethers.Wallet.createRandom({ isED25519Type: true });
        // const clientAccountId = (await wallet.createAccount(clientWallet._signingKey().compressedPublicKey)).customData.accountId;
        // clientWallet = clientWallet.connect(provider).connectAccount(clientAccountId.toString());
        // // test sending hbars to the contract
        // await wallet.sendTransaction({
        //     to: contract.address,
        //     from: wallet.address,
        //     value: 30,
        //     gasLimit: 300000
        // });
        // test if initial balance of the client is zero
        const balance = yield contract.connect(walletED).balanceOf(walletED.address, { gasLimit: 3000000 });
        console.log(balance.toString());
    }
    catch (error) {
        console.error(error.message);
    }
}))();
//# sourceMappingURL=test.js.map