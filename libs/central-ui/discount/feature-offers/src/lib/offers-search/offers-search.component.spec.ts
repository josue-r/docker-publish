import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferFacade } from '@vioc-angular/central-ui/discount/data-access-offers';
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OfferSearchComponent } from './offers-search.component';
import { By } from '@angular/platform-browser';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { AbstractDropdownColumn } from '@vioc-angular/shared/util-column';

describe('OfferSearchComponent', () => {
    let component: OfferSearchComponent;
    let fixture: ComponentFixture<OfferSearchComponent>;
    let offerFacade: OfferFacade;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [OfferSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            offer: {
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
        fixture = TestBed.createComponent(OfferSearchComponent);
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
            expect(searchPage.entityType).toEqual('Discount Offer');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.offerFacade);
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

        it.each`
            column
            ${'company'}
        `('should pass the columns from resourceFacade', ({ column }) => {
            expect((searchPage.columns[column] as () => AbstractDropdownColumn<any>)().name).toEqual(
                (component.columns[column] as () => AbstractDropdownColumn<any>)().name
            );

            expect((searchPage.columns[column] as () => AbstractDropdownColumn<any>)().apiFieldPath).toEqual(
                (component.columns[column] as () => AbstractDropdownColumn<any>)().apiFieldPath
            );

            expect((searchPage.columns[column] as () => AbstractDropdownColumn<any>)().apiSortPath).toEqual(
                (component.columns[column] as () => AbstractDropdownColumn<any>)().apiSortPath
            );

            expect((searchPage.columns[column] as () => AbstractDropdownColumn<any>)().type).toEqual(
                (component.columns[column] as () => AbstractDropdownColumn<any>)().type
            );

            expect((searchPage.columns[column] as () => AbstractDropdownColumn<any>)().hint).toEqual(
                (component.columns[column] as () => AbstractDropdownColumn<any>)().hint
            );

            expect((searchPage.columns[column] as () => AbstractDropdownColumn<any>)().displayable).toEqual(
                (component.columns[column] as () => AbstractDropdownColumn<any>)().displayable
            );

            expect((searchPage.columns[column] as () => AbstractDropdownColumn<any>)().isSearchedByDefault).toEqual(
                (component.columns[column] as () => AbstractDropdownColumn<any>)().isSearchedByDefault
            );
        });
    });
});
