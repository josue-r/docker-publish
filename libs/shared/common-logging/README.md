# shared-common-logging

A customizable logging implementation.

To configure, either use the defaults or add the following to your `AppModule`

```ts
Loggers.publishers = [new ConsoleLogPublisher()];
Loggers.logLevelProvider = new StorageLogLevelProvider(localStorage);
Loggers.defaultLogLevel = LogLevel.WARN;
```

Then, in your component (`StoreProductComponent`)

```ts
private readonly logger = Loggers.get('feature-store-product', 'StoreProductComponent');
//...
this.logger.debug('Simple debug message');
this.logger.debug('Passed object:', {foo: 'bar'});
// This pattern removes the need for an logger.isDebugEnabled() equivalent.
this.logger.debug(() => {
    const someDetails = 'some additional details';
    return `Complex debug message requiring building a string:  ${someDetails}`;
});
```

## Running unit tests

Run `nx test shared-common-logging` to execute the unit tests.
