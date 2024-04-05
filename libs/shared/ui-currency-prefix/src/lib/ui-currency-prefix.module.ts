import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CurrencyPrefixComponent } from './currency-prefix/currency-prefix.component';

@NgModule({
    imports: [CommonModule],
    declarations: [CurrencyPrefixComponent],
    exports: [CurrencyPrefixComponent],
})
export class UiCurrencyPrefixModule {}
