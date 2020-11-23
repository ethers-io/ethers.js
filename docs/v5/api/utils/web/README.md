-----

Documentation: [html](https://docs.ethers.io/)

-----

Web Utilities
=============

#### *ethers* . *utils* . **fetchJson**( urlOrConnectionInfo [ , json [ , processFunc ] ] ) => *Promise< any >*

Fetch and parse the JSON content from *urlOrConnectionInfo*, with the optional body *json* and optionally processing the result with *processFun* before returning it.


#### *ethers* . *utils* . **poll**( pollFunc [ , options ] ) => *Promise< any >*

Repeatedly call pollFunc using the [PollOptions](/v5/api/utils/web/#PollOptions) until it returns a value other than undefined.


### ConnectionInfo

#### *connection* . **url** => *string*

The URL to connect to.


#### *connection* . **user** => *string*

The username to use for [Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication). The default is null (i.e. do not use basic authentication)


#### *connection* . **password** => *string*

The password to use for [Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication). The default is null (i.e. do not use basic authentication)


#### *connection* . **allowInsecureAuthentication** => *boolean*

Allow [Basic Authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) over non-secure HTTP. The default is false.


#### *connection* . **timeout** => *number*

How long to wait before rejecting with a *timeout* error.


#### *connection* . **headers** => *{[key:string]:string}*

Additional headers to include in the connection.


### PollOptions

#### *options* . **timeout** => *number*

The amount of time allowed to elapse before triggering a timeout error.


#### *options* . **floor** => *number*

The minimum time limit to allow for [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff).

The default is 0s.


#### *options* . **ceiling** => *number*

The maximum time limit to allow for [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff).

The default is 10s.


#### *options* . **interval** => *number*

The interval used during [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff) calculation.

The default is 250ms.


#### *options* . **retryLimit** => *number*

The number of times to retry in the event of an error or *undefined* is returned.


#### *options* . **onceBlock** => *[Provider](/v5/api/providers/provider/)*

If this is specified, the polling will wait on new blocks from *provider* before attempting the *pollFunc* again.


#### *options* . **oncePoll** => *[Provider](/v5/api/providers/provider/)*

If this is specified, the polling will occur on each poll cycle of *provider* before attempting the *pollFunc* again.


