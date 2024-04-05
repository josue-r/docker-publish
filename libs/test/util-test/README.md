# test-util-test

Provides some common test functionality. One key difference with this library is that it allows jest types in non-spec files. (See tsconfig.json.)

## Provided functions

-   getApplyActionButton - Finds the Apply button based on standard convention
-   getSaveActionButton - Finds the Save button based on standard convention
-   getCancelActionButton - Finds the Cancel button based on standard convention
-   getAddLikeActionButton - Finds the Add Like button based on standard convention
-   expectObservable - Completes the observable and returns an "expect" on it's value
-   [expectInput](#jest-input-extension)

---

## Jest Input Extension

This provides a standard way of verifying form fields that removes a lot of the boilerplate code. To enable these, importing either the `findFormControlInput` or `expectInput` function is enough to trigger the jest.expect namespace update. You can also call `enableJestInputExtension()` or include the `TestModule` in your test module configuration if you want it to be enabled in a more explicit way.

### Usage

There are two approaches to using this extension:

-   The "pure" extension is is going to give you the best error messages. When these tests fail, jest will show the failure lines in your test code. The downside to this is that it does not support chaining and requires storing the input in a variable to prevent multiple `findFormControl` calls.
    ```ts
    const input = findFormControlInput(fixture, 'companyName');
    expect(input).toBeInputThatIsPresent();
    expect(input).toBeInputThatHasValue('Foo');
    ```
-   Using `expectInput` wraps the "pure" extension in a fluent, chainable API. This is much easier to read and write. The downside to this is that when tests fail, it shows the line inside of the `expectInput` code instead of the lines inside your test code.
    ```ts
    expectInput(fixture, 'companyName').toBePresent().toHaveValue('Foo');
    ```

### Examples

If you have a component with this template:

```html
<mat-form-field
    <input id="company-name" matInput formControlName="companyName" value="VAL" />
    <mat-hint class="warning">
        Company name should usually be set
    </mat-hint>
</mat-form-field>
```

These test will pass

```ts
expectInput(fixture, 'companyName')
    .toBePresent()
    .toBeEnabled()
    .toHaveValue('VAL')
    .toHaveValue(/VAL/)
    .toHaveWarning()
    .toHaveWarning('Company name should usually be set')
    .toHaveWarning(/should usually be set/);
// equivilant to
const input = findFormControlInput(fixture, 'companyName');
expect(input).toBeInputThatIsPresent(); // equivilant to toBeInputThatIsPresent(true)
expect(input).toBeInputThatIsEnabled(); // equivilant to toBeInputThatIsEnabled(true)
expect(input).toBeInputThatHasValue('VAL'); // == on string
expect(input).toBeInputThatHasValue(/VAL/); // RegExp
expect(input).toBeInputThatHasWarning(); // checks for warning but does not try to match
expect(input).toBeInputThatHasWarning('Company name should usually be set'); // == on string
expect(input).toBeInputThatHasWarning(/should usually be set/); // RegExp
```

All of the input extension calls also support `not`, like this:

```ts
expect(input).not.toBeInputThatHasValue('ABX');
expectInput(fixture, 'companyName').not.toHaveValue('ABX');
```

---

## This library was generated with [Nx](https://nx.dev).

```
ng g @nx/angular:library util-test --directory test --simpleModuleName --tags=scope:shared,type:test-util
```

---

## Running unit tests

Run `nx test test-util-test` to execute the unit tests.
