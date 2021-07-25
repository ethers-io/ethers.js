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


```javascript
//_hide: const commify = ethers.utils.commify;

//_result:
commify("-1000.3000");
//_log:
```

### Conversion

#### *ethers* . *utils* . **formatUnits**( value [ , unit = "ether" ] ) => *string*

Returns a string representation of *value* formatted with *unit* digits (if it is a number) or to the unit specified (if a string).


```javascript
//_hide: const formatUnits = ethers.utils.formatUnits;
//_hide: const BigNumber = ethers.BigNumber;

const oneGwei = BigNumber.from("1000000000");
const oneEther = BigNumber.from("1000000000000000000");

//_result:
formatUnits(oneGwei, 0);
//_log:

//_result:
formatUnits(oneGwei, "gwei");
//_log:

//_result:
formatUnits(oneGwei, 9);
//_log:

//_result:
formatUnits(oneEther);
//_log:

//_result:
formatUnits(oneEther, 18);
//_log:
```

#### *ethers* . *utils* . **formatEther**( value ) => *string*

The equivalent to calling `formatUnits(value, "ether")`.


```javascript
//_hide: const formatEther = ethers.utils.formatEther;
//_hide: const BigNumber = ethers.BigNumber;

const value = BigNumber.from("1000000000000000000");

//_result:
formatEther(value);
//_log:
```

#### *ethers* . *utils* . **parseUnits**( value [ , unit = "ether" ] ) => *[BigNumber](/v5/api/utils/bignumber/)*

Returns a [BigNumber](/v5/api/utils/bignumber/) representation of *value*, parsed with *unit* digits (if it is a number) or from the unit specified (if a string).


```javascript
//_hide: const parseUnits = ethers.utils.parseUnits;

//_result:
parseUnits("1.0");
//_log:

//_result:
parseUnits("1.0", "ether");
//_log:

//_result:
parseUnits("1.0", 18);
//_log:

//_result:
parseUnits("121.0", "gwei");
//_log:

//_result:
parseUnits("121.0", 9);
//_log:
```

#### *ethers* . *utils* . **parseEther**( value ) => *[BigNumber](/v5/api/utils/bignumber/)*

The equivalent to calling `parseUnits(value, "ether")`.


```javascript
//_hide: const parseEther = ethers.utils.parseEther;

//_result:
parseEther("1.0");
//_log:

//_result:
parseEther("-0.5");
//_log:
```

