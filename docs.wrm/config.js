"use strict";

const { resolve } = require("path");
const fs = require("fs");

const ts = require("typescript");

function getDefinitions(source) {
    const sourceFile = ts.createSourceFile("filename.ts", source);

    const defs = [ ];

    function add(type, name, pos) {
        const lineNo = sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
        name = type + "." + name
        defs.push({ type, name, lineNo });
    }

    let lastClass = null, lastEnum = null;
    function visit(node, depth) {
        if (ts.isConstructorDeclaration(node)) {
            add("constructor", lastClass, node.body.pos);
        } else if (ts.isFunctionDeclaration(node)) {
            add("function", node.name.text, node.name.end);
        } else if (ts.isConstructorDeclaration(node)) {
            add("constructor", lastClass, node.pos);
        } else if (ts.isClassDeclaration(node)) {
            lastClass = node.name.escapedText;
            add("class", lastClass, node.name.end);
        } else if (ts.isMethodDeclaration(node)) {
            if (lastClass == null) { throw new Error("missing class"); }
            if (ts.hasStaticModifier(node)) {
                add("staticmethod", (lastClass + "." + node.name.text), node.name.end);
            } else {
                add("method", (lastClass + "." + node.name.text), node.name.end);
            }
        } else if (ts.isEnumDeclaration(node)) {
            lastEnum = node.name.escapedText;
            add("enum", lastEnum, node.name.end);
        } else if (ts.isEnumMember(node)) {
            add("enum", (lastEnum + "." + node.name.escapedText), node.name.end);
        } else if (ts.isVariableDeclaration(node)) {
            if (depth === 3) {
                add("var", node.name.escapedText, node.name.end);
            }
        } else if (ts.isGetAccessorDeclaration(node)) {
            add("getter", (lastClass + "." + node.name.text), node.name.end);
        }
        ts.forEachChild(node, (node) => { return visit(node, depth + 1); });
    }

    visit(sourceFile, 0);

    return defs;
}

const getSourceUrl = (function(path, include, exclude) {
    console.log("Scanning TypeScript Sources...");
    const Link = "https://github.com/ethers-io/ethers.js/blob/master/packages$FILENAME#L$LINE";
    const Root = resolve(__dirname, path);

    const readdir = function(path) {
        if (path.match(exclude)) { return [ ]; }

        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
            return fs.readdirSync(path).reduce((result, filename) => {
                readdir(resolve(path, filename)).forEach((file) => {
                    result.push(file);
                });
                return result;
            }, [ ]);
        }

        if (path.match(include)) {
            const source = fs.readFileSync(path).toString();
            return [ { filename: path.substring(Root.length), defs: getDefinitions(source) } ]
        }

        return [ ];
    }

    const defs = readdir(Root);

    return function getSourceUrl(key) {
        const comps = key.split(":");
        if (comps.length !== 2) { throw new Error("unsupported key"); }

        const pathCheck = new RegExp("(^|[^a-zA-Z0-9_])" + comps[0].split("/").join("/(.*/)*") + "($|[^a-zA-Z0-9_])");

        let match = comps[1];
        if (match.indexOf("(" /* fix: )*/)) {
            match = new RegExp("(^|\\.)" + match.split("(" /* fix: ) */)[0] + "$");
        } else if (match[0] === "=") {
            match = new RegExp("^" + match.substring(1) + "$");
        } else {
            match = new RegExp("(^|\\.)" + match + "$");
        }

        const result = [ ];
        defs.forEach((def) => {
            if (!def.filename.match(pathCheck)) { return; }
            def.defs.forEach((d) => {
                if (!d.name.match(match)) { return; }
                result.push({ filename: def.filename, lineNo: d.lineNo, name: d.name });
            });
        });
        if (result.length > 1) {
            throw new Error(`Ambiguous TypeScript link: ${ key } in [ ${ result.map((r) => JSON.stringify(r.filename + ":" + r.lineNo + "@" + r.name)).join(", ") }]`);
        } else if (result.length === 0) {
            throw new Error(`No matching TypeScript link: ${ key }`);
        }

        return Link
            .replace("$LINE", String(result[0].lineNo))
            .replace("$FILENAME", result[0].filename);
    }
})("../packages/", new RegExp("packages/.*/src.ts/.*\.ts$"), new RegExp("/node_modules/|src.ts/.*browser.*"));

