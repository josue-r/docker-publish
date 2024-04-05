import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { DefectiveProductSearchComponent } from './defective-product-search.component';

describe('DefectiveProductSearchComponent', () => {
    let component: DefectiveProductSearchComponent;
    let fixture: ComponentFixture<DefectiveProductSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
                CommonModule,
                FeatureDropdownColumnMockModule,
            ],
            declarations: [DefectiveProductSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: ({ getUser: () => EMPTY } as any) as AuthenticationFacade },
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
        fixture = TestBed.createComponent(DefectiveProductSearchComponent);
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
            expect(searchPage.entityType).toEqual('DefectiveProduct');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.defectiveProductFacade);
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
