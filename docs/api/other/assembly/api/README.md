-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Utilities
=========



Assembler
---------


The assembler utilities allow parsing and assembling an
[Ethers ASM Dialect](../dialect) source file.


#### *asm* . **parse** ( code )  **=>** *[Node](../ast)*

Parse an ethers-format assembly file and return the [Abstract Syntax Tree](../ast).




#### *asm* . **assemble** ( node )  **=>** *string< [DataHexstring](../../../utils/bytes) >*

Performs assembly of the [Abstract Syntax Tree](../ast) *node* and return the
resulting bytecode representation.




Disassembler
------------


The **Disassembler** utilities make it easy to convert bytecode
into an object which can easily be examined for program structure.


#### *asm* . **disassemble** ( bytecode )  **=>** *[Bytecode](./)*

Returns an array of Operations given *bytecode*.




#### *asm* . **formatBytecode** ( operations )  **=>** *string*

Create a formatted output of an array of [Operation](./).




### Bytecode


Each arary index represents an operation, collapsing multi-byte operations
(i.e. `PUSH`) into a single operation.


#### *bytecode* . **getOperation** ( offset )  **=>** *[Operation](./)*

Get the operation at a given *offset* into the bytecode. This ensures that
the byte at *offset* is an operation and not data contained within a `PUSH`,
in which case null it returned.




### Operation


An **Operation** is a single command from a disassembled bytecode
stream.


#### *operation* . **opcode** **=>** *[Opcode](./)*

The opcode for this Operation.




#### *operation* . **offset** **=>** *number*

The offset into the bytecode for this Operation.




#### *operation* . **pushValue** **=>** *string< [DataHexstring](../../../utils/bytes) >*

If the opcode is a `PUSH`, this is the value of that push




Opcode
------



#### *asm* . *Opcode* . **from** ( valueOrMnemonic )  **=>** *[Opcode](./)*

Create a new instnace of an Opcode for a given numeric value
(e.g. 0x60 is PUSH1) or mnemonic string (e.g. "PUSH1").




### Properties



#### *opcode* . **value** **=>** *number*

The value (bytecode as a number) of this opcode.




#### *opcode* . **mnemonic** **=>** *string*

The mnemonic string of this opcode.




#### *opcode* . **delta** **=>** *number*

The number of items this opcode will consume from the stack.




#### *opcode* . **alpha** **=>** *number*

The number of items this opcode will push onto the stack.




#### *opcode* . **doc** **=>** *string*

A short description of what this opcode does.




#### *opcode* . **isMemory** (  )  **=>** *"read"|"write"|"full"*

Returns true if the opcode accesses memory.




#### *opcode* . **isStatic** (  )  **=>** *boolean*

Returns true if the opcode cannot change state.




#### *opcode* . **isJump** (  )  **=>** *boolean*

Returns true if the opcode is a jumper operation.




#### *opcode* . **isPush** (  )  **=>** *number*

Returns 0 if the opcode is not a `PUSH*`, or the number
of bytes this opcode will push if it is.





-----
**Content Hash:** d71fdeafad470effc353664c161dec6982a9c29b1015a5726fd2a3f576f8e377