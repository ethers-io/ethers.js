# Web Utilities

#### `hethers.utils.fetchJson( urlOrConnectionInfo [ , json [ , processFunc ] ] ) ⇒ Promise<any>`

Fetch and parse the JSON content from _urlOrConnectionInfo_, with the optional body _json_ and optionally processing the result with _processFun_ before returning it.

#### `hethers.utils.poll( pollFunc [ , options ] ) ⇒ Promise<any>`

Repeatedly call pollFunc using the [PollOptions](web-utilities.md#polloptions) until it returns a value other than undefined.

## ConnectionInfo

#### `connection.url ⇒ string`

The URL to connect to.

#### `connection.user ⇒ string`

The username to use for [Basic Authentication](https://en.wikipedia.org/wiki/Basic\_access\_authentication). The default is null (i.e. do not use basic authentication)

#### `connection.password ⇒ string`

The password to use for [Basic Authentication](https://en.wikipedia.org/wiki/Basic\_access\_authentication). The default is null (i.e. do not use basic authentication)

#### `connection.allowInsecureAuthentication ⇒ boolean`

Allow [Basic Authentication](https://en.wikipedia.org/wiki/Basic\_access\_authentication) over non-secure HTTP. The default is false.

#### `connection.timeout ⇒ number`

How long to wait before rejecting with a _timeout_ error.

#### `connection.headers ⇒ {[key:string]:string}`

Additional headers to include in the connection.

## PollOptions

#### `options.timeout ⇒ number`

The amount of time allowed to elapse before triggering a timeout error.

#### `options.floor ⇒ number`

The minimum time limit to allow for [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential\_backoff).

The default is 0s.

#### `options.ceiling ⇒ number`

The maximum time limit to allow for [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential\_backoff).

The default is 10s.

#### `options.interval ⇒ number`

The interval used during [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential\_backoff) calculation.

The default is 250ms.

#### `options.retryLimit ⇒ number`

The number of times to retry in the event of an error or _undefined_ is returned.

#### `options.onceBlock ⇒` [`Provider`](../providers/provider/)``

If this is specified, the polling will wait on new blocks from _provider_ before attempting the _pollFunc_ again.

#### `options.oncePoll ⇒` [`Provider`](../providers/provider/)``

If this is specified, the polling will occur on each poll cycle of _provider_ before attempting the _pollFunc_ again.
