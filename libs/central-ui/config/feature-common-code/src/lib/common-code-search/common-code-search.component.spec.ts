import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { CommonCodeSearchComponent } from './common-code-search.component';

describe('CommonCodeSearchComponent', () => {
    let component: CommonCodeSearchComponent;
    let fixture: ComponentFixture<CommonCodeSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopAnimationsModule,
                UiLoadingModule,
                MatButtonModule,
                FeatureSearchPageMockModule,
                FeatureFeatureFlagModule,
            ],
            declarations: [CommonCodeSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            commonCode: {
                                search: {
                                    add: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
                { provide: Router, useValue: { navigate: jest.fn() } },
                {
                    provide: AuthenticationFacade,
                    useValue: ({ getUser: () => EMPTY } as any) as AuthenticationFacade,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonCodeSearchComponent);
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
            expect(searchPage.entityType).toEqual('CommonCode');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.commonCodeFacade);
        });

        it('should pass the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.viewEditRoutePathVariables);
        });

        it('should pass the gridFormOptions', () => {
            expect(searchPage.gridFormOptions).toEqual(component.gridFormOptions);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    describe('add button', () => {
        it('should navigate to add page', () => {
            fixture.detectChanges();
            component.searchPage.hasAddAccess = true;
            fixture.detectChanges();

            const routerLink = fixture.debugElement
                .query(By.css('#add-button'))
                .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

            expect(routerLink).toEqual(['../add']);
        });

        it('should hide if no add access', () => {
            fixture.detectChanges();
            component.searchPage.hasAddAccess = false;
            fixture.detectChanges();

            const addButton = fixture.debugElement.query(By.css('#add-button'));

            expect(addButton).toBeFalsy();
        });
    });
});
