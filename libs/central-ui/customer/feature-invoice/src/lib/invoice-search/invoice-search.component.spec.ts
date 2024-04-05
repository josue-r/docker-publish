import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { InvoiceSearchComponent } from './invoice-search.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { EMPTY } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('InvoiceSearchComponent', () => {
    let component: InvoiceSearchComponent;
    let fixture: ComponentFixture<InvoiceSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [InvoiceSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InvoiceSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('searchPage', () => {
        let searchPage: MockSearchPageComponent;

        beforeEach(() => {
            searchPage = fixture.debugElement.query(By.directive(MockSearchPageComponent)).componentInstance;
            fixture.detectChanges();
        });

        it('should pass the entityType', () => {
            expect(searchPage.entityType).toEqual('Invoice');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.invoiceFacade);
        });

        it('should pass the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toStringId);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });
});
