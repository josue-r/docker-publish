import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CompanyHolidaySearchComponent } from './company-holiday-search.component';

describe('CompanyHolidaySearchComponent', () => {
    let component: CompanyHolidaySearchComponent;
    let fixture: ComponentFixture<CompanyHolidaySearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [CompanyHolidaySearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyHolidaySearchComponent);
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
            expect(searchPage.entityType).toEqual('Company Holiday');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.companyHolidayFacade);
        });

        it('should pass the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });
});
