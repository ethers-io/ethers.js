ASM Utilities
=============

**Experimental** Do not use this package in production (yet)

-----

A semi-advanced EVM assembler.

**Features**

- Nested code scoping allows relative jumps
- Execute JavaScript meta-programming inline
- Self-padding data blocks
- TODO: optional Position-Independant-Code
- MIT licensed.

Command-Line Interface
======================

@TODO: Add this to the CLI package.

```
/home/ethers> ethers-asm [ --disassemble ] [ FILENAME ]
```

Syntax
======

Comments
--------

Any text that occurs after a semi-colon (i.e. `;`) is treated as a comment.

```
; This is a comment. If a comments spans multiple
; lines, it needs multiple semi-colons.

@foobar:          ; Here is another comment
```

Opcodes
-------

Each OPCODE may be specified using either the **functional notations** or
the **stack notation**.

### Functional Notation

This is the recommended syntax for opcodes as the assembler will perform
the additional step of verifying the correct number of operands are passed
in for the giver operation.

```
blockhash(sub(number, 1))
```

### Stack Notation

This method is often useful when adapting other existing disassembled
bytecode.

```
1
number
sub
blockhash
```

Labels
------

Labels are used for control flow, by providing an achor that can be used
by `JUMP` and `JUMPI`.

A label is relative to its **scope** and cannot be references outside of
its exact scope and automatically injects a `JUMPDEST` opcode.

```
@top:
    jump($top)
```

Data Blocks
-----------

Sometimes verbatim data is desired, for example, embedding strings or
look-up tables.

This can be any number of **hexstrings**, **decimal bytes** or **evals**.

A **data block** is automatically padded to ensure that any data that is
coincidentally a PUSH opcode does not impact code or data outside the
data block.

A **data** exposes two variables: the offset (in the current scope) `$foo`
and `#foo`, the length of the data. The offset may only be accessed from an
ancestor scope while the length may be accessed from any scope.

```
codecopy(0x20, $foobar, #foobar)  ; Copy the data to memory address 32

@foobar [
    0x1234                        ; This is exactly 2 bytes (i.e. 4 nibbles)
    42 65 73                      ; These are decmial values (3 bytes)
]
```

Scopes
------

A scope is a new frame of reference, which offsets will be based on. This
makes embedding code within code easier, since the jump destinations and
**data blocks** can be accessed relatively.

The top scope is named `_`.

```

// This runs the deployment
sstore(0, ${{ toUtf8Bytes("Hello World") }})
codecopy(0, $deployment, #deployment)
return (0, #deployment)

@contract {
  @label:
      jump($label)    
}
```

Evaluation and Execution
------------------------

It is often useful to be able to modify a program in more advanced ways
at code generation time. JavaScript code can be executed in a `{{! code }}``
which does not place any output in the code, but can be used to define
functions and variables and code can be evaluated in a ``{{= code }}``
which will place the output of the *code* into the assembled output, following
the same rules as **Data Blocks**.

```
{{!
    function foo() { return 42; }
}}

{{= foo() }}
1
add
```

Notes
=====

Because of the nature of script evaluation, it is possible to create
programs which cannot actually be assembled. The assembler will give
up after 512 attempts to find a stable organization of the code.

For example, this code contains a scope named `junk`, which is a `CALLER`
statement followed by a data block equal to the bytecode of `junk`. Since
this is recursive, there is never any way for this to be satisfied. This is
similar to VHDL programs where it is possible to simulate recursion, but
impossible to synthesize recursive hardware.

```
@junk {
    caller
    @thisIsRecursive[
       {{= junk }}
    ]
}
```

Or code that tries to include its own hash internally:

```
@myContract {

   ; NOT OK! hash(hash(hash( .... (data))) will never resolve stable bytecode
   @checksumBad[
       {{= keccak256(myContract) }}
   ]

   ; The hash excluding of bytecode excluding the checksum works.
   @checksumOk[
       {{= keccak256(myContract.slice(0, checksumOk.offset)) }}
       {{= zeroPad("0x", 32) }}
       {{= keccak256(myContract.slice(checksumOk.offset + 32)) }}
   ]

   ; But this is fine... The source code of a file does not change
   @checksumGood[
      {{= id(myContract.source) }
   ]

   ; Even better; this will make disassembled code look nicer...
   @checksumBest[
      {{= concat([ Opcode.from("PUSH32"), id(myContract.source) ]) }
   ]
}
```

Building
========

If you make changes to the `grammar.jison` file, make sure to run the `npm generate`
command to re-build the AST parser.


License
=======

MIT License.
