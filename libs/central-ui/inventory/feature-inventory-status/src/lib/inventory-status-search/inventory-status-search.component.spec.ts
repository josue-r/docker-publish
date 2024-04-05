import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY } from 'rxjs';
import { InventoryStatusSearchComponent } from './inventory-status-search.component';

describe('InventoryStatusSearchComponent', () => {
    let component: InventoryStatusSearchComponent;
    let fixture: ComponentFixture<InventoryStatusSearchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchPageMockModule],
            declarations: [InventoryStatusSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: Router, useValue: { navigate: jest.fn() } },
                {
                    provide: AuthenticationFacade,
                    useValue: ({ getUser: () => EMPTY } as any) as AuthenticationFacade,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InventoryStatusSearchComponent);
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
            expect(searchPage.entityType).toEqual('StoreProductInventoryStatus');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.storeProductInventoryStatusFacade);
        });

        it('should pass the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.routePathVariables);
        });

        it('should have the grid mode disabled', () => {
            expect(searchPage.gridModeEnabled).toEqual(false);
        });

        it('should have the datasync disabled', () => {
            expect(searchPage.dataSyncable).toEqual(false);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });
});
