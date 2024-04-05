import { TestBed } from '@angular/core/testing';
import { UiCurrencyPrefixModule } from './ui-currency-prefix.module';

describe('UiCurrencyPrefixModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiCurrencyPrefixModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiCurrencyPrefixModule).toBeDefined();
    });
});
