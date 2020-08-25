Command-Line Interface (CLI)
============================

The command-line interface provides several simple tools to manage
and debug Ethereum-related tasks using the ethers.js library.

**To install:**

```
/home/ricmoo> npm install -g @ethersproject/cli
```

-----


Sandbox Utility
===============

The sandbox utility run on its own will run a REPL environment similar
to running `node`, with many features from the ethers.js library
already imported and permits loading accounts and setting up a provider.

It also provides a simple interface to common tasks, such as sweeping
accounts, signing messages and compiling Solidity.

**Example:** Create and fund testnet account

```
/home/ricmoo> ethers init ropsten.json
Creating a new JSON Wallet - ropsten.json
Keep this password and file SAFE!! If lost or forgotten
it CANNOT be recovered, by ANYone, EVER.
Choose a password: ****
Confirm password: ****
Encrypting... 100%
New account address: 0xe923a7f82860C30442a1A541C14bE4251bd71A34
Saved:               ropsten.json
/home/ricmoo> ethers --wait --network ropsten fund 0xe923a7f82860C30442a1A541C14bE4251bd71A34
Transaction Hash: 0x457c1d8b58170c73a02afa2816e877de41d6337a483d4af9cbd674d2b478473d
/home/ethers>
```

**Example:** Simple evaluations

```
/home/ricmoo> ethers eval 'namehash("ricmoose.eth")'
0xb52c4744695ed3be701ccef35d5901de3aaf7294245966ef16617c30aab7b626

/home/ricmoo> ethers eval 'id("Hello...")'
0x9cd41c139084dafa62261ce045f504e3c697fa303c87a78b241a9f8ae65bae88

/home/ricmoo> ethers --network ropsten eval '(new Contract(provider.network.ensAddress, [ "function owner(bytes32) view returns (address)" ], provider)).owner(namehash("eth"))'
0x227Fcb6Ddf14880413EF4f1A3dF2Bbb32bcb29d7
```

**Example:** REPL

```
/home/ricmoo> ethers --network ropsten --account mnemonic.txt
network: ropsten (chainId: 3)
ropsten> provider.getGasPrice()
BigNumber { _hex: '0xb2d05e00', _isBigNumber: true }
ropsten> accounts[0].signMessage("Hello...");
Message:
  Message:        "Hello..."
  Message (hex):  0x48656c6c6f2e2e2e
Sign Message? (y/N/a) yy
Signature
  Flat:   0x37e9add966fe86d50bc5d816f9cb8213107d428551e64f118bc087fe1e4031f61685c7123d14f47e673ada87049cbbecab0c4e9ef5e8ded073e0be9980d14e761b
  r:      0x37e9add966fe86d50bc5d816f9cb8213107d428551e64f118bc087fe1e4031f6
  s:      0x1685c7123d14f47e673ada87049cbbecab0c4e9ef5e8ded073e0be9980d14e76
  vs:     0x1685c7123d14f47e673ada87049cbbecab0c4e9ef5e8ded073e0be9980d14e76
  v:      27
  recid:  0
'0x37e9add966fe86d50bc5d816f9cb8213107d428551e64f118bc087fe1e4031f61685c7123d14f47e673ada87049cbbecab0c4e9ef5e8ded073e0be9980d14e761b'
```

Help (--help)
-------------

