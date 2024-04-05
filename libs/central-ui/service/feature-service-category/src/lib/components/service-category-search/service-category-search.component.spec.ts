import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
// TODO: 07/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//tslint:disable-next-line: nx-enforce-module-boundaries
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
// TODO: 07/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
// TODO: 07/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnModule } from '@vioc-angular/shared/feature-dropdown-column';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { ServiceCategorySearchComponent } from './service-category-search.component';

describe('ServiceCategorySearchComponent', () => {
    let component: ServiceCategorySearchComponent;
    let fixture: ComponentFixture<ServiceCategorySearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                UiLoadingModule,
                ReactiveFormsModule,
                MatButtonModule,
                FeatureDropdownColumnModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
            ],
            declarations: [ServiceCategorySearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: AuthenticationFacade, useValue: ({ getUser: () => EMPTY } as any) as AuthenticationFacade },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            ServiceCategory: {
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
        fixture = TestBed.createComponent(ServiceCategorySearchComponent);
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

        it('should accept the entityType', () => {
            expect(searchPage.entityType).toEqual('ServiceCategory');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.serviceCategoryFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['code']).toEqual(component.columns['code']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toCode);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    describe('Add button', () => {
        it('should navigate to add page when clicked', () => {
            component.searchPage.hasAddAccess = true;
            fixture.detectChanges();
            const routerLink = fixture.debugElement
                .query(By.css('#add-button'))
                .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

            expect(routerLink).toEqual(['../add']);
        });

        it('should not display if user does not have add access', () => {
            component.searchPage.hasAddAccess = false;
            fixture.detectChanges();
            const button = fixture.debugElement.query(By.css('#add-button'));
            expect(button).toBeFalsy();
        });
    });
});
