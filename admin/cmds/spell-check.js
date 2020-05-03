"use strict";

const { resolve } = require("path");
const fs = require("fs");

const Words = fs.readFileSync("/usr/share/dict/words").toString().split("\n").reduce((accum, word) => {
    accum[word.toLowerCase()] = true;
    return accum;
}, { });

`
// Words missing from the dictionary
accessing addresses aligned autofill called cancelled censored
compiled computed configured consumed creating decoded decoding
decrypt decrypted decrypting deployed deploying deprecated detected
discontinued earliest email enabled encoded encoding encrypt
encrypted encrypting entries euro exceeded existing expected
expired failed fetches formatted formatting funding generated
has ignoring implemented implementer imported including instantiate
keyword labelled larger lookup matches mined modified modifies multi
named nested neutered numeric offline optimizer owned packed
padded parsed parsing passed placeholder processing reached
recommended recovered redacted remaining replaced required
serializes shared signed signing stored supported tagging targetted
transactions uninstall unsubscribe using verifies website

// Overly Specific Words
BIP BIP39 BIP44 crypto eip hashes hmac icap
keccak namehash ripemd RLP scrypt secp sha

blockhash

bitcoin ethereum finney gwei kwei mwei satoshi szabo wei weth

crowdsale hexlify hd hdnode underpriced

boolean int struct tuple uint
nonpayable
jumpdest mstore shr shl xor

// Classes
ABIEncoder testcase numberish Wordlist

// Common Code Strings
abi addr api app arg arrayify asm basex bigint bn byte bytecode
callback calldata checksum ciphertext cli codepoint config
contenthash ctr ctrl debug dd dklen eexist encseed eof ethaddr
ethseed ethers eval exec filename func gz hid http https hw iv
info init ipc json kdf kdfparams labelhash lang lib mm multihash nfc
nfkc nfd nfkd nodehash oob opcode pbkdf pc plugin pragma pre prf
repl rpc sighash topichash solc stdin stdout subclasses subnode
timeout todo txt ufixed utc utf util url uuid vm vs websocket
wikipedia wx xe yyyy zlib

// AbiV2
abiv

// Query parameters
apikey asc endblock startblock

Cloudflare Etherscan INFURA IPFS MetaMask Nodesmith Trezor ledgerhq
axic bitcoinjs browserify easyseed ethereumjs
goerli homestead kotti kovan mainnet morden mordor rinkeby ropsten testnet

// Demo words
args foo eth foo foobar ll localhost passwd ricmoo tx xxx yna

// nameprep tags
ALCat BiDi LCat nameprep

// Lanauge Codes (and short binary data)
cn cz en es fr it ja tw zh zh_cn zh_tw
OYAa IJBEJqXZJ

`.split("\n").filter((l) => (l.substring(0, 2) != "/\/")).join("\n").split(/\s+/g,).forEach((word) => {
    word = word.trim();
    if (word === "") { return; }
    Words[word.toLowerCase()] = true;
});

const ts = require("typescript");

function getStrings(source) {
    const sourceFile = ts.createSourceFile("filename.ts", source);

    const result = [ ];

    function add(value, pos) {
        const lineNo = sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
        result.push({ value, lineNo });
    }

    let lastClass = null, lastEnum = null;
    function visit(node, depth) {
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
                add(node.text, node.pos);
                break;
        }

        ts.forEachChild(node, (node) => { return visit(node, depth + 1); });
    }

    visit(sourceFile, 0);

    return result;
}

const Include = new RegExp("packages/.*/src.ts/.*\.ts$");
const Exclude = new RegExp("/node_modules/|src.ts/.*browser.*");

function getAllStrings(path) {
    const Root = resolve(__dirname, path);

    const readdir = function(path) {
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

function checkWord(word) {
    word = word.toLowerCase();

    // A word
    if (Words[word]) { return true; }

    // Simple Plural
    if (word.match(/.*s$/) && Words[word.substring(0, word.length - 1)]) { return true; }

    // Hex string
    if (word.match(/^(0x)?[0-9a-f]*$/i)) { return true; }
}

function starts(text, prefix) {
    return (text.substring(0, prefix.length) === prefix);
}

(async function() {
    let count = 0;
    getAllStrings(resolve(__dirname, "../../packages")).forEach((file) => {
        if (starts(file.filename, "/testcases/src.ts/generation-scripts")) { return; }
        if (starts(file.filename, "/asm/src.ts/opcodes.ts")) { return; }

        file.values.forEach((entry) => {
            function problem(word) {
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
                if (checkWord(word)) { return; }
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
})();

