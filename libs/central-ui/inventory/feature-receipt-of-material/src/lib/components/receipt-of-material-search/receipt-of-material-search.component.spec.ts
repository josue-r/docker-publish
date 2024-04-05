import { HttpClient } from '@angular/common/http';
import { Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NativeDateModule } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { of } from 'rxjs';
import { ReceiptOfMaterialSearchComponent } from './receipt-of-material-search.component';

describe('ReceiptOfMaterialSearchComponent', () => {
    let component: ReceiptOfMaterialSearchComponent;
    let fixture: ComponentFixture<ReceiptOfMaterialSearchComponent>;
    const mockFeatureFlagFacade = { isEnabled: jest.fn(() => of(true)) };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchPageMockModule, NativeDateModule, NoopAnimationsModule, FeatureFeatureFlagModule],
            declarations: [ReceiptOfMaterialSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: FeatureFlagFacade, useValue: mockFeatureFlagFacade },
            ] as Provider[],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReceiptOfMaterialSearchComponent);
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
            expect(searchPage.entityType).toEqual('ReceiptOfMaterial');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.receiptOfMaterialFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['rmNumber']).toEqual(component.columns['rmNumber']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

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

        it('should hide if feature is off', () => {
            mockFeatureFlagFacade.isEnabled.mockReturnValueOnce(of(false));
            fixture.detectChanges();

            const addButton = fixture.debugElement.query(By.css('#add-button'));

            expect(addButton).toBeFalsy();
        });
    });
});
