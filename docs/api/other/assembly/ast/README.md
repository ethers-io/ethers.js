-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Abstract Syntax Tree
====================


Parsing a file using the [Ethers ASM Dialect](../dialect) will
generate an Abstract Syntax Tree. The root node will always
be a [ScopeNode](./) whose name is `_`.

To parse a file into an Abstract Syntax tree, use the [parse](../api)
function.


Types
-----



### Location



#### **offset** **=>** *number*

The offset into the source code to the start of this node.




#### **length** **=>** *number*

The length of characters in the source code to the end of this node.




#### **source** **=>** *string*

The source code of this node.




Nodes
-----


@TODO: Place a diagram here showing the hierarchy


### Node



#### *node* . **tag** **=>** *string*

A unique tag for this node for the lifetime of the process.




#### *node* . **location** **=>** *[Location](./)*

The source code and location within the source code that this
node represents.




### ValueNode


A **ValueNode** is a node which may manipulate the stack.


### LiteralNode



#### *literalNode* . **value** **=>** *string*

The literal value of this node, which may be a [DataHexstring](../../../utils/bytes) or
string of a decimal number.




#### *literalNode* . **verbatim** **=>** *boolean*

This is true in a [DataNode](./) context, since in that case the
value should be taken verbatim and no `PUSH` operation shoud be
added, otherwise false.




### PopNode


A **PopNode** is used to store a place-holder for an implicit pop from the
stack. It represents the code for an implicit place-holder (i.e. `$$`) or an
explicit place-holder (e.g. `$1`), which indicates the expect stack position
to consume.


#### *literalNode* . **index** **=>** *number*

The index this **PopNode** is representing. For an implicit place-holder
this is `0`.




### LinkNode


A **LinkNode** represents a link to another [Node](./)'s data,
for example `$foo` or `#bar`.


#### *linkNode* . **label** **=>** *string*

Te name of the target node.




#### *linkNode* . **type** **=>** *"offset"|"length"*

Whether this node is for an offset or a length value of the
target node.




### OpcodeNode



#### *opcodeNode* . **opcode** **=>** *[Opcode](../api)*

The opcode for this Node.




#### *opcodeNode* . **operands** **=>** *Array< [ValueNode](./) >*

A list of all operands passed into this Node.




### EvaluationNode


An **EvaluationNode** is used to execute code and insert the results
but does not generate
any output assembly, using the `{{! code here }}` syntax.


#### *literalNode* . **verbatim** **=>** *boolean*

This is true in a [DataNode](./) context, since in that case the
value should be taken verbatim and no `PUSH` operation shoud be
added, otherwise false.




#### *evaluationNode* . **script** **=>** *string*

The code to evaluate and produce the result to use as a literal.




### ExecutionNode


An **ExecutionNode** is used to execute code but does not generate
any output assembly, using the `{{! code here }}` syntax.


#### *evaluationNode* . **script** **=>** *string*

The code to execute. Any result is ignored.




### LabelledNode


A **LabelledNode** is used for any Node that has a name, and can therefore
be targetted by a [LinkNode](./).


#### *labelledNode* . **name** **=>** *string*

The name of this node.




### LabelNode


A **LabelNode** is used as a place to `JUMP` to by referencing it
name, using `@myLabel:`. A `JUMPDEST` is automatically inserted
at the bytecode offset.


### DataNode


A **DataNode** allows for data to be inserted directly into the output
assembly, using `@myData[ ... ]`. The data is padded if needed to ensure
values that would otherwise be regarded as a `PUSH` value does not impact
anything past the data.


#### *dataNode* . **data** **=>** *Array< [ValueNode](./) >*

The child nodes, which each represent a verbatim piece of data in insert.




### ScopeNode


A **ScopeNode** allows a new frame of reference that all [LinkNode](./)'s
will use when resolving offset locations, using `@myScope{ ... }`.


#### *scopeNode* . **statements** **=>** *Array< [Node](./) >*

The list of child nodes for this scope.





-----
**Content Hash:** 27350094145eafe8e3b166698c29705f2edee81f6126de4e45d957a7c35a7109