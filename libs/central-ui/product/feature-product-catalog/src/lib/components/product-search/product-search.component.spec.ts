import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import {
    MassDeactivateDialogComponent,
    UiMassDeactivateDialogMockModule,
} from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnModule } from '@vioc-angular/shared/feature-dropdown-column';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { of } from 'rxjs';
import { ProductSearchComponent } from './product-search.component';

describe('ProductSearchComponent', () => {
    let component: ProductSearchComponent;
    let fixture: ComponentFixture<ProductSearchComponent>;
    let messageFacade: MessageFacade;

    const product = {
        id: 1001,
        code: 'PRODUCT',
        description: 'SBATCLEAN',
    } as Product;

    const requestForDeactivation = [
        {
            id: 1001,
            description: 'SBATCLEAN',
            companyResourceCount: 1,
            storeResourceCount: 4,
        } as AssignmentCount,
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopAnimationsModule,
                UiLoadingModule,
                ReactiveFormsModule,
                MatButtonModule,
                FeatureDropdownColumnModule,
                FeatureSearchPageMockModule,
                UiMassDeactivateDialogMockModule,
            ],
            declarations: [ProductSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductSearchComponent);
        component = fixture.componentInstance;
        component.massDeactivate = new MassDeactivateDialogComponent();
        messageFacade = TestBed.inject(MessageFacade);
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
            expect(searchPage.entityType).toEqual('Product');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.productFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['code']).toEqual(component.columns['code']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toCode);
        });

        it('should accept the gridFormOptions', () => {
            expect(searchPage.gridFormOptions).toEqual(component.gridFormOptions);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    it('should navigate to add page on add button', () => {
        fixture.detectChanges();
        component.searchPage.hasAddAccess = true;
        fixture.detectChanges();

        const routerLink = fixture.debugElement
            .query(By.css('#add-button'))
            .injector.get<MockRouterLinkDirective>(MockRouterLinkDirective).routerLink;

        expect(routerLink).toEqual(['../add']);
    });

    it('should hide add button if no add access', () => {
        fixture.detectChanges();
        component.searchPage.hasAddAccess = false;
        fixture.detectChanges();

        const addButton = fixture.debugElement.query(By.css('#add-button'));

        expect(addButton).toBeFalsy();
    });

    describe('when activating', () => {
        beforeEach(() => {
            component.searchPage.searchComponent.selection.select(product);
            jest.spyOn(component.productFacade, 'activate').mockReturnValue(of(1));
            fixture.detectChanges();
        });

        it('should send the activate request and get the number of updated records', () => {
            jest.spyOn(messageFacade, 'addMessage');

            component.activate();

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
            );
        });

        it('should redo previous search', () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');

            component.activate();

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        });
    });

    it('should load the usage for the product and open a dialog when clicking deactivate', () => {
        const mockUsage = of(requestForDeactivation);
        component.searchPage.searchComponent.selection.select(product);
        jest.spyOn(component.productFacade, 'findUsage').mockReturnValue(mockUsage);
        jest.spyOn(component.massDeactivate, 'openDialog').mockImplementation();
        component.loadUsage();
        fixture.detectChanges();
        expect(component.productFacade.findUsage).toHaveBeenCalledWith([product.id]);
        expect(component.massDeactivate.openDialog).toHaveBeenCalledWith(mockUsage);
    });

    describe('when deactivating', () => {
        beforeEach(() => {
            jest.spyOn(component.productFacade, 'deactivate').mockReturnValue(of(5));
            fixture.detectChanges();
        });

        it('should send the deactivate request and get the number of updated records', () => {
            jest.spyOn(messageFacade, 'addMessage');

            component.deactivate(requestForDeactivation);

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '5 record(s) deactivated', severity: 'success' })
            );
        });

        it('should redo previous search', () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');

            component.deactivate(requestForDeactivation);

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        });
    });
});
