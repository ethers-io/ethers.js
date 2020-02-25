-----

Documentation: [html](https://docs-beta.ethers.io/)

-----

Hacking
=======


Things to keep in mind:


### Supported Platforms


...


### Dependencies


Adding a dependency is non-trivial and will require fairly convincing
arguments.

Further, **ALL** dependencies for ethers, **must** be MIT licensed or
public domain (CC0).

All contributions to ethers are then included under the MIT license.


### Printable ASCII (7-bit) Characters


All source and documentation files should ONLY use the printable ASCII
set.

This is for several reasons, bu...



* Transmission over certain HTTP servers and proxies can mangle UTF-8 data
* Certain editors on some platforms, or in certain terminals cannot handle UTF-8 characters elegantly
* The ability to enter non-ASCII characters on some platforms require special keyboards, input devices or input methods to be installed, which either not be supported, or may require administrative priviledges.


### License


MIT...


### Other Considerations


A common argument to Pull Requests is that they are simple, backwards compatible
and

It is important to remember that a small change is something that
we are required to support in perpetuity.

For example, adding support for an obscure platform, such as adding a dot-file
to the root of the package, now carries the implication that we will continue
keeping that dot-file up-to-date as new versions of that platform are released.



-----
**Content Hash:** f57a28af18b23637056db38ed6a6d081daf52dccb227dd23f73e161dd7894517