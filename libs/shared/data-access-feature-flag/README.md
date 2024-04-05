# shared-data-access-feature-flag

Feature Flags should be specified with three sections, separated by a `.`:

```
<domain>.<screen>.<item>
```

Where

-   `domain`: The application domain that the flag is configured for. Example: `'store-service'`
-   `screen`: The application screen or component in the specified domain that the flag is configured for. Example: `'search'`.
-   `item`: The most specific item (button,field,section,etc) on the specified screen. Example: `'mass-update'`.

This library was generated with [Nx](https://nx.dev).

```
ng g @nx/angular:library data-access-feature-flag --directory shared --simpleModuleName --tags=scope:shared,type:data-access --style=sass
```

## Running unit tests

Run `nx test shared-data-access-feature-flag` to execute the unit tests.
