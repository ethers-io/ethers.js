# Wordlists

{% hint style="info" %}
The **Wordlist** utilities are directly imported from [The Ethers Project](https://github.com/ethers-io/ethers.js/). The complete documentation can be found in the official [ethers docs](https://docs.ethers.io/v5/api/utils/wordlists/).
{% endhint %}

## Wordlist

#### `wordlist.locale ⇒ string`

The locale for this wordlist

#### `wordlist.getWord( index ) ⇒ string`

Returns the word at _index_.

#### `wordlist.getWordIndex( word ) ⇒ number`

Returns the index of _word_ within the wordlist.

#### `wordlist.split( mnemonic ) ⇒ Array<string>`

Returns the mnemonic split into each individual word, according to a locale's valid whitespace character set.

#### `wordlist.join( words ) ⇒ string`

Returns the mnemonic by joining _words_ together using the whitespace that is standard for the locale.

#### `Wordlist.check( wordlists ) ⇒ string<`[`DataHexString`](byte-manipulation.md#datahexstring)`<32>>`

Checks that all words map both directions correctly and return the hash of the lists. Sub-classes should use this to validate the wordlist is correct against the official wordlist hash.

#### `Wordlist.register( wordlist [ , name ] ) ⇒ void`

Register a wordlist with the list of wordlists, optionally overriding the registered _name_.

### Languages

The [official wordlists](https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md) available at \`hethers.wordlists\`. In the browser, only the english language is available by default; to include the others (which increases the size of the library), see the dist files in the \`hethers\` package.

#### `hethers.wordlists.cz ⇒ Wordlist`

The Czech Wordlist.

#### `hethers.wordlists.en ⇒ Wordlist`

The English Wordlist.

#### `hethers.wordlists.es ⇒ Wordlist`

The Spanish Wordlist.

#### `hethers.wordlists.fr ⇒ Wordlist`

The French Wordlist.

#### `hethers.wordlists.it ⇒ Wordlist`

The Italian Wordlist.

#### `hethers.wordlists.ja ⇒ Wordlist`

The Japanese Wordlist.

#### `hethers.wordlists.ko ⇒ Wordlist`

The Korean Wordlist.

#### `hethers.wordlists.zh_cn ⇒ Wordlist`

The Simplified Chinese Wordlist.

#### `hethers.wordlists.zh_tw ⇒ Wordlist`

The Traditional Chinese Wordlist.