```
Usage:
   ethers [ COMMAND ] [ ARGS ] [ OPTIONS ]

COMMANDS (default: sandbox)
   sandbox                    Run a REPL VM environment with ethers
   init FILENAME              Create a new JSON wallet
      [ --force ]                Overwrite any existing files
   fund TARGET                Fund TARGET with testnet ether
   info [ TARGET ... ]        Dump info for accounts, addresses and ENS names
   send TARGET ETHER          Send ETHER ether to TARGET form accounts[0]
      [ --allow-zero ]           Allow sending to the address zero
      [ --data DATA ]            Include data in the transaction
   sweep TARGET               Send all ether from accounts[0] to TARGET
   sign-message MESSAGE       Sign a MESSAGE with accounts[0]
      [ --hex ]                  The message content is hex encoded
   eval CODE                  Run CODE in a VM with ethers
   run FILENAME               Run FILENAME in a VM with ethers
   wait HASH                  Wait for a transaction HASH to be mined
   compile FILENAME           Compiles a Solidity contract
      [ --no-optimize ]          Do not optimize the compiled output
      [ --warnings ]             Error on any warning
   deploy FILENAME            Compile and deploy a Solidity contract
      [ --no-optimize ]          Do not optimize the compiled output
      [ --contract NAME ]        Specify the contract to deploy

ACCOUNT OPTIONS
  --account FILENAME          Load from a file (JSON, RAW or mnemonic)
  --account RAW_KEY           Use a private key (insecure *)
  --account 'MNEMONIC'        Use a mnemonic (insecure *)
  --account -                 Use secure entry for a raw key or mnemonic
  --account-void ADDRESS      Use an address as a void signer
  --account-void ENS_NAME     Add the resolved address as a void signer
  --account-rpc ADDRESS       Add the address from a JSON-RPC provider
  --account-rpc INDEX         Add the index from a JSON-RPC provider
  --mnemonic-password         Prompt for a password for mnemonics
  --xxx-mnemonic-password     Prompt for a (experimental) hard password

PROVIDER OPTIONS (default: all + homestead)
  --alchemy                   Include Alchemy
  --etherscan                 Include Etherscan
  --infura                    Include INFURA
  --nodesmith                 Include nodesmith
  --rpc URL                   Include a custom JSON-RPC
  --offline                   Dump signed transactions (no send)
  --network NETWORK           Network to connect to (default: homestead)

TRANSACTION OPTIONS (default: query network)
  --gasPrice GWEI             Default gas price for transactions(in wei)
  --gasLimit GAS              Default gas limit for transactions
  --nonce NONCE               Initial nonce for the first transaction
  --yes                       Always accept Siging and Sending

OTHER OPTIONS
  --wait                      Wait until transactions are mined
  --debug                     Show stack traces for errors
  --help                      Show this usage and exit
  --version                   Show this version and exit

(*) By including mnemonics or private keys on the command line they are
    possibly readable by other users on your system and may get stored in
    your bash history file. This is NOT recommended.
```

-----

Ethereum Naming Service (ENS)
=============================

These tools help manage ENS names.

Help (--help)
-------------

```
Usage:
   ethers-ens COMMAND [ ARGS ] [ OPTIONS ]

COMMANDS
   lookup [ NAME | ADDRESS [ ... ] ]
                              Lookup a name or address
   commit NAME                Submit a pre-commitment
      [ --duration DAYS ]        Register duration (default: 365 days)
      [ --salt SALT ]            SALT to blind the commit with
      [ --secret SECRET ]        Use id(SECRET) as the salt
      [ --owner OWNER ]          The target owner (default: current account)
   reveal NAME                Reveal a previous pre-commitment
      [ --duration DAYS ]        Register duration (default: 365 days)
      [ --salt SALT ]            SALT to blind the commit with
      [ --secret SECRET ]        Use id(SECRET) as the salt
      [ --owner OWNER ]          The target owner (default: current account)
   set-controller NAME        Set the controller (default: current account)
      [ --address ADDRESS ]      Specify another address
   set-subnode NAME           Set a subnode owner (default: current account)
      [ --address ADDRESS ]      Specify another address
   set-resolver NAME          Set the resolver (default: resolver.eth)
      [ --address ADDRESS ]      Specify another address
   set-addr NAME              Set the addr record (default: current account)
      [ --address ADDRESS ]      Specify another address
   set-text NAME KEY VALUE    Set a text record
   set-email NAME EMAIL       Set the email text record
   set-website NAME URL       Set the website text record
   set-content NAME HASH      Set the IPFS Content Hash
   migrate-registrar NAME     Migrate from the Legacy to the Permanent Registrar
   transfer NAME NEW_OWNER    Transfer registrant ownership
   reclaim NAME               Reset the controller by the registrant
      [ --address ADDRESS ]      Specify another address
```

See above for the `ACCOUNT`, `PROVIDER`, `TRANSACTION`, and `OTHER`
options.

-----

TypeScript Utility
==================

The TypeScript utility compiles Solidity contracts into a single file
with each contract sub-classing Contract, with all typing information
added.

Help (--help)
-------------

```
Usage:
   ethers-ts FILENAME [ ... ] [ OPTIONS ]

OPTIONS
  --output FILENAME           Write the output to FILENAME (default: stdout)
  --force                     Overwrite files if they already exist
  --no-optimize               Do not run the solc optimizer
  --no-bytecode               Do not include bytecode and Factory methods
```

-----

License
=======

MIT License
