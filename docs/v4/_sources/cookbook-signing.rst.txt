Signing Messages
****************

Signing messages can be used for various method of authentication and off-chain
operations, which can be put on-chain if necessary.

-----

Signing a String Message
========================

By allowing a user to sign a string, which can be verified on-chain, interesting
forms of authentication on-chain can be achieved. This is a quick example of how
an arbitrary string can be signed by a private key, and verified on-chain. The
Contract can be called by another Contract, for example, before unlocking
functionality by the caller.

.. code-block:: javascript
    :caption: *Solidity Contract*

    contract Verifier {
        // Returns the address that signed a given string message
        function verifyString(string message, uint8 v, bytes32 r,
                     bytes32 s) public pure returns (address signer) {

            // The message header; we will fill in the length next
            string memory header = "\x19Ethereum Signed Message:\n000000";

            uint256 lengthOffset;
            uint256 length;
            assembly {
                // The first word of a string is its length
                length := mload(message)
                // The beginning of the base-10 message length in the prefix
                lengthOffset := add(header, 57)
            }

            // Maximum length we support
            require(length <= 999999);

            // The length of the message's length in base-10
            uint256 lengthLength = 0;

            // The divisor to get the next left-most message length digit
            uint256 divisor = 100000;

            // Move one digit of the message length to the right at a time
            while (divisor != 0) {

                // The place value at the divisor
                uint256 digit = length / divisor;
                if (digit == 0) {
                    // Skip leading zeros
                    if (lengthLength == 0) {
                        divisor /= 10;
                        continue;
                    }
                }

                // Found a non-zero digit or non-leading zero digit
                lengthLength++;

                // Remove this digit from the message length's current value
                length -= digit * divisor;

                // Shift our base-10 divisor over
                divisor /= 10;

                // Convert the digit to its ASCII representation (man ascii)
                digit += 0x30;
                // Move to the next character and write the digit
                lengthOffset++;

                assembly {
                    mstore8(lengthOffset, digit)
                }
            }

            // The null string requires exactly 1 zero (unskip 1 leading 0)
            if (lengthLength == 0) {
                lengthLength = 1 + 0x19 + 1;
            } else {
                lengthLength += 1 + 0x19;
            }

            // Truncate the tailing zeros from the header
            assembly {
                mstore(header, lengthLength)
            }

            // Perform the elliptic curve recover operation
            bytes32 check = keccak256(header, message);

            return ecrecover(check, v, r, s);
        }
    }

.. code-block:: javascript
    :caption: *JavaScript*

    let abi = [
        "function verifyString(string, uint8, bytes32, bytes32) public pure returns (address)"
    ];

    let provider = ethers.getDefaultProvider('ropsten');

    // Create a wallet to sign the message with
    let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    let wallet = new ethers.Wallet(privateKey);

    console.log(wallet.address);
    // "0x14791697260E4c9A71f18484C9f997B308e59325"

    let contractAddress = '0x80F85dA065115F576F1fbe5E14285dA51ea39260';
    let contract = new Contract(contractAddress, abi, provider);

    let message = "Hello World";

    // Sign the string message
    let flatSig = await wallet.signMessage(message);

    // For Solidity, we need the expanded-format of a signature
    let sig = ethers.utils.splitSignature(flatSig);

    // Call the verifyString function
    let recovered = await contract.verifyString(message, sig.v, sig.r, sig.s);

    console.log(recovered);
    // "0x14791697260E4c9A71f18484C9f997B308e59325"

-----

Signing a Digest Hash
=====================

Signing a digest can be far more space efficient than signing an arbitrary
string (as you probably notice when comparing the length of the Solidity
source code), however, with this method, many Wallet UI would not be able to
fully inform the user what they are about to sign, so this method should only
be used in quite specific cases, such as in custom Wallet applications.

.. code-block:: javascript
    :caption: *Solidity Contract*

    contract Verifier {
        function verifyHash(bytes32 hash, uint8 v, bytes32 r, bytes32 s) public pure
                     returns (address signer) {

            bytes32 messageDigest = keccak256("\x19Ethereum Signed Message:\n32", hash);

            return ecrecover(messageDigest, v, r, s);
        }
    }

.. code-block:: javascript
    :caption: *JavaScript*

    let abi = [
        "function verifyHash(bytes32, uint8, bytes32, bytes32) public pure returns (address)"
    ];

    let provider = ethers.getDefaultProvider('ropsten');

    // Create a wallet to sign the hash with
    let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    let wallet = new ethers.Wallet(privateKey);

    console.log(wallet.address);
    // "0x14791697260E4c9A71f18484C9f997B308e59325"

    let contractAddress = '0x80F85dA065115F576F1fbe5E14285dA51ea39260';
    let contract = new ethers.Contract(contractAddress, abi, provider);

    // The hash we wish to sign and verify
    let messageHash = ethers.utils.id("Hello World");

    // Note: messageHash is a string, that is 66-bytes long, to sign the
    //       binary value, we must convert it to the 32 byte Array that
    //       the string represents
    //
    // i.e.
    //   // 66-byte string
    //   "0x592fa743889fc7f92ac2a37bb1f5ba1daf2a5c84741ca0e0061d243a2e6707ba"
    //
    //   ... vs ...
    //
    //  // 32 entry Uint8Array
    //  [ 89, 47, 167, 67, 136, 159, 199, 249, 42, 194, 163,
    //    123, 177, 245, 186, 29, 175, 42, 92, 132, 116, 28,
    //    160, 224, 6, 29, 36, 58, 46, 103, 7, 186]

    let messageHashBytes = ethers.utils.arrayify(messageHash)

    // Sign the binary data
    let flatSig = await wallet.signMessage(messageHashBytes);

    // For Solidity, we need the expanded-format of a signature
    let sig = ethers.utils.splitSignature(flatSig);

    // Call the verifyHash function
    let recovered = await contract.verifyHash(messageHash, sig.v, sig.r, sig.s);

    console.log(recovered);
    // "0x14791697260E4c9A71f18484C9f997B308e59325"

-----

.. EOF

