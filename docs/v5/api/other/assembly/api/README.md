-----

Documentation: [html](https://docs.ethers.io/)

-----

Utilities
=========

Assembler
---------

#### *asm* . **parse**( code ) => *[Node](/v5/api/other/assembly/ast/#asm-node)*

Parse an ethers-format assembly file and return the [Abstract Syntax Tree](/v5/api/other/assembly/ast/).


#### *asm* . **assemble**( node ) => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

Performs assembly of the [Abstract Syntax Tree](/v5/api/other/assembly/ast/) *node* and return the resulting bytecode representation.


Disassembler
------------

#### *asm* . **disassemble**( bytecode ) => *[Bytecode](/v5/api/other/assembly/api/#asm-bytecode)*

Returns an array of Operations given *bytecode*.


#### *asm* . **formatBytecode**( operations ) => *string*

Create a formatted output of an array of [Operation](/v5/api/other/assembly/api/#asm-operation).


### Bytecode

#### *bytecode* . **getOperation**( offset ) => *[Operation](/v5/api/other/assembly/api/#asm-operation)*

Get the operation at a given *offset* into the bytecode. This ensures that the byte at *offset* is an operation and not data contained within a `PUSH`, in which case null it returned.


### Operation

#### *operation* . **opcode** => *[Opcode](/v5/api/other/assembly/api/#asm-opcode)*

The opcode for this Operation.


#### *operation* . **offset** => *number*

The offset into the bytecode for this Operation.


#### *operation* . **pushValue** => *string< [DataHexString](/v5/api/utils/bytes/#DataHexString) >*

If the opcode is a `PUSH`, this is the value of that push


Opcode
------

#### *asm* . *Opcode* . **from**( valueOrMnemonic ) => *[Opcode](/v5/api/other/assembly/api/#asm-opcode)*

Create a new instance of an Opcode for a given numeric value (e.g. 0x60 is PUSH1) or mnemonic string (e.g. "PUSH1").


### Properties

#### *opcode* . **value** => *number*

The value (bytecode as a number) of this opcode.


#### *opcode* . **mnemonic** => *string*

The mnemonic string of this opcode.


#### *opcode* . **delta** => *number*

The number of items this opcode will consume from the stack.


#### *opcode* . **alpha** => *number*

The number of items this opcode will push onto the stack.


#### *opcode* . **doc** => *string*

A short description of what this opcode does.


#### *opcode* . **isMemory**( ) => *"read" | "write" | "full"*

Returns true if the opcode accesses memory.


#### *opcode* . **isStatic**( ) => *boolean*

Returns true if the opcode cannot change state.


#### *opcode* . **isJump**( ) => *boolean*

Returns true if the opcode is a jumper operation.


#### *opcode* . **isPush**( ) => *number*

Returns 0 if the opcode is not a `PUSH*`, or the number of bytes this opcode will push if it is.


