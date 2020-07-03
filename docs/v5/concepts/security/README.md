-----

Documentation: [html](https://docs.ethers.io/)

-----

Security
========

Key Derivation Functions
------------------------

### Why does it take so long?

### Mitigating the User Experience

### Work-Arounds (not recommended)

```javascript
// Our wallet object
const wallet = Wallet.createRandom();

// The password to encrypt with
const password = "password123";

// WARNING: Doing this substantially reduces the security
//          of the wallet. This is highly NOT recommended.

// We override the default scrypt.N value, which is used
// to indicate the difficulty to crack this wallet.
const json = wallet.encrypt(password, {
  scrypt: {
    // The number must be a power of 2 (default: 131072)
    N: 64
  }
});
```

