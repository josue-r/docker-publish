import { Component, Input } from '@angular/core';
import { CurrencyPrefix, SUPPORTED_CURRENCIES } from './currency-prefix';

/**
 * Provides a symbol prefix for currency inputs. This component should be placed inside the
 * mat-form-field for the input it should pertain to, and it should have the matPrefix directive
 * added to it for it to properly format.
 */
@Component({
    selector: 'vioc-angular-currency-prefix',
    template: '{{ currencyPrefix }}&nbsp;',
})
export class CurrencyPrefixComponent {
    @Input() set currency(currency: CurrencyPrefix) {
        this.currencyPrefix = currency.symbol;
    }

    currencyPrefix = SUPPORTED_CURRENCIES.USD.symbol;
}
