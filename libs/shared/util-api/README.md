# util-api

This library was generated with [Nx](https://nx.dev).

Contains the super classes for API specications for connecting to RESTful services. In most cases, to use this, all you need to do is to
create a class like this:

```ts
class FooApi extends Api<Foo,number>{
    constructor(...){
        ...
    }
}
```

## Running unit tests

Run `nx test util-api` to execute the unit tests.
