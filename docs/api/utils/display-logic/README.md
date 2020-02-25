-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Display Logic and Input
=======================


When creating an Application, it is useful to convert between
user-friendly strings (usually displaying **ether**) and the
machine-readable values that contracts and maths depend on
(usually in **wei**).

For example, a Wallet may specify the balance in ether, and
gas prices in gwei for the User Interface, but when sending
a transaction, both must be specified in wei.

The [parseUnits](./) will parse a string representing
ether, such as `1.1` into a [BigNumber](../bignumber) in wei, and is
useful when a user types in a value, such as sending 1.1 ether.

The [formatUnits](./) will format a [BigNumberish](../bignumber)
into a string, which is useful when displaying a balance.


Units
-----



### Decimal Count


The *unit* specified may be an integer, which indicates how
many decimal place the unit has. For example, 1 ether has 18 decimal
places for wei, and if this library were used with Bitcoin, 1 BTC
has 8 decimal places for satoshis.


### Named Units


In addition to specifying *unit* as a number of decimals, there
are several common units, which can be passed in as a string:



* **wei** --- 0
* **kwei** --- 3
* **mwei** --- 6
* **gwei** --- 9
* **szabo** --- 12
* **finney** --- 15
* **ether** --- 18


Functions
---------



### Formatting



#### *ethers* . *utils* . **commify** ( value )  **=>** *string*

Returns a string with value grouped by 3 digits, separated by `,`.




### Conversion



#### *ethers* . *utils* . **formatUnits** ( value [  , unit="ether" ]  )  **=>** *string*

Returns a string representation of *value* formatted with *unit*
digits (if it is a number) or to the unit specified (if a string).




#### *ethers* . *utils* . **formatEther** ( value )  **=>** *string*

The equivalent to calling `formatUnits(value, "ether")`.




#### *ethers* . *utils* . **parseUnits** ( value [  , unit="ether" ]  )  **=>** *[BigNumber](../bignumber)*

Returns a [BigNumber](../bignumber) representation of *value*, parsed with
*unit* digits (if it is a number) or from the unit specified (if
a string).




#### *ethers* . *utils* . **parseEther** ( value )  **=>** *[BigNumber](../bignumber)*

The equivalent to calling `parseUnits(value, "ether")`.





-----
**Content Hash:** dc749d05e2f4c378032440c4cdc06b705479b15b2582dca2c838021861f86a03