import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { EMPTY, of } from 'rxjs';
import { PhysicalInventorySearchComponent } from './physical-inventory-search.component';

describe('PhysicalInventorySearchComponent', () => {
    let component: PhysicalInventorySearchComponent;
    let fixture: ComponentFixture<PhysicalInventorySearchComponent>;
    const mockFeatureFlagFacade = { isEnabled: jest.fn(() => of(true)) };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, FeatureSearchPageMockModule, FeatureFeatureFlagModule],
            declarations: [PhysicalInventorySearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: AuthenticationFacade, useValue: ({ getUser: () => EMPTY } as any) as AuthenticationFacade },
                { provide: FeatureFlagFacade, useValue: mockFeatureFlagFacade },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PhysicalInventorySearchComponent);
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
            expect(searchPage.entityType).toEqual('PhysicalInventory');
        });

        it('should pass the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.physicalInventoryFacade);
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

    describe('add button', () => {
        let searchPage: MockSearchPageComponent;

        beforeEach(() => {
            searchPage = fixture.debugElement.query(By.directive(MockSearchPageComponent)).componentInstance;
            fixture.detectChanges();
        });
        it('should navigate to add page', () => {
            searchPage.hasAddAccess = true;
            fixture.detectChanges();

            const routerLink = fixture.debugElement
                .query(By.css('#add-button'))
                .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

            expect(routerLink).toEqual(['../add']);
        });

        it('should hide without add access', () => {
            searchPage.hasAddAccess = false;
            fixture.detectChanges();

            const addButton = fixture.debugElement.query(By.css('#add-button'));

            expect(addButton).toBeFalsy();
        });

        it('should hide if feature is off', () => {
            mockFeatureFlagFacade.isEnabled.mockReturnValueOnce(of(false));
            fixture.detectChanges();

            const addButton = fixture.debugElement.query(By.css('#add-button'));

            expect(addButton).toBeFalsy();
        });
    });
});