let localSigner = null;

function codeContextify(context) {
    const { inspect } = require("util");
    const ethers = context.require("./packages/ethers");

    if (localSigner == null) { localSigner = ethers.Wallet.createRandom(); }

    context.ethers = ethers;
    context.BigNumber = ethers.BigNumber;
    context.constants = ethers.constants;
    context.utils = ethers.utils;
    context.arrayify = ethers.utils.arrayify;
    context.hexlify = ethers.utils.hexlify;
    context.hexValue = ethers.utils.hexValue;
    context.Wallet = ethers.Wallet;
    context.provider = new ethers.providers.InfuraProvider("mainnet", "49a0efa3aaee4fd99797bfa94d8ce2f1");

    // We use a local dev node for some signing examples, but want to
    // resolve ENS names against mainnet; super hacky but makes the
    // docs nicer (funded in _startup)
    context.localProvider = new ethers.providers.JsonRpcProvider();
    context.localSigner = localSigner.connect(context.localProvider);
    context.localProvider.resolveName = context.provider.resolveName.bind(context.provider);

    context.BigNumber.prototype[inspect.custom] = function(depth, options) {
        return `{ BigNumber: ${JSON.stringify(this.toString()) } }`;
    }

    context.createClass = function(name) {
        let C = class{ }
        Object.defineProperty(C, "name", { value: name })
        return C;
    }


    context._inspect = function(value, depth) {
        if (toString.call(value) === '[object Error]') {
            // Not an error from ethers...
            if (ethers.utils.Logger.errors[value.code] == null) {
                return `Error: ${ value.message }`;
            }

            // Trim the ethers errors down on their verbosity for the docs...
            if (value.message) {
                value.message = value.message.split(" (")[0];
            }
            value.stack = undefined;
        }

        if (value && value.constructor && value.constructor.name === "Uint8Array") {
            return `Uint8Array [ ${ Array.prototype.join.call(value, ", ") } ]`;
        }

        if (typeof(value) === "string" && value.indexOf("\n") >= 0) {
           return "`" + value + "`";
        }

        //return JSON.stringify(value);
        return inspect(value, {
            compact: false,
            depth: null,
            breakLength: Infinity,
            sorted: true,
        });
    }

    context._startup = async function() {
        console.log("Startup");
        const signer = context.localProvider.getSigner();
        const tx = await signer.sendTransaction({
            to: localSigner.address,
            value: ethers.utils.parseEther("10.0")
        });
        await tx.wait();
    }

    context._shutdown = function() {
        console.log("Shutdown");
    }
}


