# central-ui-data-access-menu

This library was generated with [Nx](https://nx.dev).

This is meant to maintain the list of MenuItems are available for a user. It is dependent upon the data-access-security library to provide the roles.

Any MenuItem provided a role that a user is missing will automatically be filtered out. Any MenuItem that has all of its children filtered out and doesn't have its own path will also be filtered out. This is to prevent items that a user doesn't have access to from displaying in navigation components or coming up as search results.

## Running unit tests

Run `nx test central-ui-data-access-menu` to execute the unit tests.
