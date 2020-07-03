-----

Documentation: [html](https://docs.ethers.io/)

-----

Making Your Own
===============

CLI
---

#### **addPlugin**( command , pluginClass ) => *void*

Add a *plugin* class for the *command*. After all options and flags have been consumed, the first argument will be consumed and the associated plugin class will be instantiated and run.


#### **setPlugin**( pluginClass ) => *void*

Set a dedicated [Plugin](/v5/cli/plugin/#cli-plugin) class which will handle all input. This may not be used in conjuction with addPlugin and will not automatically accept a command from the arguments.


#### **showUsage**( [ message = "" [ , status = 0 ] ] ) => *never*

Shows the usage help screen for the CLI and terminates.


#### **run**( args ) => *Promise< void >*

Usually the value of *args* passed in will be `process.argv.slice(2)`.


Plugin
------

#### *plugin* . **network** => *[Network](/v5/api/providers/types/#providers-Network)*

The network this plugin is running for.


#### *plugin* . **provider** => *[Provider](/v5/api/providers/provider/)*

The provider for this plugin is running for.


#### *plugin* . **accounts** => *Array< [Signer](/v5/api/signer/#Signer) >*

The accounts passed into the plugin using `--account`, `--account-rpc` and `--account-void` which this plugin can use.


#### *plugin* . **gasLimit** => *[BigNumber](/v5/api/utils/bignumber/)*

The gas limit this plugin should use. This is null if unspecified.


#### *plugin* . **gasPrice** => *[BigNumber](/v5/api/utils/bignumber/)*

The gas price this plugin should use. This is null if unspecified.


#### *plugin* . **nonce** => *number*

The initial nonce for the account this plugin should use.


### Methods

#### *plugin* . **prepareOptions**( argParser [ , verifyOnly = false ] ) => *Promise< void >*



#### *plugin* . **prepareArgs**( args ) => *Promise< void >*



#### *plugin* . **run**( ) => *Promise< void >*



#### *plugin* . **getAddress**( addressOrName [ , message = "" , [ allowZero = false ] ] ) => *Promise< string >*

A plugin should use this method to resolve an address. If the resovled address is the zero address and *allowZero* is not true, an error is raised.


#### *plugin* . **dump**( header , info ) => *void*

Dumps the contents of *info* to the console with a *header* in a nicely formatted style. In the future, plugins may support a JSON output format which will automatically work with this method.


#### *plugin* . **throwUsageError**( [ message = "" ] ) => *never*

Stops exectuion of the plugin and shows the help screen of the plugin with the optional *message*.


#### *plugin* . **throwError**( message ) => *never*

Stops execution of the plugin and shows *message*.


### Static Methods

#### *Plugin* . **getHelp** => *Help*

Each subclass should implement this static method which is used to generate the help screen.


#### *Plugin* . **getOptionHelp** => *Array< Help >*

Each subclass should implement this static method if it supports additional options which is used to generate the help screen.


ArgParser
---------

```
/home/ethers> ethers --account wallet.json --yes send ricmoo.eth 1.0
#  An Option ----------^                     ^   ^
#    - name =  "account"                     |   |
#    - value = "wallet.json"                 |   |
#  A Flag -----------------------------------+   |
#    - name  = "yes"                             |
#    - value = true                              |
#  Arguments ------------------------------------+
#    - count = 3
#    - [ "send", "ricmoo.eth", "1.0" ]
```


Flags are simple binary options (such as the `--yes`), which are true if present otherwise false.

Options require a single parameter follow them on the command line (such as `--account wallet.json`, which nhas the name `account` and the value `wallet.json`)

Arguments are all other values on the command line, and are not accessed through the **ArgParser** directly.

When a CLI is run, an **ArgParser** is used to validate the command line by using prepareOptions, which consumes all flags and options leaving only the arguments behind, which are then passed into prepareArgs.


#### *argParser* . **consumeFlag**( name ) => *boolean*

Remove the flag *name* and return true if it is present.


#### *argParser* . **consumeMultiOptions**( names ) => *Array< {name:string,value:string} >*

Remove all options which match any name in the Array of *names* with their values returning the list (in order) of values.


#### *argParser* . **consumeOption**( name ) => *string*

Remove the option with its value for *name* and return the value. This will throw a UsageError if the option is included multiple times.


#### *argParser* . **consumeOptions**( name ) => *Array< string >*

Remove all options with their values for *name* and return the list (in order) of values.


