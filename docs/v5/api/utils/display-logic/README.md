-----

Documentation: [html](https://docs.ethers.io/)

-----

Display Logic and Input
=======================

Units
-----

### Decimal Count

### Named Units





Functions
---------

### Formatting

#### *ethers* . *utils* . **commify**( value ) => *string*

Returns a string with value grouped by 3 digits, separated by `,`.


### Conversion

#### *ethers* . *utils* . **formatUnits**( value [ , unit = "ether" ] ) => *string*

Returns a string representation of *value* formatted with *unit* digits (if it is a number) or to the unit specified (if a string).


#### *ethers* . *utils* . **formatEther**( value ) => *string*

The equivalent to calling `formatUnits(value, "ether")`.


#### *ethers* . *utils* . **parseUnits**( value [ , unit = "ether" ] ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a [BigNumber](/v5/api/utils/bignumber/) representation of *value*, parsed with *unit* digits (if it is a number) or from the unit specified (if a string).


#### *ethers* . *utils* . **parseEther**( value ) => *[BigNumber](/v5/api/utils/bignumber/)*

The equivalent to calling `parseUnits(value, "ether")`.


