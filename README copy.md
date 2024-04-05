# VIOC Angular Applications

## Application Layout

These patterns were taken and adapted from: [Opinionated guidelines for large nx angular projects](https://blog.brecht.io/opinionated-guidelines-for-large-nx-angular-projects/)

Key points:

-   All `app.module.ts` modules go under the `./apps` directory. It's important to note that this is just the base module and the routing module.
-   Everything else goes into the `./libs` directory.
    -   Under `./libs`, each application will have it's own subdirectory with modules that are only intended to be used inside that app (no potential to be shared across apps.) For larger apps, there can be an additional level of grouping.
-   See [Scopes and Types](#scopes-and-types) for details on these patterns.

Example of a mono-repo with two apps: a small `dogs` app and a larger `pets` app.

```
./apps/
      /dogs
      /pets
./libs/
      /dogs/
            /data-access-dog
            /feature-edit-dog
            /feature-search-dog
      /pets/
            /dog/
                /data-access-dog
                /feature-edit-dog
                /feature-search-dog
            /cat/
                /data-access-cat
                /feature-edit-cat
                /feature-search-cat
            /shared/
                /ui-pet-record
      /shared/
            /feature-login
            /feature-error
      /layout/
            /layout-option1
            /layout-option2
```

### Scopes and Types

Each module must be defined with exactly one type and one scope. These values give strict definition to each library to enforce proper usage and application architecture. (See [tslint.json](./tslint.json)) for details.

#### Types

The [type](https://nx.dev/concepts/more-concepts/library-types) defines how the module/library is intended to be used:

-   `type:app`
    -   The root application library/module (along with a base routing module). Each application should have only one of these.
    -   Can import from libraries of these types:
        -   `type:feature`
        -   `type:ui`
        -   `type:util`
        -   `type:common`
-   `type:util`
    -   A utility library contains low-level utilities used by many libraries and applications.
    -   Can import from libraries of these types:
        -   `type:util`
        -   `type:common`
-   `type:ui`
    -   A UI library contains only presentational components (also called "dumb" components.) Should have no interaction with external services or state (prefer over 'feature-shared')
    -   Can import from libraries of these types:
        -   `type:ui`
        -   `type:common`
-   `type:data-access` - Exposes facades to make API calls and data models to `feature` modules. A data-access library contains code for interacting with a back-end system. See [Example](#example) for an sample layout backed by real code.
    -   Generally, a data-access library will have subdirectories and classes for
        -   `api`
            -   facilitates making API calls through the `HttpClient`, leveraging the `base-api` module. **These should never be exported!**
        -   `facade`
            -   Facades are the public face of the data-access module.
            -   The facade communicates directly with the API and state. API and State should not be accessible outside of the Facades
            -   **Facades should be Component scoped and not application/module scope**
            -   This approach reduces at the application memory by only having the states provided in root. The Facades (and APIs) will be component scoped and will be destroyed with the component, the state will remain.
        -   `state`
            -   An optional layer to manage state (often caching via `@vioc-angular/shared/util-state`). **These should never be exported!**
    -   Can import from libraries of these types:
        -   `type:data-access`
        -   `type:util`
        -   `type:common`
-   `type:feature`
    -   "Smart" UI components. This is generally standard application screens.
    -   Nothing can import types of `type:feature` other than a `type:app`. These are intended to only be accessed via a routing module
    -   Can import from libraries of these types:
        -   `type:ui`
        -   `type:util`
        -   `type:data-access`
        -   `type:common`
        -   `type:feature-shared`
-   `type:feature-shared`
    -   Reusable "Smart" UI components
    -   These should be used sparingly, preferring dumb `type:ui` components when possible.
        -   A good example would be a store dropdown component. Lots of screens may use this and it's all backed by the same data-access library.
    -   Can import from libraries of these types:
        -   `type:ui`
        -   `type:util`
        -   `type:data-access`
        -   `type:common`
        -   `type:feature-shared`
-   `type:common`
    -   Common functionality that should be available everywhere.
    -   **This should not contain any modules or injectables! Just classes.**
    -   Can not import any other application libraries.

#### Scopes

The scope must either specify a single application that this library is intended for (like `scope:<app>`), or it will be `scope:shared`.

-   `scope:shared` - Shared (non-application specific) library
    -   Libraries with this scope can only import modules that are also of `scope:shared` or `type:common`
-   `scope:central-ui` - "central-ui" application scope.
    -   Application scope modules can import from libraries of the same application scope (`scope:central-ui`), as well as `scope:shared` or `type:common`

### Example

| File                                                       | Export |  Provide  | Notes                               |
| ---------------------------------------------------------- | :----: | :-------: | ----------------------------------- |
| /data-access-common-code/model/common-code.model.ts        |   Y    |    NA     | Common code model file              |
| /data-access-common-code/state/common-code-state.ts        |   N    |   root    |                                     |
| /data-access-common-code/api/common-code-api.ts            |   N    |           | instantiate in CommonCodeFacade     |
| /data-access-common-code/api/common-code-facade.ts         |   Y    | component | instantiates CommonCodeApi          |
| /data-access-product/state/product-state.ts                |   N    |   root    |                                     |
| /data-access-product/state/company-product-state.ts        |   N    |   root    |                                     |
| /data-access-product/state/store-product-state.ts          |   N    |   root    |                                     |
| /data-access-product/api/product-api.ts                    |   N    |           | instantiate in ProductFacade        |
| /data-access-product/api/company-product-api.ts            |   N    |           | instantiate in CompanyProductFacade |
| /data-access-product/api/store-product-api.ts              |   N    |           | instantiate in StoreProductFacade   |
| /data-access-product/product-facade.ts                     |   Y    | component | instantiates ProductApi             |
| /data-access-product/company-product-facade                |   Y    | component | instantiates CompanyProductApi      |
| /data-access-product/store-product-facade                  |   Y    | component | instantiates StoreProductApi        |
| /feature-company-product/feature-company-product.module.ts |   NA   |           |                                     |
| /feature-company-product/company-product.component         |   NA   |           | Provide CompanyProductFacade, etc   |

---

## Creating a new shared library

### Example for creating Library module /libs/security/util-authentication

1.  `ng g @nx/angular:library util-authentication --directory security --simpleModuleName --tags=scope:shared,type:util --style=sass`
2.  All publicly accessible classes should be exported in this library's barrel file (index.ts)
3.  By default, nx will create a module as well. In a lot of libraries, we don't necessarily need a module. If this is one of those cases, delete the module & spec and remove it from the barrel file.

### Example for creating Feature Module /central-ui/service/company-service

1. `ng g @nx/angular:library feature-company-product --directory central-ui/product --simpleModuleName --tags=scope:central-ui,type:feature --style=sass`

    - The directory portion should be in the format of `central-ui/${parentDomain}`. There may be cases where a parent domain doesn't apply but in most cases there will be one. Try to keep the `parentDomain` down to a single directory for simplicity.

---

# Logging

See [logging documentation](./libs/shared/common-logging/README.md)

---

# Feature Flags

Feature flags are available via the [FeatureFlagDirective](./libs/shared/feature-feature-flag/src/lib/feature-feature-flag.feature-flag.directive.ts).

The flag name should follow the pattern specified in the [Features](./libs/shared/common-feature-flag/src/lib/models/features.ts) documentation:

> -   `domain`: The application domain that the flag is configured for. Example: `'storeService'`
> -   `screen`: The application screen or component in the specified domain that the flag is configured for. Example: `'search'`.
> -   `item`: The most specific item (button,field,section,etc) on the specified screen. Example: `'grid'`.
> -   The value of `item` will either be `true` or `false` or an array of user ids that this is enabled for.

For example: `<div *viocAngularFeatureFlag("'storeService.search.add'")>` will only display the div if this feature is enabled. Features default to enabled and must be explicitly disabled. You can also provide the `FeatureFlagFacade` in your component directly to check for flags without the directive.

See [FeatureFeatureFlagModule](./libs/shared/feature-feature-flag/src/lib/feature-feature-flag.module.ts) for information on configuration at the application level.

---

# Styling

For page design and styling concerns, refer to the [Central Style Guide](./central-style-guide.md).

---

# i18n

See the official [Angular documentation](https://angular.io/guide/i18n).

There are two types of language translations required in the Angular app. Translating text in an HTML file will use the `i18n` attribute. And translating text 'in code' will use the `$localize` function. Error messages would be an example of the latter.

Running `ng xi18n --output-path=locale` will generate the base messages translation file containing all of the HTML text that was marked for translation with the `i18n` attribute. Text being translated via the `$localize` does not currently get added with this command and will have to be manually added. If you compile the app without providing a translation, you will see a warning message like:

    WARNING in No translation found for "5637228650167132316" ("Value is required").

If not providing a custom ID, the provided ID (in this case: "5637228650167132316") should be used when adding this to the messages file.

Each additional language will then need its own file based off of this generated file containing the translations (I.E. messages.fr.xlf).

The angular.json will need to be updated with each new language to include their messages file in the `i18n` section:

```
"projects": {
    "central-ui": {
        ...
        "i18n": {
            "sourceLocale": "en-US",
            "locales": {
                "fr": "apps/central-ui/locale/messages.fr.xlf"
            }
        },
```

And have a build configuration added:

```
"architect": {
    "build": {
        ...
        "configurations": {
            ...
            "fr": {
                "localize": ["fr"]
            },
```

And create a serve configuration added for local testing (`ng serve -c fr`):

```
"serve": {
    ...
    "configurations": {
        ...
        "fr": {
            "browserTarget": "central-ui:build:local,fr",
            "port": 4202,
            "ssl": true
        },
```

---

# Build and Test

Tests are using [jest](https://jestjs.io/en/) and can be ran with `npm run test` or `ng test`.

A list of command options for running the tests can be found [here](https://jestjs.io/docs/en/cli). A few examples:

-   Run only a test in a specific library that matches a regex: `ng test ui-footer --testNamePattern=".* should default to the current year"`
-   Run tests of all changed files: `ng test -o`
-   Run in watch mode: `ng test --watch`

To Debug:

1. Select the "Debug Jest Tests" configuration from the "Run and Debug" menu.
2. Enter the name of the library to debug. This is useful to prevent jest from scanning every library.
3. The tests will then launch in watch mode and allow you to further filter tests to specific files or patterns.

## Verifying Form Inputs

We've extended jest to add some custom matchers for verifying inputs. See details here: [Jest Input Extension](./libs/test/util-test/README.md#jest-input-extension)

---

# Local and remote deployment

Apps are built as [immutable web apps](https://immutablewebapps.org/). This means they are split into static files compiled by angular and an index.html file generated per deployment that contains environment configuration. The typical environment files have been replaced with a local and a deploy. The local is used for local development and the deploy is used for any deployed version of the app. The deploy environment simply exposes the environment from the window, which will be provided in the generated index.html.

Local deployment can still be done with `ng serve central-ui --configuration=local`. This will use an already generated index.html located in the .immutable directory. If this index.html needs to be regenerated, the `gen-local-central` command in the package.json can be used to regenerated it.

A remote deployment will be built using the deploy configuration. This will deploy all the static generated angular files and a template for the index.html file. This template is index.ejs, which uses [embedded javascript templates](https://ejs.co/) to generate a proper index.html. A dev dependency of @immutablewebapps/ejs-cli has been added to simplify the index.html generation process. It can be run along with a configuration located in the .immutable directory to create an environment specific index.html file.

Ex. `more apps\central-ui\src\index.ejs | npm run iwa-ejs -- --d apps\central-ui\.immutable\config-dev.json > index.html`

This should only need to be run by Jenkins to create the actual deployment index.html.

Additional remote deploy configuration is contained in the angular.json file. The deploy configuration specifies the deployUrl and baseHref as ejs tags that will be replaced at index.html generation time. There is also an additional configuration in the main.ts file that configures webpack to use the environments deployUrl for loading resources via lazy loading.

The config.json contains placeholders that will be replaced at runtime. There are two placeholders, APP_HOST and APP_VERSION which are replaced when the docker container is built. All the other replacements indicated by double curl braces are replaced at runtime by environment variables provided to the container.
