# Display Logic and Input

When creating an Application, it is useful to convert between user-friendly strings (usually displaying **hbar**) and the machine-readable values that contracts and maths depend on (usually in **tinybar**).

For example, an Account may specify the balance in **hbar**, but when sending a transaction, it must be specified in **tinybar**.

The [parseUnits](display-logic-and-input.md#hethers.utils.parseunits-value-unit-hbar-bignumber) will parse a string representing hbar, such as `1.1` into a [BigNumber](bignumber.md) in tinybar, and is useful when a user types in a value, such as sending 1.1 hbar.

The [formatUnits](display-logic-and-input.md#hethers.utils.formatunits-value-unit-hbar-string) will format a [BigNumberish](bignumber.md#bignumberish) into a string, which is useful when displaying a balance.

## Units

### Decimal Count

A **Unit** can be specified as a number, which indicates the number of decimal places that should be used.

**Examples:**

* 1 hbar in tinybar, has **8** decimal places (i.e. 1 hbar represents 10^8 tinybar)
* 1 ether in wei, has **18** decimal places (i.e. 1 ether represents 10^18 wei)
* 1 bitcoin in Satoshi, has **8** decimal places (i.e. 1 bitcoin represents 10^8 satoshi)

#### Named Units

There are also several common **Named Units**, in which case their name (as a string) may be used.

| Name     | Decimals |   |
| -------- | -------- | - |
| tinybar  | 0        |   |
| microbar | 2        |   |
| millibar | 5        |   |
| hbar     | 8        |   |
| kilobar  | 11       |   |
| megabar  | 14       |   |
| gigabar  | 17       |   |

## Functions

#### Formatting

#### `hethers.utils.commify( value ) ⇒ string`

Returns a string with value grouped by 3 digits, separated by `,`.

```typescript
commify("-1000.3000");
// '-1,000.3'
```

#### Conversion

#### `hethers.utils.formatUnits( value [ , unit = "hbar" ] ) ⇒ string`

Returns a string representation of _value_ formatted with _unit_ digits (if it is a number) or to the unit specified (if a string).

```typescript
hethers.utils.formatUnits(oneGigabar, 'hbar');
// 1000000000.0

hethers.utils.formatUnits(oneHbar, "tinybar");
// '100000000'

hethers.utils.formatUnits(oneGigabar, 17);
// '1.0'

hethers.utils.formatUnits(oneHbar);
// '1.0'

hethers.utils.formatUnits(oneHbar, 8);
// '1.0'
```

{% hint style="info" %}
`The functions` formatEther `and` parseEther `have been replaced with` formatHbar `and` parseHbar.
{% endhint %}

#### `hethers.utils.formatHbar( value ) ⇒ string`

The equivalent to calling `formatUnits(value, "hbar")`.

```typescript
const value = BigNumber.from("100000000");

formatHbar(value);
// '1.0'
```

#### `hethers.utils.parseUnits( value [ , unit = "hbar" ] ) ⇒` [`BigNumber`](bignumber.md)``

Returns a [BigNumber](bignumber.md) representation of _value_, parsed with _unit_ digits (if it is a number) or from the unit specified (if a string).

```typescript
parseUnits("1.0");
// { BigNumber: "100000000" }

parseUnits("1.0", "gigabar");
// { BigNumber: "1000000000000000000" }

parseUnits("1.0", 17);
// { BigNumber: "100000000000000000" }

parseUnits("121.0", "millibari");
// { BigNumber: "12100000" }

parseUnits("121.0", 5);
// { BigNumber: "12100000" }
```

#### `hethers.utils.parseHbar( value ) ⇒` [`BigNumber`](bignumber.md)``

The equivalent to calling `parseUnits(value, "hbar")`.

```typescript
parseHbar("1.0");
// { BigNumber: "100000000" }

parseHbar("-0.5");
// { BigNumber: "--50000000" }
```
