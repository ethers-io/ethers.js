export declare type BytesLike = string | Uint8Array;
/**
 *  Get a typed Uint8Array for %%value%%. If already a Uint8Array
 *  the original %%value%% is returned; if a copy is required use
 *  [[getBytesCopy]].
 *
 *  @see: getBytesCopy
 */
export declare function getBytes(value: BytesLike, name?: string): Uint8Array;
/**
 *  Get a typed Uint8Array for %%value%%, creating a copy if necessary
 *  to prevent any modifications of the returned value from being
 *  reflected elsewhere.
 *
 *  @see: getBytes
 */
export declare function getBytesCopy(value: BytesLike, name?: string): Uint8Array;
/**
 *  Returns true if %%value%% is a valid [[HexString]], with additional
 *  optional constraints depending on %%length%%.
 *
 *  If %%length%% is //true//, then %%value%% must additionally be a valid
 *  [[HexDataString]] (i.e. even length).
 *
 *  If %%length%% is //a number//, then %%value%% must represent that many
 *  bytes of data (e.g. ``0x1234`` is 2 bytes).
 */
export declare function isHexString(value: any, length?: number | boolean): value is `0x${string}`;
/**
 *  Returns true if %%value%% is a valid representation of arbitrary
 *  data (i.e. a valid [[HexDataString]] or a Uint8Array).
 */
export declare function isBytesLike(value: any): value is BytesLike;
/**
 *  Returns a [[HexDataString]] representation of %%data%%.
 */
export declare function hexlify(data: BytesLike): string;
/**
 *  Returns a [[HexDataString]] by concatenating all values
 *  within %%data%%.
 */
export declare function concat(datas: ReadonlyArray<BytesLike>): string;
/**
 *  Returns the length of %%data%%, in bytes.
 */
export declare function dataLength(data: BytesLike): number;
/**
 *  Returns a [[HexDataString]] by slicing %%data%% from the %%start%%
 *  offset to the %%end%% offset.
 *
 *  By default %%start%% is 0 and %%end%% is the length of %%data%%.
 */
export declare function dataSlice(data: BytesLike, start?: number, end?: number): string;
/**
 *  Return the [[HexDataString]] result by stripping all **leading**
 ** zero bytes from %%data%%.
 */
export declare function stripZerosLeft(data: BytesLike): string;
/**
 *  Return the [[HexDataString]] of %%data%% padded on the **left**
 *  to %%length%% bytes.
 */
export declare function zeroPadValue(data: BytesLike, length: number): string;
/**
 *  Return the [[HexDataString]] of %%data%% padded on the **right**
 *  to %%length%% bytes.
 */
export declare function zeroPadBytes(data: BytesLike, length: number): string;
//# sourceMappingURL=data.d.ts.map