"use strict";

import fs from "fs";
import  { resolve } from "path";
import ts from "typescript";

import { colorify } from "../log";

const Words = fs.readFileSync("/usr/share/dict/words").toString().split("\n").reduce((accum, word) => {
    accum[word.toLowerCase()] = true;
    return accum;
}, <Record<string, boolean>>{ });

`
// Words missing from the dictionary
accessing addresses aligned autofill avatar called cancelled changed censored
clamping compiled computed configured consumed contained creating decoded decoding
decreased decrypt decrypted decrypting deployed deploying deprecated detected
discontinued earliest email emitted enabled encoded encoder encoding encountered
encrypt encrypted encrypting entries euro exceeded existing expected
expired failed fetches formatted formatting funding generated
hardened has highly ignoring implemented implementer imported including instantiate
joined keyword labelled larger lookup matches mined modified modifies multi
named needed nested neutered numeric offline optimizer overriding owned packed
padded parsed parsing passed payload placeholder processing properties prototyping reached
recommended recovered recursively redacted remaining replaced repriced required reverted
serializes shared signed signing skipped stats stored supported tagging targetted
throttled transactions typed uninstall unstake unsubscribe untyped
using verifies verifying website

// Overly Specific Words
bech BIP BIP39 BIP44 btc bzz crypto eip etc hashes hmac icap
keccak ltc namehash ripemd RLP scrypt secp sha xdai

blockhash bnb bnbt ethprice matic txlist

bitcoin ethereum finney gwei kwei mwei satoshi szabo wei weth

crowdsale hexlify hd hdnode underpriced

boolean int struct tuple uint
nonpayable
jumpdest mstore shr shl xor

// Classes
ABIEncoder testcase numberish Wordlist

// Common Code Strings
abi addr api app arg arrayify asm backend basex bigint bignumber bn byte
bytecode callback calldata ccip charset checksum ciphertext cli codepoint
commify config
contenthash ctr ctrl debug dd dklen eexist encseed eof eq erc ethaddr
ethseed ethers eval exec filename func gz gzip hid http https hw iv
info init ipc json kdf kdfparams labelhash lang lib metadata mm multihash nfc
nfkc nfd nfkd nodehash notok nowait nullish offchain oob opcode org pbkdf pc plugin
pragma pre prf recid repl rpc sighash topichash solc stderr stdin stdout subclasses
subnode timeout todo txt typeof ufixed utc utf util url urlencoded uuid vm
vs websocket wikipedia wildcard wildcards wss www wx xe xpriv xpub xx yyyy zlib

// AbiV2
abiv

// Query parameters
apikey asc endblock startblock

alchemyapi ankr arbitrum Cloudflare com Etherscan INFURA IPFS IPNS MetaMask Nodesmith
Trezor ledgerhq axic bitcoinjs browserify easyseed ethereumjs
goerli homestead kotti kovan mainnet morden mordor rinkeby kintsugi
ropsten skynet testnet lb maticmum

// Demo words
args foo eth foo foobar ll localhost passwd ricmoo tx xxx yna
brantly ricmoose

// nameprep tags
ALCat BiDi LCat nameprep

// Lanauge Codes (and short binary data)
cn cz en es fr it ja tw zh zh_cn zh_tw
OYAa IJBEJqXZJ

// Encoded data
Jx Trw BMd
lorem ipsum dolor sit amet  consectetur adipiscing elit  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua  ut enim ad minim veniam  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat  duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur  excepteur sint occaecat cupidatat non proident  sunt in culpa qui officia deserunt mollit anim id est laborum


`.split("\n").filter((l) => (l.substring(0, 2) != "/\/")).join("\n").split(/\s+/g,).forEach((word) => {
    word = word.trim();
    if (word === "") { return; }
    Words[word.toLowerCase()] = true;
});

type Bar = {
    value: string;
    lineNo: number;
}

type Foo = {
    filename: string;
    values: Array<Bar>;
};

function getStrings(source: string): Array<Bar> {
    const sourceFile = ts.createSourceFile("filename.ts", source, ts.ScriptTarget.Latest);

    const result: Array<Bar> = [ ];

    function add(value: string, pos: number): void {
        const lineNo = sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
        result.push({ value, lineNo });
    }

    //let lastClass = null, lastEnum = null;
    function visit(node: ts.Node, depth: number): void {
        switch (node.kind) {
            //case ts.SyntaxKind.TemplateExpression:
            //    if (node.head) { visit(node.head); }
            //    console.dir(node, { depth: null });
            //    break;
            case ts.SyntaxKind.TemplateHead:
            case ts.SyntaxKind.TemplateMiddle:
            case ts.SyntaxKind.TemplateTail:
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                add((<ts.LiteralLikeNode>node).text, node.pos);
                break;
        }

        ts.forEachChild(node, (node) => { return visit(node, depth + 1); });
    }

    visit(sourceFile, 0);

    return result;
}

const Include = new RegExp("packages/.*/src.ts/.*\.ts$");
const Exclude = new RegExp("/node_modules/|src.ts/.*browser.*");


function getAllStrings(path: string): Array<Foo> {
    const Root = resolve(__dirname, path);

    const readdir = function(path: string): Array<Foo> {
        if (path.match(Exclude)) { return [ ]; }

        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
            return fs.readdirSync(path).reduce((result, filename) => {
                readdir(resolve(path, filename)).forEach((file) => {
                    result.push(file);
                });
                return result;
            }, [ ]);
        }

        if (path.match(Include)) {
            const source = fs.readFileSync(path).toString();
            return [ { filename: path.substring(Root.length), values: getStrings(source) } ]
        }

        return [ ];
    }

    return readdir(Root);
}

function checkWord(word: string): boolean {
    word = word.toLowerCase();

    // A word
    if (Words[word]) { return true; }

    // Simple Plural
    if (word.match(/.*s$/) && Words[word.substring(0, word.length - 1)]) { return true; }

    // Hex string
    if (word.match(/^(0x)?[0-9a-f]*$/i)) { return true; }

    return false;
}

function starts(text: string, prefix: string): boolean {
    return (text.substring(0, prefix.length) === prefix);
}

(async function() {
    console.log(colorify.bold("Spell checking source code strings..."));

    let count = 0;
    getAllStrings(resolve(__dirname, "../../../../packages")).forEach((file: Foo) => {
        if (starts(file.filename, "/testcases/src.ts/generation-scripts")) { return; }
        if (starts(file.filename, "/asm/src.ts/opcodes.ts")) { return; }

        file.values.forEach((entry) => {
            function problem(word: string): void {
                count++;
                console.log({
                    filename: file.filename,
                    word: JSON.stringify(word),
                    sentence: JSON.stringify(entry.value.substring(0, 80)),
                    line: entry.lineNo
                });
            }

            const value = entry.value.trim();

            // Emptry space
            if (value === "") { return; }

            // Prolly a require
            if (value.match(/^@ethersproject\/[a-z0-9-]+$/)) { return; }
            if (value.substring(0, 2) === "./") { return; }

            // Prolly encoded binary data
            if (value.indexOf(" ") === -1 && value.length > 20) { return; }

            if (checkWord(value)) { return; }

            value.replace(/([a-z+])([A-Z])/g, (all, first, secondLetter) => {
                return first + " " + secondLetter;
            }).replace(/((?:0x)?[A-Za-z]+)/gi, (all, word) => {
                if (checkWord(word)) { return ""; }
                problem(word);
                return "";
            });;
        });
    });

    if (count) {
        console.log(`Found ${ count } typos.`);
        process.exit(1)
    }


    process.exit(0)
})().catch((error) => {
    console.log(error);
    process.exit(1);
});


