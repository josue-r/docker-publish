import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { InventoryTransferSearchComponent } from './inventory-transfer-search.component';

describe('InventoryTransferSearchComponent', () => {
    let component: InventoryTransferSearchComponent;
    let fixture: ComponentFixture<InventoryTransferSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, FeatureSearchPageMockModule, FeatureFeatureFlagModule],
            declarations: [InventoryTransferSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: ({ getUser: () => EMPTY } as any) as AuthenticationFacade },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            inventoryTransfer: {
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
        fixture = TestBed.createComponent(InventoryTransferSearchComponent);
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
            expect(searchPage.entityType).toEqual('InventoryTransfer');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.inventoryTransferFacade);
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

        it('should search automatically', () => {
            const mockSearch = jest.spyOn(component.searchPage.searchComponent, 'search');
            component.ngAfterViewInit();
            fixture.detectChanges();
            expect(mockSearch).toHaveBeenCalled();
        });

        describe('add button', () => {
            it('should navigate to add page', () => {
                fixture.debugElement
                    .query(By.directive(MockSearchPageComponent))
                    .injector.get<MockSearchPageComponent>(MockSearchPageComponent).hasAddAccess = true;

                searchPage.hasAddAccess = true;
                fixture.detectChanges();

                const routerLink = fixture.debugElement
                    .query(By.css('#add-button'))
                    .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

                expect(routerLink).toEqual(['../add']);
            });

            it('should hide if without add access', () => {
                fixture.debugElement
                    .query(By.directive(MockSearchPageComponent))
                    .injector.get<MockSearchPageComponent>(MockSearchPageComponent).hasAddAccess = false;
                fixture.detectChanges();

                const addButton = fixture.debugElement.query(By.css('#add-button'));

                expect(addButton).toBeFalsy();
            });
        });
    });
});
