import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { AbstractDropdownColumn, DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { InventoryOrderSearchComponent } from './inventory-order-search.component';

describe('InventoryOrderSearchComponent', () => {
    let component: InventoryOrderSearchComponent;
    let fixture: ComponentFixture<InventoryOrderSearchComponent>;
    const mockHttpClient = ({
        get: jest.fn(),
    } as unknown) as HttpClient;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchPageMockModule, FeatureFeatureFlagModule],
            declarations: [InventoryOrderSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            inventoryOrder: {
                                search: {
                                    add: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
                { provide: HttpClient, useValue: mockHttpClient },
                {
                    provide: AuthenticationFacade,
                    useValue: ({ getUser: () => EMPTY } as any) as AuthenticationFacade,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InventoryOrderSearchComponent);
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
            expect(searchPage.entityType).toEqual('InventoryOrder');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.inventoryOrderFacade);
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

        it('should not contain cancelled & closed statuses in inventory status dropdown', fakeAsync(() => {
            const statusDropdown = (component.columns.status as () => AbstractDropdownColumn<any>)();
            const mockedInventoryStatuses = [
                { description: 'Cancelled', code: 'CANCELLED', active: true, id: 2532 },
                { description: 'Closed', code: 'CLOSED', active: true, id: 2487 },
                { description: 'Finalized', code: 'FINALIZED', active: true, id: 2488 },
                { description: 'Open', code: 'OPEN', active: true, id: 2486 },
            ];
            jest.spyOn(mockHttpClient, 'get').mockReturnValueOnce(of(mockedInventoryStatuses));
            (statusDropdown as DynamicDropdownColumn<Described>).fetchData('').subscribe((data: []) => {
                expect(
                    data.some((option: Described) => option.code === 'CANCELLED' || option.code === 'CLOSED')
                ).toBeFalsy();
                expect(
                    data.every((option: Described) => option.code === 'FINALIZED' || option.code === 'OPEN')
                ).toBeTruthy();
            });
            flush();
            expect.assertions(2);
        }));

        describe('add button', () => {
            it('should navigate to add page', () => {
                component.searchPage.hasAddAccess = true;
                fixture.detectChanges();

                const routerLink = fixture.debugElement
                    .query(By.css('#add-button'))
                    .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

                expect(routerLink).toEqual(['../add']);
            });

            it('should hide if without add access', () => {
                component.searchPage.hasAddAccess = false;
                fixture.detectChanges();

                const addButton = fixture.debugElement.query(By.css('#add-button'));

                expect(addButton).toBeFalsy();
            });
        });

        it.todo('should route to edit/view page when selecting record');
    });
});