module.exports = {
  title: "ethers",
  subtitle: "v5.4",
  description: "Documentation for ethers, a complete, tiny and simple Ethereum library.",
  logo: "logo.svg",

  socialImage: "social.jpg",

  prefix: "/v5",

  link: "https:/\/docs.ethers.io",
  copyright: "The content of this site is licensed under the [Creative Commons License](https:/\/choosealicense.com/licenses/cc-by-4.0/). Generated on &$now;.",

  markdown: {
      "banner": "-----\n\nDocumentation: [html](https://docs.ethers.io/)\n\n-----\n\n"
  },

  codeContextify: codeContextify,

  getSourceUrl: getSourceUrl,

  codeRoot: "../",

  externalLinks: {
      "link-mail": "mailto:me@ricmoo.com",
      "link-alchemy": { name: "Alchemy", url: "https:/\/alchemyapi.io" },
      "link-ankr": { name: "Ankr", url: "https:/\/www.ankr.com" },
      "link-cloudflare": { name: "Cloudflare", url: "https:/\/developers.cloudflare.com/distributed-web/ethereum-gateway/" },
      "link-ens": { name: "ENS", url: "https:/\/ens.domains/" },
      "link-ethereum": { name: "Ethereum", url: "https:/\/ethereumorg" },
      "link-etherscan": { name: "Etherscan", url: "https:/\/etherscan.io" },
      "link-expo": { name: "Expo", url: "https:/\/expo.io" },
      "link-etherscan-api": "https:/\/etherscan.io/apis",
      "link-flatworm": { name: "Flatworm", url: "https:/\/github.com/ricmoo/flatworm" },
      "link-geth": { name: "Geth", url: "https:/\/geth.ethereum.org" },
      "link-infura": { name: "INFURA", url: "https:/\/infura.io" },
      "link-javascriptcore": { name: "JavaScriptCore", url: "https:/\/developer.apple.com/documentation/javascriptcore?language=objc" },
      "link-ledger": "https:/\/www.ledger.com",
      "link-metamask": { name: "MetaMask", url: "https:/\/metamask.io/" },
      "link-otto": "https:/\/github.com/robertkrimen/otto",
      "link-parity": { name: "Parity", url: "https:/\/www.parity.io" },
      "link-pocket": { name: "Pocket Network", url: "https:/\/pokt.network" },
      "link-react-native": { name: "React Native", url: "https:/\/reactnative.dev" },
      "link-rtd": "https:/\/github.com/readthedocs/sphinx_rtd_theme",
      "link-semver": { name: "semver", url: "https:/\/semver.org" },
      "link-solidity": { name: "Solidity" , url: "https:/\/solidity.readthedocs.io/" },
      "link-solidity-errors": "https:/\/docs.soliditylang.org/en/v0.8.4/abi-spec.html#errors",
      "link-solidity-events": "https:/\/docs.soliditylang.org/en/v0.8.4/abi-spec.html#events",
      "link-sphinx": { name: "Sphinx", url: "https:/\/www.sphinx-doc.org/" },

      "link-alchemy-signup": "https:/\/dashboard.alchemyapi.io/signup?referral=55a35117-028e-4b7c-9e47-e275ad0acc6d",
      "link-ankr-public": "https:/\/www.ankr.com/protocol/public/",
      "link-ankr-premium": "https:/\/www.ankr.com/protocol/plan/",
      "link-etherscan-signup": "https:/\/etherscan.io/apis",
      "link-etherscan-ratelimit": "https:/\/info.etherscan.com/api-return-errors/",
      "link-infura-signup": "https:/\/infura.io/register",
      "link-pocket-signup": "https:/\/pokt.network/pocket-gateway-ethereum-mainnet/",

      "link-json-rpc": "https:/\/github.com/ethereum/wiki/wiki/JSON-RPC",
      "link-web3-send": "https:/\/github.com/ethereum/web3.js/blob/1.x/packages/web3-providers-http/types/index.d.ts#L57",
      "link-parity-trace": "https:/\/openethereum.github.io/wiki/JSONRPC-trace-module",
      "link-parity-rpc": "https:/\/openethereum.github.io/wiki/JSONRPC",
      "link-geth-debug": "https:/\/github.com/ethereum/go-ethereum/wiki/Management-APIs#debug",
      "link-geth-rpc": "https:/\/github.com/ethereum/go-ethereum/wiki/Management-APIs",

      "link-legacy-docs3": "https:/\/docs.ethers.io/v3/",
      "link-legacy-docs4": "https:/\/docs.ethers.io/v4/",

      "link-github-ci": "https:/\/github.com/ethers-io/ethers.js/actions/runs/158006903",
      "link-github-issues": "https:/\/github.com/ethers-io/ethers.js/issues",

      "link-issue-407": "https:/\/github.com/ethers-io/ethers.js/issues/407",

      "link-infura-secret": "https:/\/infura.io/docs/gettingStarted/authentication",

      "link-web3": "https:/\/github.com/ethereum/web3.js",
      "link-web3-http": "https:/\/github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-http",
      "link-web3-ipc": "https:/\/github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-ipc",
      "link-web3-ws": "https:/\/github.com/ethereum/web3.js/tree/1.x/packages/web3-providers-ws",

      "link-solc-output": "https:/\/solidity.readthedocs.io/en/v0.6.0/using-the-compiler.html#output-description",
      "link-bip39-wordlists": "https:/\/github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md",

      "link-icap": "https:/\/github.com/ethereum/wiki/wiki/Inter-exchange-Client-Address-Protocol-%28ICAP%29",
      "link-jsonrpc": "https:/\/github.com/ethereum/wiki/wiki/JSON-RPC",
      "link-mit": { name: "MIT License", url: "https:/\/en.m.wikipedia.org/wiki/MIT_License" },
      "link-namehash": { name: "namehash", url: "https:/\/docs.ens.domains/contract-api-reference/name-processing#hashing-names" },
      "link-rlp": { name: "Recursive Length Prefix", url: "https:/\/github.com/ethereum/wiki/wiki/RLP" },

      "link-ethersio": "https:/\/ethers.io/",
      "link-ethers-docs": "https:/\/docs.ethers.io/",
      "link-ethers-js": "https:/\/cdn.ethers.io/lib/ethers-5.1.esm.min.js",
      "link-ethers-npm": "https:/\/www.npmjs.com/search?q=%40ethersproject%2F",
      "link-ethers-asm-grammar": "https:/\/github.com/ethers-io/ethers.js/blob/master/packages/asm/grammar.jison",

      "link-eip-155": { name: "EIP-155", url: "https:/\/eips.ethereum.org/EIPS/eip-155" },
      "link-eip-191": { name: "EIP-191", url: "https:/\/eips.ethereum.org/EIPS/eip-191" },
      "link-eip-609": { name: "EIP-609", url: "https:/\/eips.ethereum.org/EIPS/eip-609" },
      "link-eip-634": { name: "EIP-634", url: "https:/\/eips.ethereum.org/EIPS/eip-634" },
      "link-eip-712": { name: "EIP-712", url: "https:/\/eips.ethereum.org/EIPS/eip-712" },
      "link-eip-1014": { name: "EIP-1014", url: "https:/\/eips.ethereum.org/EIPS/eip-1014" },
      "link-eip-1193": { name: "EIP-1193", url: "https:/\/eips.ethereum.org/EIPS/eip-1193" },
      "link-eip-1559": { name: "EIP-1559", url: "https:/\/eips.ethereum.org/EIPS/eip-1559" },
      "link-eip-1577": { name: "EIP-1577", url: "https:/\/eips.ethereum.org/EIPS/eip-1577" },
      "link-eip-2098": { name: "EIP-2098", url: "https:/\/eips.ethereum.org/EIPS/eip-2098" },
      "link-eip-2304": { name: "EIP-2304", url: "https:/\/eips.ethereum.org/EIPS/eip-2304" },
      "link-eip-2718": { name: "EIP-2718", url: "https:/\/eips.ethereum.org/EIPS/eip-2718" },
      "link-eip-2930": { name: "EIP-2930", url: "https:/\/eips.ethereum.org/EIPS/eip-2930" },
      "link-bip-39": { name: "BIP-39", url: "https:/\/en.bitcoin.it/wiki/BIP_0039" },
      "link-bip-32": { name: "BIP-32", url: "https:/\/github.com/bitcoin/bips/blob/master/bip-0032.mediawiki" },
      "link-bip-44": { name: "BIP-44", url: "https:/\/en.bitcoin.it/wiki/BIP_0044" },

      "link-npm-elliptic": { name: "elliptic", url: "https:/\/www.npmjs.com/package/elliptic" },
      "link-npm-ethersproject-shims": { name: "Shims", url: "https:/\/www.npmjs.com/package/@ethersproject/shims" },
      "link-npm-events": { name: "EventEmitter", url: "https:/\/nodejs.org/dist/latest-v13.x/docs/api/events.html#events_class_eventemitter" },
      "link-npm-bnjs": { name: "BN.js", url: "https:/\/www.npmjs.com/package/bn.js" },
      "link-npm-query-bignumber": "https:/\/www.npmjs.com/search?q=bignumber",
      "link-npm-react-native-get-random-values": { name: "React Native get-random-values", url: "https:/\/www.npmjs.com/package/react-native-get-random-values" },

      "link-js-array": "https:/\/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
      "link-js-bigint": "https:/\/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt",
      "link-js-normalize": { name: "String.normalize", url: "https:/\/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize" },
      "link-js-maxsafe": "https:/\/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER#Description",
      "link-js-proxy": "https:/\/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy",
      "link-js-typedarray": "https:/\/developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray",

      "link-cors": { name: "CORS", url: "https:/\/developer.mozilla.org/en-US/docs/Web/HTTP/CORS" },

      "link-ricmoo-humanreadableabi": "https:/\/blog.ricmoo.com/human-readable-contract-abis-in-ethers-js-141902f4d917",

      "link-other-ethereum-dev-docs": "https:/\/ethereum.org/en/developers/docs/",

      "link-wiki-basicauth": { name: "Basic Authentication", url: "https:/\/en.wikipedia.org/wiki/Basic_access_authentication" },
      "link-wiki-backoff": { name: "Exponential Backoff", url: "https:/\/en.wikipedia.org/wiki/Exponential_backoff" },
      "link-wiki-bloomfilter": { name: "Bloom Filter", url: "https:/\/en.wikipedia.org/wiki/Bloom_filter" },
      "link-wiki-bruteforce": "https:/\/en.wikipedia.org/wiki/Brute-force_attack",
      "link-wiki-cryptographichash": "https:/\/en.wikipedia.org/wiki/Cryptographic_hash_function",
      "link-wiki-csrf": "https:/\/en.wikipedia.org/wiki/Cross-site_request_forgery",
      "link-wiki-ecrecover": { name: "ECDSA Public Key Recovery", url: "https:/\/en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm#Public_key_recovery" },
      "link-wiki-homoglyph": "https:/\/en.wikipedia.org/wiki/IDN_homograph_attack",
      "link-wiki-hmac": "https:/\/en.wikipedia.org/wiki/HMAC",
      "link-wiki-iban": "https:/\/en.wikipedia.org/wiki/International_Bank_Account_Number",
      "link-wiki-ieee754": "https:/\/en.wikipedia.org/wiki/Double-precision_floating-point_format",
      "link-wiki-observer-pattern": { name: "Observer Pattern", url: "https:/\/en.wikipedia.org/wiki/Observer_pattern" },
      "link-wiki-phishing": "https:/\/en.wikipedia.org/wiki/Phishing",
      "link-wiki-ripemd": "https:/\/en.m.wikipedia.org/wiki/RIPEMD",
      "link-wiki-sha2": "https:/\/en.wikipedia.org/wiki/SHA-2",
      "link-wiki-twoscomplement": "https:/\/en.wikipedia.org/wiki/Two%27s_complement",
      "link-wiki-unicode-equivalence": "https:/\/en.wikipedia.org/wiki/Unicode_equivalence",
      "link-wiki-utf8-overlong": "https:/\/en.wikipedia.org/wiki/UTF-8#Overlong_encodings",
      "link-wiki-utf8-replacement": "https:/\/en.wikipedia.org/wiki/Specials_%28Unicode_block%29#Replacement_character",
      "link-wiki-scrypt": "https:/\/en.wikipedia.org/wiki/Scrypt",
      "link-wiki-side-channel-attack": "https:/\/en.wikipedia.org/wiki/Side-channel_attack",
      "link-wiki-sha3": "https:/\/en.wikipedia.org/wiki/SHA-3",
      "link-wiki-shuffle": { name: "Fisher-Yates Shuffle", url: "https:/\/en.wikipedia.org/wiki/Fisher-Yates_shuffle" },
      "link-wiki-overflow": { name: "overflow", url: "https:/\/en.wikipedia.org/wiki/Integer_overflow" },
      "link-wiki-underflow": { name: "arithmetic underflow", url: "https:/\/en.wikipedia.org/wiki/Arithmetic_underflow" },
      "link-wiki-xss": "https:/\/en.wikipedia.org/wiki/Cross-site_scripting",
  },
};
