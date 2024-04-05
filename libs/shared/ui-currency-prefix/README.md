# ui-currency-prefix

This library was generated with [Nx](https://nx.dev).

Provides a symbol prefix for currency inputs. This component should be placed inside the
mat-form-field for the input it should pertain to, and it should have the matPrefix directive
added to it for it to properly format.

## Example

    <mat-form-field class="flex-item">
        <input matInput placeholder="Retail Price" formControlName="retailPrice" type="number"/>
        <vioc-ui-currency-prefix matPrefix></vioc-ui-currency-prefix>
    </mat-form-field>

## Running unit tests

Run `nx test ui-currency-prefix` to execute the unit tests.
