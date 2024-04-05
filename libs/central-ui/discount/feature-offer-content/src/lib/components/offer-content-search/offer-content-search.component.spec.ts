import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OfferContentSearchComponent } from './offer-content-search.component';
import { By } from '@angular/platform-browser';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { Comparators } from '@vioc-angular/shared/util-column';

describe('OfferContentSearchComponent', () => {
    let component: OfferContentSearchComponent;
    let fixture: ComponentFixture<OfferContentSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [OfferContentSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            offerContent: {
                                search: {
                                    add: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OfferContentSearchComponent);
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
            expect(searchPage.entityType).toEqual('Discount Offer Content');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.offerContentFacade);
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

    it('should return contains as default/first in comparators', () => {
        expect(component.getStringComparatorsWithContainsAsDefault().length).toEqual(
            Comparators.forType('string').length
        );
        expect(component.getStringComparatorsWithContainsAsDefault().shift()).toEqual(Comparators.contains);
    });
});
