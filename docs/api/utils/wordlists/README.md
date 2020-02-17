-----

Documentation: [html](https://docs-beta.ethers.io/)

-----


Wordlists
=========



Wordlist
--------



#### *wordlist* . **locale** **=>** *string*

The locale for this wordlist.




#### *wordlist* . **getWord** ( index )  **=>** *string*

Returns the word at *index*.




#### *wordlist* . **getWordIndex** ( word )  **=>** *number*

Returns the index of *word* within the wordlist.




#### *wordlist* . **split** ( mnemonic )  **=>** *Array< string >*

Returns the mnemonic split into each individual word, according to a
locale's valid whitespace character set.




#### *wordlist* . **join** ( words )  **=>** *string*

Returns the mnemonic by joining *words* together using the
whitespace that is standard for the locale.




#### *Wordlist* . **check** ( wordlists )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Checks that all words map both directions correctly and return the
hash of the lists. Sub-classes should use this to validate the wordlist
is correct against the official wordlist hash.




#### *Wordlist* . **register** ( wordlist [  , name ]  )  **=>** *string< [DataHexstring](../bytes)< 32 > >*

Register a wordlist with the list of wordlists, optionally overriding
the registered *name*.




Languages
---------



#### *ethers* . *wordlists* . **cz** **=>** *Wordlist*

The Czech [Wordlist](./).




#### *ethers* . *wordlists* . **en** **=>** *Wordlist*

The English [Wordlist](./).




#### *ethers* . *wordlists* . **es** **=>** *Wordlist*

The Spanish [Wordlist](./).




#### *ethers* . *wordlists* . **fr** **=>** *Wordlist*

The French [Wordlist](./).




#### *ethers* . *wordlists* . **it** **=>** *Wordlist*

The Italian [Wordlist](./).




#### *ethers* . *wordlists* . **js** **=>** *Wordlist*

The Japanese [Wordlist](./).




#### *ethers* . *wordlists* . **ko** **=>** *Wordlist*

The Korean [Wordlist](./).




#### *ethers* . *wordlists* . **zh_cn** **=>** *Wordlist*

The Simplified Chinese [Wordlist](./).




#### *ethers* . *wordlists* . **zh_tw** **=>** *Wordlist*

The Traditional Chinese [Wordlist](./).





-----
**Content Hash:** de4a1b1a39943d23744fb0cdc9b489e08eb83a52f94da8bec0cbc3b91aae5a17