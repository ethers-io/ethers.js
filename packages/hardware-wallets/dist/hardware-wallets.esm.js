"use strict";
let ethers = {};
const w = window;
if (w._ethers == null) {
    console.log("WARNING: @ethersproject/hardware-wallet requires ethers loaded first");
}
else {
    ethers = w._ethers;
}

const version = "hardware-wallets/5.0.3";

var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup[tmp >> 10];
    output += lookup[(tmp >> 4) & 0x3F];
    output += lookup[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString = {}.toString;

var isArray = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

/*
 * Export kMaxLength after typed array support is determined.
 */
var _kMaxLength = kMaxLength();
function typedArraySupport () {
  return true;
  // rollup issues
  // try {
  //   var arr = new Uint8Array(1)
  //   arr.__proto__ = {
  //     __proto__: Uint8Array.prototype,
  //     foo: function () { return 42 }
  //   }
  //   return arr.foo() === 42 && // typed array instances can be augmented
  //       typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
  //       arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  // } catch (e) {
  //   return false
  // }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    // Object.defineProperty(Buffer, Symbol.species, {
    //   value: null,
    //   configurable: true
    // })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0;
  }
  return Buffer.alloc(+length)
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

/********************************************************************************
 *   Ledger Node JS API
 *   (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
function defer() {
  let resolve, reject;
  let promise = new Promise(function (success, failure) {
    resolve = success;
    reject = failure;
  });
  if (!resolve || !reject) throw "defer() error"; // this never happens and is just to make flow happy

  return {
    promise,
    resolve,
    reject
  };
} // TODO use bip32-path library

function splitPath(path) {
  let result = [];
  let components = path.split("/");
  components.forEach(element => {
    let number = parseInt(element, 10);

    if (isNaN(number)) {
      return; // FIXME shouldn't it throws instead?
    }

    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000;
    }

    result.push(number);
  });
  return result;
} // TODO use async await

function eachSeries(arr, fun) {
  return arr.reduce((p, e) => p.then(() => fun(e)), Promise.resolve());
}
function foreach(arr, callback) {
  function iterate(index, array, result) {
    if (index >= array.length) {
      return result;
    } else return callback(array[index], index).then(function (res) {
      result.push(res);
      return iterate(index + 1, array, result);
    });
  }

  return Promise.resolve().then(() => iterate(0, arr, []));
}
function doIf(condition, callback) {
  return Promise.resolve().then(() => {
    if (condition) {
      return callback();
    }
  });
}
function asyncWhile(predicate, callback) {
  function iterate(result) {
    if (!predicate()) {
      return result;
    } else {
      return callback().then(res => {
        result.push(res);
        return iterate(result);
      });
    }
  }

  return Promise.resolve([]).then(iterate);
}

/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-prototype-builtins */
var errorClasses = {};
var deserializers = {};
var addCustomErrorDeserializer = function (name, deserializer) {
    deserializers[name] = deserializer;
};
var createCustomErrorClass = function (name) {
    var C = function CustomError(message, fields) {
        Object.assign(this, fields);
        this.name = name;
        this.message = message || name;
        this.stack = new Error().stack;
    };
    C.prototype = new Error();
    errorClasses[name] = C;
    return C;
};
// inspired from https://github.com/programble/errio/blob/master/index.js
var deserializeError = function (object) {
    if (typeof object === "object" && object) {
        try {
            // $FlowFixMe FIXME HACK
            var msg = JSON.parse(object.message);
            if (msg.message && msg.name) {
                object = msg;
            }
        }
        catch (e) {
            // nothing
        }
        var error = void 0;
        if (typeof object.name === "string") {
            var name_1 = object.name;
            var des = deserializers[name_1];
            if (des) {
                error = des(object);
            }
            else {
                var constructor = name_1 === "Error" ? Error : errorClasses[name_1];
                if (!constructor) {
                    console.warn("deserializing an unknown class '" + name_1 + "'");
                    constructor = createCustomErrorClass(name_1);
                }
                error = Object.create(constructor.prototype);
                try {
                    for (var prop in object) {
                        if (object.hasOwnProperty(prop)) {
                            error[prop] = object[prop];
                        }
                    }
                }
                catch (e) {
                    // sometimes setting a property can fail (e.g. .name)
                }
            }
        }
        else {
            error = new Error(object.message);
        }
        if (!error.stack && Error.captureStackTrace) {
            Error.captureStackTrace(error, deserializeError);
        }
        return error;
    }
    return new Error(String(object));
};
// inspired from https://github.com/sindresorhus/serialize-error/blob/master/index.js
var serializeError = function (value) {
    if (!value)
        return value;
    if (typeof value === "object") {
        return destroyCircular(value, []);
    }
    if (typeof value === "function") {
        return "[Function: " + (value.name || "anonymous") + "]";
    }
    return value;
};
// https://www.npmjs.com/package/destroy-circular
function destroyCircular(from, seen) {
    var to = {};
    seen.push(from);
    for (var _i = 0, _a = Object.keys(from); _i < _a.length; _i++) {
        var key = _a[_i];
        var value = from[key];
        if (typeof value === "function") {
            continue;
        }
        if (!value || typeof value !== "object") {
            to[key] = value;
            continue;
        }
        if (seen.indexOf(from[key]) === -1) {
            to[key] = destroyCircular(from[key], seen.slice(0));
            continue;
        }
        to[key] = "[Circular]";
    }
    if (typeof from.name === "string") {
        to.name = from.name;
    }
    if (typeof from.message === "string") {
        to.message = from.message;
    }
    if (typeof from.stack === "string") {
        to.stack = from.stack;
    }
    return to;
}

var AccountNameRequiredError = createCustomErrorClass("AccountNameRequired");
var AccountNotSupported = createCustomErrorClass("AccountNotSupported");
var AmountRequired = createCustomErrorClass("AmountRequired");
var BluetoothRequired = createCustomErrorClass("BluetoothRequired");
var BtcUnmatchedApp = createCustomErrorClass("BtcUnmatchedApp");
var CantOpenDevice = createCustomErrorClass("CantOpenDevice");
var CashAddrNotSupported = createCustomErrorClass("CashAddrNotSupported");
var CurrencyNotSupported = createCustomErrorClass("CurrencyNotSupported");
var DeviceAppVerifyNotSupported = createCustomErrorClass("DeviceAppVerifyNotSupported");
var DeviceGenuineSocketEarlyClose = createCustomErrorClass("DeviceGenuineSocketEarlyClose");
var DeviceNotGenuineError = createCustomErrorClass("DeviceNotGenuine");
var DeviceOnDashboardExpected = createCustomErrorClass("DeviceOnDashboardExpected");
var DeviceOnDashboardUnexpected = createCustomErrorClass("DeviceOnDashboardUnexpected");
var DeviceInOSUExpected = createCustomErrorClass("DeviceInOSUExpected");
var DeviceHalted = createCustomErrorClass("DeviceHalted");
var DeviceNameInvalid = createCustomErrorClass("DeviceNameInvalid");
var DeviceSocketFail = createCustomErrorClass("DeviceSocketFail");
var DeviceSocketNoBulkStatus = createCustomErrorClass("DeviceSocketNoBulkStatus");
var DisconnectedDevice = createCustomErrorClass("DisconnectedDevice");
var DisconnectedDeviceDuringOperation = createCustomErrorClass("DisconnectedDeviceDuringOperation");
var EnpointConfigError = createCustomErrorClass("EnpointConfig");
var EthAppPleaseEnableContractData = createCustomErrorClass("EthAppPleaseEnableContractData");
var FeeEstimationFailed = createCustomErrorClass("FeeEstimationFailed");
var FirmwareNotRecognized = createCustomErrorClass("FirmwareNotRecognized");
var HardResetFail = createCustomErrorClass("HardResetFail");
var InvalidXRPTag = createCustomErrorClass("InvalidXRPTag");
var InvalidAddress = createCustomErrorClass("InvalidAddress");
var InvalidAddressBecauseDestinationIsAlsoSource = createCustomErrorClass("InvalidAddressBecauseDestinationIsAlsoSource");
var LatestMCUInstalledError = createCustomErrorClass("LatestMCUInstalledError");
var UnknownMCU = createCustomErrorClass("UnknownMCU");
var LedgerAPIError = createCustomErrorClass("LedgerAPIError");
var LedgerAPIErrorWithMessage = createCustomErrorClass("LedgerAPIErrorWithMessage");
var LedgerAPINotAvailable = createCustomErrorClass("LedgerAPINotAvailable");
var ManagerAppAlreadyInstalledError = createCustomErrorClass("ManagerAppAlreadyInstalled");
var ManagerAppRelyOnBTCError = createCustomErrorClass("ManagerAppRelyOnBTC");
var ManagerAppDepInstallRequired = createCustomErrorClass("ManagerAppDepInstallRequired");
var ManagerAppDepUninstallRequired = createCustomErrorClass("ManagerAppDepUninstallRequired");
var ManagerDeviceLockedError = createCustomErrorClass("ManagerDeviceLocked");
var ManagerFirmwareNotEnoughSpaceError = createCustomErrorClass("ManagerFirmwareNotEnoughSpace");
var ManagerNotEnoughSpaceError = createCustomErrorClass("ManagerNotEnoughSpace");
var ManagerUninstallBTCDep = createCustomErrorClass("ManagerUninstallBTCDep");
var NetworkDown = createCustomErrorClass("NetworkDown");
var NoAddressesFound = createCustomErrorClass("NoAddressesFound");
var NotEnoughBalance = createCustomErrorClass("NotEnoughBalance");
var NotEnoughBalanceToDelegate = createCustomErrorClass("NotEnoughBalanceToDelegate");
var NotEnoughBalanceInParentAccount = createCustomErrorClass("NotEnoughBalanceInParentAccount");
var NotEnoughSpendableBalance = createCustomErrorClass("NotEnoughSpendableBalance");
var NotEnoughBalanceBecauseDestinationNotCreated = createCustomErrorClass("NotEnoughBalanceBecauseDestinationNotCreated");
var NoAccessToCamera = createCustomErrorClass("NoAccessToCamera");
var NotEnoughGas = createCustomErrorClass("NotEnoughGas");
var NotSupportedLegacyAddress = createCustomErrorClass("NotSupportedLegacyAddress");
var GasLessThanEstimate = createCustomErrorClass("GasLessThanEstimate");
var PasswordsDontMatchError = createCustomErrorClass("PasswordsDontMatch");
var PasswordIncorrectError = createCustomErrorClass("PasswordIncorrect");
var RecommendSubAccountsToEmpty = createCustomErrorClass("RecommendSubAccountsToEmpty");
var RecommendUndelegation = createCustomErrorClass("RecommendUndelegation");
var TimeoutTagged = createCustomErrorClass("TimeoutTagged");
var UnexpectedBootloader = createCustomErrorClass("UnexpectedBootloader");
var MCUNotGenuineToDashboard = createCustomErrorClass("MCUNotGenuineToDashboard");
var RecipientRequired = createCustomErrorClass("RecipientRequired");
var UnavailableTezosOriginatedAccountReceive = createCustomErrorClass("UnavailableTezosOriginatedAccountReceive");
var UnavailableTezosOriginatedAccountSend = createCustomErrorClass("UnavailableTezosOriginatedAccountSend");
var UpdateFetchFileFail = createCustomErrorClass("UpdateFetchFileFail");
var UpdateIncorrectHash = createCustomErrorClass("UpdateIncorrectHash");
var UpdateIncorrectSig = createCustomErrorClass("UpdateIncorrectSig");
var UpdateYourApp = createCustomErrorClass("UpdateYourApp");
var UserRefusedDeviceNameChange = createCustomErrorClass("UserRefusedDeviceNameChange");
var UserRefusedAddress = createCustomErrorClass("UserRefusedAddress");
var UserRefusedFirmwareUpdate = createCustomErrorClass("UserRefusedFirmwareUpdate");
var UserRefusedAllowManager = createCustomErrorClass("UserRefusedAllowManager");
var UserRefusedOnDevice = createCustomErrorClass("UserRefusedOnDevice"); // TODO rename because it's just for transaction refusal
var TransportOpenUserCancelled = createCustomErrorClass("TransportOpenUserCancelled");
var TransportInterfaceNotAvailable = createCustomErrorClass("TransportInterfaceNotAvailable");
var TransportRaceCondition = createCustomErrorClass("TransportRaceCondition");
var TransportWebUSBGestureRequired = createCustomErrorClass("TransportWebUSBGestureRequired");
var DeviceShouldStayInApp = createCustomErrorClass("DeviceShouldStayInApp");
var WebsocketConnectionError = createCustomErrorClass("WebsocketConnectionError");
var WebsocketConnectionFailed = createCustomErrorClass("WebsocketConnectionFailed");
var WrongDeviceForAccount = createCustomErrorClass("WrongDeviceForAccount");
var WrongAppForCurrency = createCustomErrorClass("WrongAppForCurrency");
var ETHAddressNonEIP = createCustomErrorClass("ETHAddressNonEIP");
var CantScanQRCode = createCustomErrorClass("CantScanQRCode");
var FeeNotLoaded = createCustomErrorClass("FeeNotLoaded");
var FeeRequired = createCustomErrorClass("FeeRequired");
var FeeTooHigh = createCustomErrorClass("FeeTooHigh");
var SyncError = createCustomErrorClass("SyncError");
var PairingFailed = createCustomErrorClass("PairingFailed");
var GenuineCheckFailed = createCustomErrorClass("GenuineCheckFailed");
var LedgerAPI4xx = createCustomErrorClass("LedgerAPI4xx");
var LedgerAPI5xx = createCustomErrorClass("LedgerAPI5xx");
var FirmwareOrAppUpdateRequired = createCustomErrorClass("FirmwareOrAppUpdateRequired");
// db stuff, no need to translate
var NoDBPathGiven = createCustomErrorClass("NoDBPathGiven");
var DBWrongPassword = createCustomErrorClass("DBWrongPassword");
var DBNotReset = createCustomErrorClass("DBNotReset");
/**
 * TransportError is used for any generic transport errors.
 * e.g. Error thrown when data received by exchanges are incorrect or if exchanged failed to communicate with the device for various reason.
 */
function TransportError(message, id) {
    this.name = "TransportError";
    this.message = message;
    this.stack = new Error().stack;
    this.id = id;
}
TransportError.prototype = new Error();
addCustomErrorDeserializer("TransportError", function (e) { return new TransportError(e.message, e.id); });
var StatusCodes = {
    PIN_REMAINING_ATTEMPTS: 0x63c0,
    INCORRECT_LENGTH: 0x6700,
    MISSING_CRITICAL_PARAMETER: 0x6800,
    COMMAND_INCOMPATIBLE_FILE_STRUCTURE: 0x6981,
    SECURITY_STATUS_NOT_SATISFIED: 0x6982,
    CONDITIONS_OF_USE_NOT_SATISFIED: 0x6985,
    INCORRECT_DATA: 0x6a80,
    NOT_ENOUGH_MEMORY_SPACE: 0x6a84,
    REFERENCED_DATA_NOT_FOUND: 0x6a88,
    FILE_ALREADY_EXISTS: 0x6a89,
    INCORRECT_P1_P2: 0x6b00,
    INS_NOT_SUPPORTED: 0x6d00,
    CLA_NOT_SUPPORTED: 0x6e00,
    TECHNICAL_PROBLEM: 0x6f00,
    OK: 0x9000,
    MEMORY_PROBLEM: 0x9240,
    NO_EF_SELECTED: 0x9400,
    INVALID_OFFSET: 0x9402,
    FILE_NOT_FOUND: 0x9404,
    INCONSISTENT_FILE: 0x9408,
    ALGORITHM_NOT_SUPPORTED: 0x9484,
    INVALID_KCV: 0x9485,
    CODE_NOT_INITIALIZED: 0x9802,
    ACCESS_CONDITION_NOT_FULFILLED: 0x9804,
    CONTRADICTION_SECRET_CODE_STATUS: 0x9808,
    CONTRADICTION_INVALIDATION: 0x9810,
    CODE_BLOCKED: 0x9840,
    MAX_VALUE_REACHED: 0x9850,
    GP_AUTH_FAILED: 0x6300,
    LICENSING: 0x6f42,
    HALTED: 0x6faa,
};
function getAltStatusMessage(code) {
    switch (code) {
        // improve text of most common errors
        case 0x6700:
            return "Incorrect length";
        case 0x6800:
            return "Missing critical parameter";
        case 0x6982:
            return "Security not satisfied (dongle locked or have invalid access rights)";
        case 0x6985:
            return "Condition of use not satisfied (denied by the user?)";
        case 0x6a80:
            return "Invalid data received";
        case 0x6b00:
            return "Invalid parameter received";
    }
    if (0x6f00 <= code && code <= 0x6fff) {
        return "Internal error, please report";
    }
}
/**
 * Error thrown when a device returned a non success status.
 * the error.statusCode is one of the `StatusCodes` exported by this library.
 */
function TransportStatusError(statusCode) {
    this.name = "TransportStatusError";
    var statusText = Object.keys(StatusCodes).find(function (k) { return StatusCodes[k] === statusCode; }) ||
        "UNKNOWN_ERROR";
    var smsg = getAltStatusMessage(statusCode) || statusText;
    var statusCodeStr = statusCode.toString(16);
    this.message = "Ledger device: " + smsg + " (0x" + statusCodeStr + ")";
    this.stack = new Error().stack;
    this.statusCode = statusCode;
    this.statusText = statusText;
}
TransportStatusError.prototype = new Error();
addCustomErrorDeserializer("TransportStatusError", function (e) { return new TransportStatusError(e.statusCode); });

const remapTransactionRelatedErrors = e => {
  if (e && e.statusCode === 0x6a80) {
    return new EthAppPleaseEnableContractData("Please enable Contract data on the Ethereum app Settings");
  }

  return e;
};
/**
 * Ethereum API
 *
 * @example
 * import Eth from "@ledgerhq/hw-app-eth";
 * const eth = new Eth(transport)
 */


class Eth {
  constructor(transport, scrambleKey = "w0w") {
    this.transport = void 0;
    this.transport = transport;
    transport.decorateAppAPIMethods(this, ["getAddress", "provideERC20TokenInformation", "signTransaction", "signPersonalMessage", "getAppConfiguration"], scrambleKey);
  }
  /**
   * get Ethereum address for a given BIP 32 path.
   * @param path a path in BIP 32 format
   * @option boolDisplay optionally enable or not the display
   * @option boolChaincode optionally enable or not the chaincode request
   * @return an object with a publicKey, address and (optionally) chainCode
   * @example
   * eth.getAddress("44'/60'/0'/0/0").then(o => o.address)
   */


  getAddress(path, boolDisplay, boolChaincode) {
    let paths = splitPath(path);
    let buffer = Buffer.alloc(1 + paths.length * 4);
    buffer[0] = paths.length;
    paths.forEach((element, index) => {
      buffer.writeUInt32BE(element, 1 + 4 * index);
    });
    return this.transport.send(0xe0, 0x02, boolDisplay ? 0x01 : 0x00, boolChaincode ? 0x01 : 0x00, buffer).then(response => {
      let result = {};
      let publicKeyLength = response[0];
      let addressLength = response[1 + publicKeyLength];
      result.publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");
      result.address = "0x" + response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString("ascii");

      if (boolChaincode) {
        result.chainCode = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString("hex");
      }

      return result;
    });
  }
  /**
   * This commands provides a trusted description of an ERC 20 token
   * to associate a contract address with a ticker and number of decimals.
   *
   * It shall be run immediately before performing a transaction involving a contract
   * calling this contract address to display the proper token information to the user if necessary.
   *
   * @param {*} info: a blob from "erc20.js" utilities that contains all token information.
   *
   * @example
   * import { byContractAddress } from "@ledgerhq/hw-app-eth/erc20"
   * const zrxInfo = byContractAddress("0xe41d2489571d322189246dafa5ebde1f4699f498")
   * if (zrxInfo) await appEth.provideERC20TokenInformation(zrxInfo)
   * const signed = await appEth.signTransaction(path, rawTxHex)
   */


  provideERC20TokenInformation({
    data
  }) {
    return this.transport.send(0xe0, 0x0a, 0x00, 0x00, data).then(() => true, e => {
      if (e && e.statusCode === 0x6d00) {
        // this case happen for older version of ETH app, since older app version had the ERC20 data hardcoded, it's fine to assume it worked.
        // we return a flag to know if the call was effective or not
        return false;
      }

      throw e;
    });
  }
  /**
   * You can sign a transaction and retrieve v, r, s given the raw transaction and the BIP 32 path of the account to sign
   * @example
   eth.signTransaction("44'/60'/0'/0/0", "e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080").then(result => ...)
   */


  signTransaction(path, rawTxHex) {
    let paths = splitPath(path);
    let offset = 0;
    let rawTx = Buffer.from(rawTxHex, "hex");
    let toSend = [];
    let response;

    while (offset !== rawTx.length) {
      let maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150;
      let chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;
      let buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize);

      if (offset === 0) {
        buffer[0] = paths.length;
        paths.forEach((element, index) => {
          buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
      } else {
        rawTx.copy(buffer, 0, offset, offset + chunkSize);
      }

      toSend.push(buffer);
      offset += chunkSize;
    }

    return foreach(toSend, (data, i) => this.transport.send(0xe0, 0x04, i === 0 ? 0x00 : 0x80, 0x00, data).then(apduResponse => {
      response = apduResponse;
    })).then(() => {
      const v = response.slice(0, 1).toString("hex");
      const r = response.slice(1, 1 + 32).toString("hex");
      const s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
      return {
        v,
        r,
        s
      };
    }, e => {
      throw remapTransactionRelatedErrors(e);
    });
  }
  /**
   */


  getAppConfiguration() {
    return this.transport.send(0xe0, 0x06, 0x00, 0x00).then(response => {
      let result = {};
      result.arbitraryDataEnabled = response[0] & 0x01;
      result.version = "" + response[1] + "." + response[2] + "." + response[3];
      return result;
    });
  }
  /**
  * You can sign a message according to eth_sign RPC call and retrieve v, r, s given the message and the BIP 32 path of the account to sign.
  * @example
  eth.signPersonalMessage("44'/60'/0'/0/0", Buffer.from("test").toString("hex")).then(result => {
  var v = result['v'] - 27;
  v = v.toString(16);
  if (v.length < 2) {
    v = "0" + v;
  }
  console.log("Signature 0x" + result['r'] + result['s'] + v);
  })
   */


  signPersonalMessage(path, messageHex) {
    let paths = splitPath(path);
    let offset = 0;
    let message = Buffer.from(messageHex, "hex");
    let toSend = [];
    let response;

    while (offset !== message.length) {
      let maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 - 4 : 150;
      let chunkSize = offset + maxChunkSize > message.length ? message.length - offset : maxChunkSize;
      let buffer = Buffer.alloc(offset === 0 ? 1 + paths.length * 4 + 4 + chunkSize : chunkSize);

      if (offset === 0) {
        buffer[0] = paths.length;
        paths.forEach((element, index) => {
          buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        buffer.writeUInt32BE(message.length, 1 + 4 * paths.length);
        message.copy(buffer, 1 + 4 * paths.length + 4, offset, offset + chunkSize);
      } else {
        message.copy(buffer, 0, offset, offset + chunkSize);
      }

      toSend.push(buffer);
      offset += chunkSize;
    }

    return foreach(toSend, (data, i) => this.transport.send(0xe0, 0x08, i === 0 ? 0x00 : 0x80, 0x00, data).then(apduResponse => {
      response = apduResponse;
    })).then(() => {
      const v = response[0];
      const r = response.slice(1, 1 + 32).toString("hex");
      const s = response.slice(1 + 32, 1 + 32 + 32).toString("hex");
      return {
        v,
        r,
        s
      };
    });
  }

}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

// Copyright 2014 Google Inc. All rights reserved
//
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file or at
// https://developers.google.com/open-source/licenses/bsd

/**
 * @fileoverview The U2F api.
 */

'use strict';

/** Namespace for the U2F api.
 * @type {Object}
 */
var u2f = u2f || {};

var googleU2fApi = u2f; // Adaptation for u2f-api package

/**
 * The U2F extension id
 * @type {string}
 * @const
 */
u2f.EXTENSION_ID = 'kmendfapggjehodndflmmgagdbamhnfd';

/**
 * Message types for messsages to/from the extension
 * @const
 * @enum {string}
 */
u2f.MessageTypes = {
  'U2F_REGISTER_REQUEST': 'u2f_register_request',
  'U2F_SIGN_REQUEST': 'u2f_sign_request',
  'U2F_REGISTER_RESPONSE': 'u2f_register_response',
  'U2F_SIGN_RESPONSE': 'u2f_sign_response'
};

/**
 * Response status codes
 * @const
 * @enum {number}
 */
u2f.ErrorCodes = {
  'OK': 0,
  'OTHER_ERROR': 1,
  'BAD_REQUEST': 2,
  'CONFIGURATION_UNSUPPORTED': 3,
  'DEVICE_INELIGIBLE': 4,
  'TIMEOUT': 5
};

/**
 * A message type for registration requests
 * @typedef {{
 *   type: u2f.MessageTypes,
 *   signRequests: Array.<u2f.SignRequest>,
 *   registerRequests: ?Array.<u2f.RegisterRequest>,
 *   timeoutSeconds: ?number,
 *   requestId: ?number
 * }}
 */
u2f.Request;

/**
 * A message for registration responses
 * @typedef {{
 *   type: u2f.MessageTypes,
 *   responseData: (u2f.Error | u2f.RegisterResponse | u2f.SignResponse),
 *   requestId: ?number
 * }}
 */
u2f.Response;

/**
 * An error object for responses
 * @typedef {{
 *   errorCode: u2f.ErrorCodes,
 *   errorMessage: ?string
 * }}
 */
u2f.Error;

/**
 * Data object for a single sign request.
 * @typedef {{
 *   version: string,
 *   challenge: string,
 *   keyHandle: string,
 *   appId: string
 * }}
 */
u2f.SignRequest;

/**
 * Data object for a sign response.
 * @typedef {{
 *   keyHandle: string,
 *   signatureData: string,
 *   clientData: string
 * }}
 */
u2f.SignResponse;

/**
 * Data object for a registration request.
 * @typedef {{
 *   version: string,
 *   challenge: string,
 *   appId: string
 * }}
 */
u2f.RegisterRequest;

/**
 * Data object for a registration response.
 * @typedef {{
 *   registrationData: string,
 *   clientData: string
 * }}
 */
u2f.RegisterResponse;


// Low level MessagePort API support

/**
 * Call MessagePort disconnect
 */
u2f.disconnect = function() {
  if (u2f.port_ && u2f.port_.port_) {
    u2f.port_.port_.disconnect();
    u2f.port_ = null;
  }
};

/**
 * Sets up a MessagePort to the U2F extension using the
 * available mechanisms.
 * @param {function((MessagePort|u2f.WrappedChromeRuntimePort_))} callback
 */
u2f.getMessagePort = function(callback) {
  if (typeof chrome != 'undefined' && chrome.runtime) {
    // The actual message here does not matter, but we need to get a reply
    // for the callback to run. Thus, send an empty signature request
    // in order to get a failure response.
    var msg = {
      type: u2f.MessageTypes.U2F_SIGN_REQUEST,
      signRequests: []
    };
    chrome.runtime.sendMessage(u2f.EXTENSION_ID, msg, function() {
      if (!chrome.runtime.lastError) {
        // We are on a whitelisted origin and can talk directly
        // with the extension.
        u2f.getChromeRuntimePort_(callback);
      } else {
        // chrome.runtime was available, but we couldn't message
        // the extension directly, use iframe
        u2f.getIframePort_(callback);
      }
    });
  } else {
    // chrome.runtime was not available at all, which is normal
    // when this origin doesn't have access to any extensions.
    u2f.getIframePort_(callback);
  }
};

/**
 * Connects directly to the extension via chrome.runtime.connect
 * @param {function(u2f.WrappedChromeRuntimePort_)} callback
 * @private
 */
u2f.getChromeRuntimePort_ = function(callback) {
  var port = chrome.runtime.connect(u2f.EXTENSION_ID,
    {'includeTlsChannelId': true});
  setTimeout(function() {
    callback(null, new u2f.WrappedChromeRuntimePort_(port));
  }, 0);
};

/**
 * A wrapper for chrome.runtime.Port that is compatible with MessagePort.
 * @param {Port} port
 * @constructor
 * @private
 */
u2f.WrappedChromeRuntimePort_ = function(port) {
  this.port_ = port;
};

/**
 * Posts a message on the underlying channel.
 * @param {Object} message
 */
u2f.WrappedChromeRuntimePort_.prototype.postMessage = function(message) {
  this.port_.postMessage(message);
};

/**
 * Emulates the HTML 5 addEventListener interface. Works only for the
 * onmessage event, which is hooked up to the chrome.runtime.Port.onMessage.
 * @param {string} eventName
 * @param {function({data: Object})} handler
 */
u2f.WrappedChromeRuntimePort_.prototype.addEventListener =
    function(eventName, handler) {
  var name = eventName.toLowerCase();
  if (name == 'message' || name == 'onmessage') {
    this.port_.onMessage.addListener(function(message) {
      // Emulate a minimal MessageEvent object
      handler({'data': message});
    });
  } else {
    console.error('WrappedChromeRuntimePort only supports onMessage');
  }
};

/**
 * Sets up an embedded trampoline iframe, sourced from the extension.
 * @param {function(MessagePort)} callback
 * @private
 */
u2f.getIframePort_ = function(callback) {
  // Create the iframe
  var iframeOrigin = 'chrome-extension://' + u2f.EXTENSION_ID;
  var iframe = document.createElement('iframe');
  iframe.src = iframeOrigin + '/u2f-comms.html';
  iframe.setAttribute('style', 'display:none');
  document.body.appendChild(iframe);

  var hasCalledBack = false;

  var channel = new MessageChannel();
  var ready = function(message) {
    if (message.data == 'ready') {
      channel.port1.removeEventListener('message', ready);
      if (!hasCalledBack)
      {
        hasCalledBack = true;
        callback(null, channel.port1);
      }
    } else {
      console.error('First event on iframe port was not "ready"');
    }
  };
  channel.port1.addEventListener('message', ready);
  channel.port1.start();

  iframe.addEventListener('load', function() {
    // Deliver the port to the iframe and initialize
    iframe.contentWindow.postMessage('init', iframeOrigin, [channel.port2]);
  });

  // Give this 200ms to initialize, after that, we treat this method as failed
  setTimeout(function() {
    if (!hasCalledBack)
    {
      hasCalledBack = true;
      callback(new Error("IFrame extension not supported"));
    }
  }, 200);
};


// High-level JS API

/**
 * Default extension response timeout in seconds.
 * @const
 */
u2f.EXTENSION_TIMEOUT_SEC = 30;

/**
 * A singleton instance for a MessagePort to the extension.
 * @type {MessagePort|u2f.WrappedChromeRuntimePort_}
 * @private
 */
u2f.port_ = null;

/**
 * Callbacks waiting for a port
 * @type {Array.<function((MessagePort|u2f.WrappedChromeRuntimePort_))>}
 * @private
 */
u2f.waitingForPort_ = [];

/**
 * A counter for requestIds.
 * @type {number}
 * @private
 */
u2f.reqCounter_ = 0;

/**
 * A map from requestIds to client callbacks
 * @type {Object.<number,(function((u2f.Error|u2f.RegisterResponse))
 *                       |function((u2f.Error|u2f.SignResponse)))>}
 * @private
 */
u2f.callbackMap_ = {};

/**
 * Creates or retrieves the MessagePort singleton to use.
 * @param {function((MessagePort|u2f.WrappedChromeRuntimePort_))} callback
 * @private
 */
u2f.getPortSingleton_ = function(callback) {
  if (u2f.port_) {
    callback(null, u2f.port_);
  } else {
    if (u2f.waitingForPort_.length == 0) {
      u2f.getMessagePort(function(err, port) {
        if (!err) {
          u2f.port_ = port;
          u2f.port_.addEventListener('message',
            /** @type {function(Event)} */ (u2f.responseHandler_));
        }

        // Careful, here be async callbacks. Maybe.
        while (u2f.waitingForPort_.length)
          u2f.waitingForPort_.shift()(err, port);
      });
    }
    u2f.waitingForPort_.push(callback);
  }
};

/**
 * Handles response messages from the extension.
 * @param {MessageEvent.<u2f.Response>} message
 * @private
 */
u2f.responseHandler_ = function(message) {
  var response = message.data;
  var reqId = response['requestId'];
  if (!reqId || !u2f.callbackMap_[reqId]) {
    console.error('Unknown or missing requestId in response.');
    return;
  }
  var cb = u2f.callbackMap_[reqId];
  delete u2f.callbackMap_[reqId];
  cb(null, response['responseData']);
};

/**
 * Calls the callback with true or false as first and only argument
 * @param {Function} callback
 */
u2f.isSupported = function(callback) {
  u2f.getPortSingleton_(function(err, port) {
    callback(!err);
  });
};

/**
 * Dispatches an array of sign requests to available U2F tokens.
 * @param {Array.<u2f.SignRequest>} signRequests
 * @param {function((u2f.Error|u2f.SignResponse))} callback
 * @param {number=} opt_timeoutSeconds
 */
u2f.sign = function(signRequests, callback, opt_timeoutSeconds) {
  u2f.getPortSingleton_(function(err, port) {
    if (err)
      return callback(err);

    var reqId = ++u2f.reqCounter_;
    u2f.callbackMap_[reqId] = callback;
    var req = {
      type: u2f.MessageTypes.U2F_SIGN_REQUEST,
      signRequests: signRequests,
      timeoutSeconds: (typeof opt_timeoutSeconds !== 'undefined' ?
        opt_timeoutSeconds : u2f.EXTENSION_TIMEOUT_SEC),
      requestId: reqId
    };
    port.postMessage(req);
  });
};

/**
 * Dispatches register requests to available U2F tokens. An array of sign
 * requests identifies already registered tokens.
 * @param {Array.<u2f.RegisterRequest>} registerRequests
 * @param {Array.<u2f.SignRequest>} signRequests
 * @param {function((u2f.Error|u2f.RegisterResponse))} callback
 * @param {number=} opt_timeoutSeconds
 */
u2f.register = function(registerRequests, signRequests,
    callback, opt_timeoutSeconds) {
  u2f.getPortSingleton_(function(err, port) {
    if (err)
      return callback(err);

    var reqId = ++u2f.reqCounter_;
    u2f.callbackMap_[reqId] = callback;
    var req = {
      type: u2f.MessageTypes.U2F_REGISTER_REQUEST,
      signRequests: signRequests,
      registerRequests: registerRequests,
      timeoutSeconds: (typeof opt_timeoutSeconds !== 'undefined' ?
        opt_timeoutSeconds : u2f.EXTENSION_TIMEOUT_SEC),
      requestId: reqId
    };
    port.postMessage(req);
  });
};

'use strict';

var u2fApi = API;



// Feature detection (yes really)
var isBrowser = ( typeof navigator !== 'undefined' ) && !!navigator.userAgent;
var isSafari = isBrowser && navigator.userAgent.match( /Safari\// )
	&& !navigator.userAgent.match( /Chrome\// );
var isEDGE = isBrowser && navigator.userAgent.match( /Edge\/1[2345]/ );

var _backend = null;
function getBackend( Promise )
{
	if ( !_backend )
		_backend = new Promise( function( resolve, reject )
		{
			function notSupported( )
			{
				// Note; {native: true} means *not* using Google's hack
				resolve( { u2f: null, native: true } );
			}

			if ( !isBrowser )
				return notSupported( );

			if ( isSafari )
				// Safari doesn't support U2F, and the Safari-FIDO-U2F
				// extension lacks full support (Multi-facet apps), so we
				// block it until proper support.
				return notSupported( );

			var hasNativeSupport =
				( typeof window.u2f !== 'undefined' ) &&
				( typeof window.u2f.sign === 'function' );

			if ( hasNativeSupport )
				resolve( { u2f: window.u2f, native: true } );

			if ( isEDGE )
				// We don't want to check for Google's extension hack on EDGE
				// as it'll cause trouble (popups, etc)
				return notSupported( );

			if ( location.protocol === 'http:' )
				// U2F isn't supported over http, only https
				return notSupported( );

			if ( typeof MessageChannel === 'undefined' )
				// Unsupported browser, the chrome hack would throw
				return notSupported( );

			// Test for google extension support
			googleU2fApi.isSupported( function( ok )
			{
				if ( ok )
					resolve( { u2f: googleU2fApi, native: false } );
				else
					notSupported( );
			} );
		} );

	return _backend;
}

function API( Promise )
{
	return {
		isSupported   : isSupported.bind( Promise ),
		ensureSupport : ensureSupport.bind( Promise ),
		register      : register.bind( Promise ),
		sign          : sign.bind( Promise ),
		ErrorCodes    : API.ErrorCodes,
		ErrorNames    : API.ErrorNames
	};
}

API.ErrorCodes = {
	CANCELLED: -1,
	OK: 0,
	OTHER_ERROR: 1,
	BAD_REQUEST: 2,
	CONFIGURATION_UNSUPPORTED: 3,
	DEVICE_INELIGIBLE: 4,
	TIMEOUT: 5
};
API.ErrorNames = {
	"-1": "CANCELLED",
	"0": "OK",
	"1": "OTHER_ERROR",
	"2": "BAD_REQUEST",
	"3": "CONFIGURATION_UNSUPPORTED",
	"4": "DEVICE_INELIGIBLE",
	"5": "TIMEOUT"
};

function makeError( msg, err )
{
	var code = err != null ? err.errorCode : 1; // Default to OTHER_ERROR
	var type = API.ErrorNames[ '' + code ];
	var error = new Error( msg );
	error.metaData = {
		type: type,
		code: code
	};
	return error;
}

function deferPromise( Promise, promise )
{
	var ret = { };
	ret.promise = new Promise( function( resolve, reject ) {
		ret.resolve = resolve;
		ret.reject = reject;
		promise.then( resolve, reject );
	} );
	/**
	 * Reject request promise and disconnect port if 'disconnect' flag is true
	 * @param {string} msg
	 * @param {boolean} disconnect
	 */
	ret.promise.cancel = function( msg, disconnect )
	{
		getBackend( Promise )
		.then( function( backend )
		{
			if ( disconnect && !backend.native )
				backend.u2f.disconnect( );

			ret.reject( makeError( msg, { errorCode: -1 } ) );
		} );
	};
	return ret;
}

function defer$1( Promise, fun )
{
	return deferPromise( Promise, new Promise( function( resolve, reject )
	{
		try
		{
			fun && fun( resolve, reject );
		}
		catch ( err )
		{
			reject( err );
		}
	} ) );
}

function isSupported( )
{
	var Promise = this;

	return getBackend( Promise )
	.then( function( backend )
	{
		return !!backend.u2f;
	} );
}

function _ensureSupport( backend )
{
	if ( !backend.u2f )
	{
		if ( location.protocol === 'http:' )
			throw new Error( "U2F isn't supported over http, only https" );
		throw new Error( "U2F not supported" );
	}
}

function ensureSupport( )
{
	var Promise = this;

	return getBackend( Promise )
	.then( _ensureSupport );
}

function register( registerRequests, signRequests /* = null */, timeout )
{
	var Promise = this;

	if ( !Array.isArray( registerRequests ) )
		registerRequests = [ registerRequests ];

	if ( typeof signRequests === 'number' && typeof timeout === 'undefined' )
	{
		timeout = signRequests;
		signRequests = null;
	}

	if ( !signRequests )
		signRequests = [ ];

	return deferPromise( Promise, getBackend( Promise )
	.then( function( backend )
	{
		_ensureSupport( backend );

		var native = backend.native;
		var u2f = backend.u2f;

		return new Promise( function( resolve, reject )
		{
			function cbNative( response )
			{
				if ( response.errorCode )
					reject( makeError( "Registration failed", response ) );
				else
				{
					delete response.errorCode;
					resolve( response );
				}
			}

			function cbChrome( err, response )
			{
				if ( err )
					reject( err );
				else if ( response.errorCode )
					reject( makeError( "Registration failed", response ) );
				else
					resolve( response );
			}

			if ( native )
			{
				var appId = registerRequests[ 0 ].appId;

				u2f.register(
					appId, registerRequests, signRequests, cbNative, timeout );
			}
			else
			{
				u2f.register(
					registerRequests, signRequests, cbChrome, timeout );
			}
		} );
	} ) ).promise;
}

function sign( signRequests, timeout )
{
	var Promise = this;

	if ( !Array.isArray( signRequests ) )
		signRequests = [ signRequests ];

	return deferPromise( Promise, getBackend( Promise )
	.then( function( backend )
	{
		_ensureSupport( backend );

		var native = backend.native;
		var u2f = backend.u2f;

		return new Promise( function( resolve, reject )
		{
			function cbNative( response )
			{
				if ( response.errorCode )
					reject( makeError( "Sign failed", response ) );
				else
				{
					delete response.errorCode;
					resolve( response );
				}
			}

			function cbChrome( err, response )
			{
				if ( err )
					reject( err );
				else if ( response.errorCode )
					reject( makeError( "Sign failed", response ) );
				else
					resolve( response );
			}

			if ( native )
			{
				var appId = signRequests[ 0 ].appId;
				var challenge = signRequests[ 0 ].challenge;

				u2f.sign( appId, challenge, signRequests, cbNative, timeout );
			}
			else
			{
				u2f.sign( signRequests, cbChrome, timeout );
			}
		} );
	} ) ).promise;
}

function makeDefault( func )
{
	API[ func ] = function( )
	{
		if ( !commonjsGlobal.Promise )
			// This is very unlikely to ever happen, since browsers
			// supporting U2F will most likely support Promises.
			throw new Error( "The platform doesn't natively support promises" );

		var args = [ ].slice.call( arguments );
		return API( commonjsGlobal.Promise )[ func ].apply( null, args );
	};
}

// Provide default functions using the built-in Promise if available.
makeDefault( 'isSupported' );
makeDefault( 'ensureSupport' );
makeDefault( 'register' );
makeDefault( 'sign' );

'use strict';
var u2fApi$1 = u2fApi;
var u2fApi_1 = u2fApi$1.isSupported;
var u2fApi_2 = u2fApi$1.sign;

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}
var events = EventEmitter;
var once_1 = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}
events.once = once_1;

/**
 */

/**
 * Transport defines the generic interface to share between node/u2f impl
 * A **Descriptor** is a parametric type that is up to be determined for the implementation.
 * it can be for instance an ID, an file path, a URL,...
 */
class Transport {
  constructor() {
    this.exchangeTimeout = 30000;
    this._events = new events();

    this.send = async (cla, ins, p1, p2, data = Buffer.alloc(0), statusList = [StatusCodes.OK]) => {
      if (data.length >= 256) {
        throw new TransportError("data.length exceed 256 bytes limit. Got: " + data.length, "DataLengthTooBig");
      }

      const response = await this.exchange(Buffer.concat([Buffer.from([cla, ins, p1, p2]), Buffer.from([data.length]), data]));
      const sw = response.readUInt16BE(response.length - 2);

      if (!statusList.some(s => s === sw)) {
        throw new TransportStatusError(sw);
      }

      return response;
    };

    this.exchangeBusyPromise = void 0;

    this.exchangeAtomicImpl = async f => {
      if (this.exchangeBusyPromise) {
        throw new TransportError("Transport race condition", "RaceCondition");
      }

      let resolveBusy;
      const busyPromise = new Promise(r => {
        resolveBusy = r;
      });
      this.exchangeBusyPromise = busyPromise;

      try {
        const res = await f();
        return res;
      } finally {
        if (resolveBusy) resolveBusy();
        this.exchangeBusyPromise = null;
      }
    };

    this._appAPIlock = null;
  }

  /**
   * low level api to communicate with the device
   * This method is for implementations to implement but should not be directly called.
   * Instead, the recommanded way is to use send() method
   * @param apdu the data to send
   * @return a Promise of response data
   */
  exchange(_apdu) {
    throw new Error("exchange not implemented");
  }
  /**
   * set the "scramble key" for the next exchanges with the device.
   * Each App can have a different scramble key and they internally will set it at instanciation.
   * @param key the scramble key
   */


  setScrambleKey(_key) {}
  /**
   * close the exchange with the device.
   * @return a Promise that ends when the transport is closed.
   */


  close() {
    return Promise.resolve();
  }

  /**
   * Listen to an event on an instance of transport.
   * Transport implementation can have specific events. Here is the common events:
   * * `"disconnect"` : triggered if Transport is disconnected
   */
  on(eventName, cb) {
    this._events.on(eventName, cb);
  }
  /**
   * Stop listening to an event on an instance of transport.
   */


  off(eventName, cb) {
    this._events.removeListener(eventName, cb);
  }

  emit(event, ...args) {
    this._events.emit(event, ...args);
  }
  /**
   * Enable or not logs of the binary exchange
   */


  setDebugMode() {
    console.warn("setDebugMode is deprecated. use @ledgerhq/logs instead. No logs are emitted in this anymore.");
  }
  /**
   * Set a timeout (in milliseconds) for the exchange call. Only some transport might implement it. (e.g. U2F)
   */


  setExchangeTimeout(exchangeTimeout) {
    this.exchangeTimeout = exchangeTimeout;
  }
  /**
   * wrapper on top of exchange to simplify work of the implementation.
   * @param cla
   * @param ins
   * @param p1
   * @param p2
   * @param data
   * @param statusList is a list of accepted status code (shorts). [0x9000] by default
   * @return a Promise of response buffer
   */


  /**
   * create() allows to open the first descriptor available or
   * throw if there is none or if timeout is reached.
   * This is a light helper, alternative to using listen() and open() (that you may need for any more advanced usecase)
   * @example
  TransportFoo.create().then(transport => ...)
   */
  static create(openTimeout = 3000, listenTimeout) {
    return new Promise((resolve, reject) => {
      let found = false;
      const sub = this.listen({
        next: e => {
          found = true;
          if (sub) sub.unsubscribe();
          if (listenTimeoutId) clearTimeout(listenTimeoutId);
          this.open(e.descriptor, openTimeout).then(resolve, reject);
        },
        error: e => {
          if (listenTimeoutId) clearTimeout(listenTimeoutId);
          reject(e);
        },
        complete: () => {
          if (listenTimeoutId) clearTimeout(listenTimeoutId);

          if (!found) {
            reject(new TransportError(this.ErrorMessage_NoDeviceFound, "NoDeviceFound"));
          }
        }
      });
      const listenTimeoutId = listenTimeout ? setTimeout(() => {
        sub.unsubscribe();
        reject(new TransportError(this.ErrorMessage_ListenTimeout, "ListenTimeout"));
      }, listenTimeout) : null;
    });
  }

  decorateAppAPIMethods(self, methods, scrambleKey) {
    for (let methodName of methods) {
      self[methodName] = this.decorateAppAPIMethod(methodName, self[methodName], self, scrambleKey);
    }
  }

  decorateAppAPIMethod(methodName, f, ctx, scrambleKey) {
    return async (...args) => {
      const {
        _appAPIlock
      } = this;

      if (_appAPIlock) {
        return Promise.reject(new TransportError("Ledger Device is busy (lock " + _appAPIlock + ")", "TransportLocked"));
      }

      try {
        this._appAPIlock = methodName;
        this.setScrambleKey(scrambleKey);
        return await f.apply(ctx, args);
      } finally {
        this._appAPIlock = null;
      }
    };
  }

}
Transport.isSupported = void 0;
Transport.list = void 0;
Transport.listen = void 0;
Transport.open = void 0;
Transport.ErrorMessage_ListenTimeout = "No Ledger device found (timeout)";
Transport.ErrorMessage_NoDeviceFound = "No Ledger device found";

/**
 * A Log object
 */
let id = 0;
const subscribers = [];
/**
 * log something
 * @param type a namespaced identifier of the log (it is not a level like "debug", "error" but more like "apdu-in", "apdu-out", etc...)
 * @param message a clear message of the log associated to the type
 */

const log = (type, message, data) => {
  const obj = {
    type,
    id: String(++id),
    date: new Date()
  };
  if (message) obj.message = message;
  if (data) obj.data = data;
  dispatch(obj);
};
/**
 * listen to logs.
 * @param cb that is called for each future log() with the Log object
 * @return a function that can be called to unsubscribe the listener
 */

const listen = cb => {
  subscribers.push(cb);
  return () => {
    const i = subscribers.indexOf(cb);

    if (i !== -1) {
      // equivalent of subscribers.splice(i, 1) // https://twitter.com/Rich_Harris/status/1125850391155965952
      subscribers[i] = subscribers[subscribers.length - 1];
      subscribers.pop();
    }
  };
};

function dispatch(log) {
  for (let i = 0; i < subscribers.length; i++) {
    try {
      subscribers[i](log);
    } catch (e) {
      console.error(e);
    }
  }
} // for debug purpose


if (typeof window !== "undefined") {
  window.__ledgerLogsListen = listen;
}

function wrapU2FTransportError(originalError, message, id) {
  const err = new TransportError(message, id); // $FlowFixMe

  err.originalError = originalError;
  return err;
}

function wrapApdu(apdu, key) {
  const result = Buffer.alloc(apdu.length);

  for (let i = 0; i < apdu.length; i++) {
    result[i] = apdu[i] ^ key[i % key.length];
  }

  return result;
} // Convert from normal to web-safe, strip trailing "="s


const webSafe64 = base64 => base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // Convert from web-safe to normal, add trailing "="s


const normal64 = base64 => base64.replace(/-/g, "+").replace(/_/g, "/") + "==".substring(0, 3 * base64.length % 4);

function attemptExchange(apdu, timeoutMillis, scrambleKey, unwrap) {
  const keyHandle = wrapApdu(apdu, scrambleKey);
  const challenge = Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex");
  const signRequest = {
    version: "U2F_V2",
    keyHandle: webSafe64(keyHandle.toString("base64")),
    challenge: webSafe64(challenge.toString("base64")),
    appId: location.origin
  };
  log("apdu", "=> " + apdu.toString("hex"));
  return u2fApi_2(signRequest, timeoutMillis / 1000).then(response => {
    const {
      signatureData
    } = response;

    if (typeof signatureData === "string") {
      const data = Buffer.from(normal64(signatureData), "base64");
      let result;

      if (!unwrap) {
        result = data;
      } else {
        result = data.slice(5);
      }

      log("apdu", "<= " + result.toString("hex"));
      return result;
    } else {
      throw response;
    }
  });
}

let transportInstances = [];

function emitDisconnect() {
  transportInstances.forEach(t => t.emit("disconnect"));
  transportInstances = [];
}

function isTimeoutU2FError(u2fError) {
  return u2fError.metaData.code === 5;
}
/**
 * U2F web Transport implementation
 * @example
 * import TransportU2F from "@ledgerhq/hw-transport-u2f";
 * ...
 * TransportU2F.create().then(transport => ...)
 */


class TransportU2F extends Transport {
  /*
   */

  /*
   */

  /**
   * static function to create a new Transport from a connected Ledger device discoverable via U2F (browser support)
   */
  static async open(_, _openTimeout = 5000) {
    return new TransportU2F();
  }

  constructor() {
    super();
    this.scrambleKey = void 0;
    this.unwrap = true;
    transportInstances.push(this);
  }
  /**
   * Exchange with the device using APDU protocol.
   * @param apdu
   * @returns a promise of apdu response
   */


  async exchange(apdu) {
    try {
      return await attemptExchange(apdu, this.exchangeTimeout, this.scrambleKey, this.unwrap);
    } catch (e) {
      const isU2FError = typeof e.metaData === "object";

      if (isU2FError) {
        if (isTimeoutU2FError(e)) {
          emitDisconnect();
        } // the wrapping make error more usable and "printable" to the end user.


        throw wrapU2FTransportError(e, "Failed to sign with Ledger device: U2F " + e.metaData.type, "U2F_" + e.metaData.code);
      } else {
        throw e;
      }
    }
  }
  /**
   */


  setScrambleKey(scrambleKey) {
    this.scrambleKey = Buffer.from(scrambleKey, "ascii");
  }
  /**
   */


  setUnwrap(unwrap) {
    this.unwrap = unwrap;
  }

  close() {
    // u2f have no way to clean things up
    return Promise.resolve();
  }

}
TransportU2F.isSupported = u2fApi_1;

TransportU2F.list = () => // this transport is not discoverable but we are going to guess if it is here with isSupported()
u2fApi_1().then(supported => supported ? [null] : []);

TransportU2F.listen = observer => {
  let unsubscribed = false;
  u2fApi_1().then(supported => {
    if (unsubscribed) return;

    if (supported) {
      observer.next({
        type: "add",
        descriptor: null
      });
      observer.complete();
    } else {
      observer.error(new TransportError("U2F browser support is needed for Ledger. " + "Please use Chrome, Opera or Firefox with a U2F extension. " + "Also make sure you're on an HTTPS connection", "U2FNotSupported"));
    }
  });
  return {
    unsubscribe: () => {
      unsubscribed = true;
    }
  };
};

"use strict";
const transports = {
    "u2f": TransportU2F,
    "default": TransportU2F
};

"use strict";
var __awaiter = (window && window.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger = new ethers.utils.Logger(version);
const defaultPath = "m/44'/60'/0'/0/0";
function waiter(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}
class LedgerSigner extends ethers.Signer {
    constructor(provider, type, path) {
        super();
        if (path == null) {
            path = defaultPath;
        }
        if (type == null) {
            type = "default";
        }
        ethers.utils.defineReadOnly(this, "path", path);
        ethers.utils.defineReadOnly(this, "type", type);
        ethers.utils.defineReadOnly(this, "provider", provider || null);
        const transport = transports[type];
        if (!transport) {
            logger.throwArgumentError("unknown or unsupported type", "type", type);
        }
        ethers.utils.defineReadOnly(this, "_eth", transport.create().then((transport) => {
            const eth = new Eth(transport);
            return eth.getAppConfiguration().then((config) => {
                return eth;
            }, (error) => {
                return Promise.reject(error);
            });
        }, (error) => {
            return Promise.reject(error);
        }));
    }
    _retry(callback, timeout) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (timeout && timeout > 0) {
                setTimeout(() => { reject(new Error("timeout")); }, timeout);
            }
            const eth = yield this._eth;
            // Wait up to 5 seconds
            for (let i = 0; i < 50; i++) {
                try {
                    const result = yield callback(eth);
                    return resolve(result);
                }
                catch (error) {
                    if (error.id !== "TransportLocked") {
                        return reject(error);
                    }
                }
                yield waiter(100);
            }
            return reject(new Error("timeout"));
        }));
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this._retry((eth) => eth.getAddress(this.path));
            return ethers.utils.getAddress(account.address);
        });
    }
    signMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof (message) === 'string') {
                message = ethers.utils.toUtf8Bytes(message);
            }
            const messageHex = ethers.utils.hexlify(message).substring(2);
            const sig = yield this._retry((eth) => eth.signPersonalMessage(this.path, messageHex));
            sig.r = '0x' + sig.r;
            sig.s = '0x' + sig.s;
            return ethers.utils.joinSignature(sig);
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = transaction = yield ethers.utils.resolveProperties(transaction);
            const unsignedTx = ethers.utils.serializeTransaction(tx).substring(2);
            const sig = yield this._retry((eth) => eth.signTransaction(this.path, unsignedTx));
            return ethers.utils.serializeTransaction(tx, {
                v: sig.v,
                r: ("0x" + sig.r),
                s: ("0x" + sig.s),
            });
        });
    }
    connect(provider) {
        return new LedgerSigner(provider, this.type, this.path);
    }
}

"use strict";

export { LedgerSigner };
