import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SUPPORTED_CURRENCIES } from './currency-prefix';
import { CurrencyPrefixComponent } from './currency-prefix.component';

describe('CurrencyPrefixComponent', () => {
    let component: CurrencyPrefixComponent;
    let fixture: ComponentFixture<CurrencyPrefixComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CurrencyPrefixComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CurrencyPrefixComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should default to USD', () => {
        expect(component.currencyPrefix).toEqual(SUPPORTED_CURRENCIES.USD.symbol);
    });

    it('should set prefix based on passed currency', () => {
        component.currency = { code: 'TEST', symbol: '#' };
        expect(component.currencyPrefix).toEqual('#');
    });

    it('should display the prefix with a space', () => {
        const nonBreakingSpaceHex = '\xA0';
        expect(fixture.nativeElement.textContent).toEqual(`$${nonBreakingSpaceHex}`);
    });
});
