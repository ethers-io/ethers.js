---
description: A Provider in hethers is a read-only abstraction to access the hashgraph data.
---

# Provider

{% hint style="info" %}
The hethers library creates a strong division between the operation a **Provider** can perform and those of a [Signer](../../signers.md#signer).

This separation of concerns and a strict subset of Provider operations allows for a larger variety of backends, a more consistent API and ensures other libraries to operate without being able to rely on any underlying assumption.
{% endhint %}

