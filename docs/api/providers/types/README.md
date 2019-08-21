
Types
=====



### BlockTag


A **BlockTag** specifies a specific location in the Blockchain.



* **`"latest"`** -- The most recently mined block
* **`"earliest"`** -- Block #0
* **`"pending"`** -- The block currently being prepared for mining; not all operations support this BlockTag
* ***number*** -- The block at this height
* ***a negative number*** -- The block this many blocks ago


### Network


A **Network** represents an Etherem network.



* **name** -- The human-readable name of the network
* **chainId** -- The Chain ID of the network
* **ensAddress** -- The address at which the ENS registry is deployed


Blocks
------



### Block


TODO


### BlockWithTransactions


TODO


Events and Logs
---------------



### EventFilter


TODO


### EventType


TODO


### Filter


TODO


### FilterByBlockHash


TODO


### Log


A network...


Transactions
------------



### TransactionRequest


A transaction request describes a transaction that is to
be sent to the network or otherwise processed.

It contains the fields: 

* **to** --- target address
* **from** --- target address
* **nonce** --- target address
* **gasLimit** --- target address
* **gasPrice** --- target address
* **data** --- target address
* **value** --- target address
* **chainId** --- target address

All fields are optional and may be a promise which resolves
to the required type.


### TransactionResponse


A **TransactionResponse** ..


### TransactionReceipt


TODO



-----
**Content Hash:** 9b08b2e4c2db679ae2fc80deb4ce59ec288da11c40730d7e1a045a2538436b17