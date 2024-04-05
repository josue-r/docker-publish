import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { StoreFacade } from '@vioc-angular/central-ui/organization/data-access-store';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { AbstractDropdownColumn, DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { StoreSearchComponent } from './store-search.component';

describe('StoreSearchComponent', () => {
    let component: StoreSearchComponent;
    let fixture: ComponentFixture<StoreSearchComponent>;
    let commonCode: CommonCodeFacade;
    let storeFacade: StoreFacade;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [StoreSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: { getUser: () => EMPTY } as any as AuthenticationFacade },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            productAdjustment: {
                                search: {
                                    enabled: true,
                                    clickRow: false,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create commonCode instance', () => {
        expect(component['commonCodeFacade']).toBeTruthy();
        expect(component['commonCodeFacade']).toBeInstanceOf(CommonCodeFacade);
    });

    it('should create StoreFacade instance', () => {
        expect(component['storeFacade']).toBeTruthy();
        expect(component['storeFacade']).toBeInstanceOf(StoreFacade);
    });

    describe('searchPage', () => {
        let searchPage: MockSearchPageComponent;

        beforeEach(() => {
            searchPage = fixture.debugElement.query(By.directive(MockSearchPageComponent)).componentInstance;
            fixture.detectChanges();
        });

        it('should pass the entityType', () => {
            expect(searchPage.entityType).toEqual('Store');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component['storeFacade']);
        });

        it('should pass the dataSyncable to true', () => {
            expect(searchPage.dataSyncable).toBeTruthy();
        });

        it('should pass the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
        });

        it.each`
            column
            ${'company'}
            ${'market'}
            ${'region'}
            ${'area'}
            ${'state'}
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

        it('should pass overridden values from CommonCode', () => {
            expect((searchPage.columns['state'] as () => DynamicDropdownColumn<any>)().searchable).toEqual(
                (component.columns['state'] as () => DynamicDropdownColumn<any>)().searchable
            );
            expect((searchPage.columns['state'] as () => DynamicDropdownColumn<any>)().mapToKey).toEqual(
                (component.columns['state'] as () => DynamicDropdownColumn<any>)().mapToKey
            );
            expect((searchPage.columns['state'] as () => DynamicDropdownColumn<any>)().mapToDropdownDisplay).toEqual(
                (component.columns['state'] as () => DynamicDropdownColumn<any>)().mapToDropdownDisplay
            );
            expect(
                (searchPage.columns['state'] as () => DynamicDropdownColumn<any>)().mapToTableDisplay('test')
            ).toEqual('test');
            // Serializes to same string, Mitigate with JSON.stringify
            expect(
                JSON.stringify((searchPage.columns['state'] as () => DynamicDropdownColumn<any>)().mapToTableDisplay)
            ).toEqual(
                JSON.stringify((component.columns['state'] as () => DynamicDropdownColumn<any>)().mapToTableDisplay)
            );
            // Serializes to same string, Mitigate with JSON.stringify
            expect(
                JSON.stringify((searchPage.columns['state'] as () => DynamicDropdownColumn<any>)().fetchData)
            ).toEqual(JSON.stringify((component.columns['state'] as () => DynamicDropdownColumn<any>)().fetchData));
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });
});
