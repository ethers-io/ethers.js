-----

Documentation: [html](https://docs.ethers.io/)

-----

Abstract Syntax Tree
====================

Types
-----

### Location

#### **offset** => *number*

The offset into the source code to the start of this node.


#### **length** => *number*

The length of characters in the source code to the end of this node.


#### **source** => *string*

The source code of this node.


Nodes
-----

### Node

#### *node* . **tag** => *string*

A unique tag for this node for the lifetime of the process.


#### *node* . **location** => *[Location](/v5/api/other/assembly/ast/#asm-location)*

The source code and location within the source code that this node represents.


### ValueNode

### LiteralNode

#### *literalNode* . **value** => *string*

The literal value of this node, which may be a [DataHexString](/v5/api/utils/bytes/#DataHexString) or string of a decimal number.


#### *literalNode* . **verbatim** => *boolean*

This is true in a [DataNode](/v5/api/other/assembly/ast/#asm-datanode) context, since in that case the value should be taken verbatim and no `PUSH` operation should be added, otherwise false.


### PopNode

#### *literalNode* . **index** => *number*

The index this **PopNode** is representing. For an implicit place-holder this is `0`.


### LinkNode

#### *linkNode* . **label** => *string*

The name of the target node.


#### *linkNode* . **type** => *"offset" | "length"*

Whether this node is for an offset or a length value of the target node.


### OpcodeNode

#### *opcodeNode* . **opcode** => *[Opcode](/v5/api/other/assembly/api/#asm-opcode)*

The opcode for this Node.


#### *opcodeNode* . **operands** => *Array< [ValueNode](/v5/api/other/assembly/ast/#asm-valuenode) >*

A list of all operands passed into this Node.


### EvaluationNode

#### *literalNode* . **verbatim** => *boolean*

This is true in a [DataNode](/v5/api/other/assembly/ast/#asm-datanode) context, since in that case the value should be taken verbatim and no `PUSH` operation should be added, otherwise false.


#### *evaluationNode* . **script** => *string*

The code to evaluate and produce the result to use as a literal.


### ExecutionNode

#### *evaluationNode* . **script** => *string*

The code to execute. Any result is ignored.


### LabelledNode

#### *labelledNode* . **name** => *string*

The name of this node.


### LabelNode

### DataNode

#### *dataNode* . **data** => *Array< [ValueNode](/v5/api/other/assembly/ast/#asm-valuenode) >*

The child nodes, which each represent a verbatim piece of data in insert.


### ScopeNode

#### *scopeNode* . **statements** => *Array< [Node](/v5/api/other/assembly/ast/#asm-node) >*

The list of child nodes for this scope.


