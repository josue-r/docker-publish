import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLink } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { CompanyProduct } from '@vioc-angular/central-ui/product/data-access-company-product';
import {
    MassDeactivateDialogComponent,
    UiMassDeactivateDialogMockModule,
} from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnModule } from '@vioc-angular/shared/feature-dropdown-column';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { of } from 'rxjs';
import { CompanyProductSearchComponent } from './company-product-search.component';

describe('CompanyProductSearchComponent', () => {
    let component: CompanyProductSearchComponent;
    let fixture: ComponentFixture<CompanyProductSearchComponent>;
    let messageFacade: MessageFacade;

    const requestForDeactivation = [
        {
            id: { companyId: 612580, productId: 29901 },
            description: 'HKX - VO160',
            companyResourceCount: 1,
            storeResourceCount: 4,
        } as AssignmentCount,
    ];

    const companyProduct = {
        id: { companyId: 612580, productId: 29901 },
        product: { code: 'PRODUCT', description: '' } as Described,
        company: { code: 'VAL', description: '' } as Described,
    } as CompanyProduct;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonFunctionalityModule,
                // TODO: Break these out into separate module
                NoopAnimationsModule,
                UiLoadingModule,
                ReactiveFormsModule,
                MatButtonModule,
                FeatureDropdownColumnModule,
                FeatureSearchPageMockModule,
                UiMassDeactivateDialogMockModule,
                RouterLink,
            ],
            declarations: [CompanyProductSearchComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyProductSearchComponent);
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
            expect(searchPage.entityType).toEqual('CompanyProduct');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.companyProductFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['productCode']).toEqual(component.columns['productCode']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.toPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    describe('when activating', () => {
        beforeEach(() => {
            component.searchPage.searchComponent.selection.select(companyProduct);
            jest.spyOn(component.companyProductFacade, 'activate').mockReturnValue(of(1));
            fixture.detectChanges();
        });

        it('should activate the selected records', () => {
            jest.spyOn(messageFacade, 'addMessage');

            component.activate();

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
            );
        });

        it('should trigger activate method once on multiple clicks', fakeAsync(() => {
            jest.spyOn(messageFacade, 'addMessage');
            jest.spyOn(component, 'activate');
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();

            const activateButton = fixture.debugElement.query(By.css('#activateButton'));
            activateButton.nativeElement.click();
            activateButton.nativeElement.click();
            activateButton.nativeElement.click();
            fixture.detectChanges();
            tick(600);

            expect(component.activate).toHaveBeenCalledTimes(1);
            expect(messageFacade.addMessage).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
            );
        }));

        it('should trigger previous search', () => {
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');

            component.activate();

            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
        });
    });

    it('should load the usage for the company product and open a dialog when clicking deactivate', () => {
        const mockUsage = of(requestForDeactivation);
        component.searchPage.searchComponent.selection.select(companyProduct);
        jest.spyOn(component.companyProductFacade, 'findUsage').mockReturnValue(mockUsage);
        jest.spyOn(component.massDeactivate, 'openDialog').mockImplementation();
        component.loadUsage();
        fixture.detectChanges();
        expect(component.companyProductFacade.findUsage).toHaveBeenCalledWith([companyProduct.id]);
        expect(component.massDeactivate.openDialog).toHaveBeenCalledWith(mockUsage);
    });

    it('should trigger loadusage method once on multiple clicks', fakeAsync(() => {
        const mockUsage = of(requestForDeactivation);
        component.searchPage.searchComponent.selection.select(companyProduct);
        jest.spyOn(component.companyProductFacade, 'findUsage').mockReturnValue(mockUsage);
        jest.spyOn(component.massDeactivate, 'openDialog').mockImplementation();
        component.searchPage.hasEditAccess = true;
        fixture.detectChanges();

        const loadUsageButton = fixture.debugElement.query(By.css('#loadUsageButton'));
        loadUsageButton.nativeElement.click();
        loadUsageButton.nativeElement.click();
        loadUsageButton.nativeElement.click();
        tick(600);
        fixture.detectChanges();
        expect(component.companyProductFacade.findUsage).toHaveBeenNthCalledWith(1, [companyProduct.id]);
        expect(component.massDeactivate.openDialog).toHaveBeenCalledWith(mockUsage);
    }));

    describe('when deactivating', () => {
        beforeEach(() => {
            jest.spyOn(component.companyProductFacade, 'deactivate').mockReturnValue(of(5));
            fixture.detectChanges();
        });

        it('should deactivate the selected records along with corresponding store records', () => {
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

    it('should pass grid options to the search page', () => {
        expect(component.searchPage.gridFormOptions.companyExportFacade).not.toBeNull();
        expect(component.searchPage.gridFormOptions.companyExportFacade).toEqual(
            component.gridFormOptions.companyExportFacade
        );
    });
});
