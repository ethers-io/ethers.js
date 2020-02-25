-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Assembler
=========


The assembler Command-Line utility allows you to assemble the
[Ethers ASM Dialect](../../api/other/assembly/dialect) into deployable EVM bytecode
and disassemle EVM bytecode into human-readable mnemonics.


Help
----



```
Usage:
   ethers-asm [ FILENAME ] [ OPTIONS ]

OPTIONS
  --define KEY=VALUE          provide assembler defines
  --disassemble               Disassemble input bytecode
  --ignore-warnings           Ignore warnings
  --pic                       generate position independent code
  --target LABEL              output LABEL bytecode (default: _)

OTHER OPTIONS
  --debug                     Show stack traces for errors
  --help                      Show this usage and exit
  --version                   Show this version and exit
```



Example Input Files
-------------------



#### **SimpleStore.asm**






```
; SimpleStore (uint)

; Set the inital value of 42
sstore(0, 42)

; Init code to deploy myContract
codecopy(0, $myContract, #myContract)
return(0, #myContract)

@myContract {
    ; Non-payable
    jumpi($error, callvalue)

    ; Get the Sighash
    shr({{= 256 - 32 }}, calldataload(0))

    ; getValue()
    dup1
    {{= sighash("getValue()") }}
    jumpi($getValue, eq)

    ; setValue(uint)
    dup1
    {{= sighash("setValue(uint)") }}
    jumpi($setValue, eq)

    ; No matching signature
    @error:
        revert(0, 0)

    @getValue:
        mstore(0, sload(0))
        return (0, 32)

    @setValue:
        ; Make sure we have exactly a uint
        jumpi($error, iszero(eq(calldatasize, 36)))

        ; Store the value
        sstore(0, calldataload(4))
        return (0, 0)

    ; There is no *need* for the PUSH32, it just makes
    ; decompiled code look nicer
    @checksum[
        {{= (defines.checksum ? concat([ Opcode.from("PUSH32"), id(myContract.source) ]): "0x") }}
    ]
}
```



#### **SimpleStore.bin**






```
0x602a6000556044601160003960446000f334601e5760003560e01c8063209652
0x5514602457806355241077146030575b60006000fd5b60005460005260206000
0xf35b6024361415601e5760043560005560006000f3
```



#### Note: Bytecode File Syntax

A bin file may be made up of multiple blocks of bytecode, each may
optionally begin with a `0x` prefix, all of which **must** be of
even length (since bytes are required, with 2 nibbles per byte)

All whitespace is ignored.




Assembler Examples
------------------


The assembler converts an [Ethers ASM Dialect](../../api/other/assembly/dialect) into
bytecode by running multiple passes of an assemble stage, each pass
more closely approximating the final result.

This allows small portions of the bytecode to be massaged and tweaked
until the bytecode stablizes. This allows for more compact jump
destinations and for code to be include more advanced meta-programming
techniques.


```
/home/ethers> ethers-asm SimpleStore.asm
0x602a6000556044601160003960446000f334601e5760003560e01c80632096525514602457806355241077146030575b60006000fd5b60005460005260206000f35b6024361415601e5760043560005560006000f3

# Piping in ASM source code
/home/ethers> cat SimpleStore.asm | ethers-asm
# Same as above

# Setting a define which the ASM file checks and adds a checksum
/home/ethers> ethers-asm --define checksum SimpleStore.asm
0x602a6000556065601160003960656000f334601e5760003560e01c80632096525514602457806355241077146030575b60006000fd5b60005460005260206000f35b6024361415601e5760043560005560006000f37f10358310d664c9aeb4bf4ce7a10a6a03176bd23194c8ccbd3160a6dac90774d6
```



### Options



#### **--define KEY=VALUE** *or* **--define FLAG**

This allows key/value pairs (where the value is a string) and
flags (which the value is `true`) to be passed along to the
assembler, which can be accessed in
[Scripting Blocks](../../api/other/assembly/dialect), such as `{{= defined.someKey }}`.




#### **--ignore-warnings**

By default any warning will be treated like an error. This enabled
by-passing warnings.




#### **--pic**

When a program is assembled, the labels are usually given as an
absolute byte position, which can be jumped to for loops and
control flow. This means that a program must be installed at a specific
location.

Byt specifying the **Position Independent Code** flag, code
will be generated in a way such that all offsets are relative, allowing
the program to be moved without any impact to its logic.

This does incur an additional gsas cost of 8 gas per offset access though.




#### **--target LABEL**

All programs have a root scope named `_` which is by default
assembled. This option allows another labelled target (either a
[Scopes](../../api/other/assembly/dialect) or a [Data Segment](../../api/other/assembly/dialect) to be
assembled instead. The entire program is still assembled per usual,
so this only impacts which part of the program is output.




Disassembler Examples
---------------------


A disassembled program shows offsets and mnemonics for the given
bytecode. This format may change in the future to be more
human-readable.


```
/home/ethers> ethers-asm --disassemble SimpleStore.bin
0000 : 0x2a                                                               ; #1 
0002 : 0x00                                                               ; #1 
0004 : SSTORE
0005 : 0x44                                                               ; #1 
0007 : 0x11                                                               ; #1 
0009 : 0x00                                                               ; #1 
000b : CODECOPY
000c : 0x44                                                               ; #1 
000e : 0x00                                                               ; #1 
0010 : RETURN
0011 : CALLVALUE
0012 : 0x1e                                                               ; #1 
0014 : JUMPI
0015 : 0x00                                                               ; #1 
0017 : CALLDATALOAD
0018 : 0xe0                                                               ; #1 
001a : SHR
001b : DUP1
001c : 0x20965255                                                         ; #4 
0021 : EQ
0022 : 0x24                                                               ; #1 
0024 : JUMPI
0025 : DUP1
0026 : 0x55241077                                                         ; #4 
002b : EQ
002c : 0x30                                                               ; #1 
002e : JUMPI
002f*: JUMPDEST
0030 : 0x00                                                               ; #1 
0032 : 0x00                                                               ; #1 
0034 : REVERT
0035*: JUMPDEST
0036 : 0x00                                                               ; #1 
0038 : SLOAD
0039 : 0x00                                                               ; #1 
003b : MSTORE
003c : 0x20                                                               ; #1 
003e : 0x00                                                               ; #1 
0040 : RETURN
0041*: JUMPDEST
0042 : 0x24                                                               ; #1 
0044 : CALLDATASIZE
0045 : EQ
0046 : ISZERO
0047 : 0x1e                                                               ; #1 
0049 : JUMPI
004a : 0x04                                                               ; #1 
004c : CALLDATALOAD
004d : 0x00                                                               ; #1 
004f : SSTORE
0050 : 0x00                                                               ; #1 
0052 : 0x00                                                               ; #1 
0054 : RETURN

/home/ethers> cat SimpleStore.bin | ethers-asm --disassemble 
# Same as above
```




-----
**Content Hash:** a948279ca64461ea65339332c81e2ae6705ff5eae5cf930e8ddd78e80739746e