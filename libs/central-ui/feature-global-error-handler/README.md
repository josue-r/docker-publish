# central-ui-feature-global-error-handler

This library was generated with [Nx](https://nx.dev).

Custom error handler for handling `HTTP` and `API` error responses. Handles logging relevant information for developer debugging and displaying information to the end user on how to proceed when an error occurs.

To configure this error handler simply provide it in the `app.module`

```ts
@NgModule({
    ...
    providers: [
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        ...
    ],
    ...
})
export class AppModule { }
```

## Running unit tests

Run `nx test central-ui-feature-global-error-handler` to execute the unit tests.
