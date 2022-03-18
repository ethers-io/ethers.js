# Event Emitter Methods

The EventEmitter API allows applications to use an [Observer Pattern](https://en.wikipedia.org/wiki/Observer\_pattern) to register callbacks for when various events occur.

This closely follows the Event Emitter provided by other JavaScript libraries with the exception that event names support some more complex objects, not only strings. The objects are normalized internally.

#### provider.on( eventName , listener ) ⇒ this

&#x20;   Add a _listener_ to be triggered for each _eventName_ [event](event-emitter-methods.md#events).

#### provider.once( eventName , listener ) ⇒ this

&#x20;   Add a _listener_ to be triggered for only the next _eventName_ [event](event-emitter-methods.md#events), at which time it will be removed.

#### provider.emit( eventName , ...args ) ⇒ boolean

&#x20;   Notify all listeners of the _eventName_ [event](event-emitter-methods.md#events), passing _args_ to each listener. This is generally only used internally.

#### provider.off( eventName \[ , listener ] ) ⇒ this

&#x20;   Remove a _listener_ for the _eventName_ [event](event-emitter-methods.md#events). If no _listener_ is provided, all listeners for _eventName_ are removed.

#### provider.removeAllListeners( \[ eventName ] ) ⇒ this

&#x20;    Remove all the listeners for the _eventName_ [event](event-emitter-methods.md#events). If no _eventName_ is provided, **all** events are removed.

#### provider.listenerCount( \[ eventName ] ) ⇒ number

&#x20;   Returns the number of listeners for the _eventName_ [event](event-emitter-methods.md#events). If no _eventName_ is provided, the total number of listeners is returned.

#### provider.listeners( eventName ) ⇒ Array< Listener >

&#x20;   Returns the list of Listeners for the _eventName_ [event](event-emitter-methods.md#events).

### Events

Any of the following may be used as the _eventName_ in the above methods.

#### **Log Filter**

A filter is an object, representing a contract log Filter, which has the optional properties `accountLike`(the source contract) and `topics` (a topic-set to match).

See [EventFilters](../types.md#eventfilter) for more information on filtering events.

#### **Transaction Filter**

The value of a **Transaction Filter** is any transaction hash.

This event is emitted on every mined transaction. It is much more common that the `once` method is used than the `on` method.

In addition to transaction and filter events, there are several named events.

```typescript
provider.once(transactionId, (transaction) => {
    // Emitted when the transaction has been mined
})


// This filter could also be generated with the Contract or
// Interface API. The address must be specified, if topics is not specified, 
// any log matches.
filter = {
    address: "",
    topics: [
        utils.id("Transfer(address,address,uint256)")
    ]
}

provider.on(filter, (log, event) => {
    // Emitted whenever a DAI token transfer occurs
})

provider.on("pending", (tx) => {
    // Emitted when any new pending transaction is noticed
});


provider.on("error", (tx) => {
    // Emitted when any error occurs
});
```

### Inspection Methods

#### Provider.isProvider( object ) ⇒ boolean

&#x20;   Returns true if and only if _object_ is a Provider.
