---
description: Inherits Provider.
---

# Base Provider

Most Providers available in hethers are sub-classes of **BaseProvider**, which simplifies sub-classes, as it handles much of the event operations, such as polling and formatting.

#### provider.polling ⇒ boolean

&#x20;   Indicates if the Provider is currently polling. If there are no events to poll for or polling has been explicitly disabled, this will be false.

#### provider.pollingInterval ⇒ number

&#x20;   The frequency at which the provider polls.
