React Native
************

The React Native environment has a lot of little quirks, so this
documentation is aimed at helping smooth those over.

Please feel free to create issues on GitHub for recommendations and
additions to this document.

-----

Shims
=====

There are several pieces of functionality missing from the current version
of React-Native. Here is a list of functionality the ``ethers/dist/shims`` will
provide if unavailable:

    - ``ArrayBuffer.isView``
    - ``atob`` and ``btoa``
    - ``nextTick``
    - ``Promise``
    - ``String.prototype.normalize``

.. code-block:: javascript
    :caption: *Importing into React-Native*

    // Import the required shims
    import 'ethers/dist/shims.js';

    // Import the ethers library
    import { ethers } from 'ethers';

**Note**
    This file **must** be minified, since the React-Native ``require``
    seems to hijack the variable name ``require``, even when encapsulated
    inside a closure. The minification process replaces the ``require``
    with a mangled name, so that there is no collision. This is hacky
    and in the future a better method would be preferred. Suggestions?

**Note**
    As we find additional features not generally available, they will
    be added to this shim file. It is targetted toward platforms where
    build-size is not critical, so functionality is favored over keeping
    the size small.

-----

Wordlists
=========

React-Native will pull in the browser version of ethers, which does not have
all the additional word lists, by default. Each desired wordlist must be
separately imported.

.. code-block:: javascript
    :caption: *Importing languages into React-Native*

    import {
        es,     // Spanish
        fr,     // French
        it,     // Italian
        ja,     // Japanese
        ko,     // Korean
        zh_ch,  // Chinese (simplified)
        zh_tw   // Chinese (tranditional)
    } from 'ethers/wordlists';

-----

Other Notes
===========

**console.log**
    The use of ``console.log`` in React Native `can substantially impact performance`_.
    For this reason, you may wish to reduce the log level to not show info and warnings.

.. code-block:: javascript
    :caption: *Change Log Level*

    // The default is "info"; other options
    // "debug", "info", "warn", "error", "off"
    ethers.errors.setLogLevel("error");

-----

TODO: Include instructions on installing crypto performance

- scrypt (it is VERY slow in React Native; too slow to be functional)

.. _can substantially impact performance: https://docs.expo.io/versions/latest/react-native/performance/#using-consolelog-statements

.. EOF
