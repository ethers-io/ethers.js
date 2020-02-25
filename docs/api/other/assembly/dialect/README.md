-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Ethers ASM Dialect
==================


This provides a quick, high-level overcview of the **Ethers ASM Dialect**
for EVM, which is defined by the [Ethers ASM Dialect Grammar](../../../../Users/ricmoo/Development/ethers/ethers.js-v5/https:/github.com/ethers-io/ethers.js/blob/ethers-v5-beta/packages/asm/grammar.jison)

Once a program is compiled by a higher level langauge into ASM (assembly),
or hand-coded directly in ASM, it needs to be assembled into bytecode.

The assembly process performs a very small set of operations and is
intentionally simple and closely related to the underlying EVM bytecode.

Operations include embedding programs within programs (for example the
deployment bootstrap has the runtime embedded in it) and computing the
necessary offsets for jump operations.

The [Command-Line Assembler](../../../../cli/asm) can be used to assemble an
*Ethers ASM Dialect* file or to disassemble bytecode into its
human-readable (ish) opcodes and literals.


Opcodes
-------


An **Opcode** may be provided in either a *functional* or
*instructional* syntax. For Opcodes that require parameters,
the *functional* syntax is recommended and the *instructional*
syntax will raise a warning.

@TODO: Examples


Labels
------


A **Label** is a position in the program which can be jumped to. A
`JUMPDEST` is automatically added to this point in the assembled
output.

@TODO: Exmaples


Literals
--------


A **Literal** puts data on the stack when executed using a `PUSH`
operation.

A **Literal** can be provided using a [DataHexstring](../../../utils/bytes) or a decimal
byte value.

@TODO: exmples


Comments
--------


To enter a comment in the **Ethers ASM Dialect**, any text following
a semi-colon (i.e. `;`) is ignored by the assembler.


Scopes
------


A common case in Ethereum is to have one program embedded in another.

The most common use of this is embedding a Contract **runtime bytecode**
within a **deployment bytecode**, which can be used as **init code**.

When deploying a program to Ethereum, an **init transaction** is used. An
*init transaction* has a null `to` address and contains bytecode in
the `data`. This `data` bytecode is a program, that when executed
returns some other bytecode as a result, this restul is the bytecode
to be installed.

Therefore it is important that embedded code uses jumps relative to itself,
not the entire program it is embedded in, which also means that a jump
can **only** target its own scope, no parent or child scopes. This is
enforced by the assembler.

A scope may access the offset of any child [Data Segment](./) or
child [Scopes](./) (with respect to itself) and may access the length
of any [Data Segment](./) or [Scopes](./) anywhere in the program.

Every program in the **Ethers ASM Dialect** has a top-leve scope named `_`.


Data Segment
------------


A **Data Segment** allows arbitrary data to be embedded into a program,
which can be useful for lookup tables or deploy-time constants.

An emtpty **Data Segment** can also be used when a labelled location is
required, but without the `JUMPDEST` which a [Labels](./) adds.

@TODO: Example


Links
-----


A **Link** allows access to a [Scopes](./), [Data Segment](./) or [Labels](./).

To access the byte offset of a labelled item, use `$foobar`.

For a [Labels](./), the target must be directly reachable within this scope. For
a [Data Segment](./) or a [Scopes](./), it can be inside the same scope or any
child scope.

For a [Data Segment](./) or a [Labels](./), there is an additional type of
**Link**, which provides the length of the data or bytecode respectively. A
**Length Link** is accessed by `#foobar` and is pushed on the stack as a
literal.


Stack Placeholders
------------------


@TODO: exampl


Evaluation and Excution
-----------------------




-----
**Content Hash:** b8f100efb0bd6c794cc6d4ae97c0243e10e6c2fe471cf16ba4e751ed43722bba