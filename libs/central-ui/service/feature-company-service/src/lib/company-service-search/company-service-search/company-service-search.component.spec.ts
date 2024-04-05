import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLink } from '@angular/router';
// TODO: 04/30/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { CompanyService } from '@vioc-angular/central-ui/service/data-access-company-service';
import {
    MassDeactivateDialogComponent,
    UiMassDeactivateDialogMockModule,
} from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
// TODO: 04/30/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { of } from 'rxjs';
import { CompanyServiceSearchComponent } from './company-service-search.component';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';

describe('CompanyServiceSearchComponent', () => {
    let component: CompanyServiceSearchComponent;
    let fixture: ComponentFixture<CompanyServiceSearchComponent>;
    let messageFacade: MessageFacade;

    const requestForDeactivation: AssignmentCount[] = [
        {
            id: { companyId: 612580, serviceId: 29901 },
            description: 'HKX - VO160',
            companyResourceCount: 1,
            storeResourceCount: 4,
        },
    ];

    const companyService = {
        id: { companyId: 612580, serviceId: 29901 },
        service: { code: 'PRODUCT', description: '' } as Described,
        company: { code: 'VAL', description: '' } as Described,
    } as CompanyService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopAnimationsModule,
                UiLoadingModule,
                ReactiveFormsModule,
                MatButtonModule,
                FeatureDropdownColumnMockModule,
                FeatureSearchPageMockModule,
                UiMassDeactivateDialogMockModule,
                RouterLink,
                CommonFunctionalityModule,
            ],
            declarations: [CompanyServiceSearchComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyServiceSearchComponent);
        component = fixture.componentInstance;
        component.massDeactivate = new MassDeactivateDialogComponent(); // TODO: I don't know why this is required but it seems wrong
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
            expect(searchPage.entityType).toEqual('CompanyService');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.companyServiceFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['company']).toEqual(component.columns['company']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.mapToPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });
    });

    describe('activate', () => {
        it('should activate, show a message and retrigger search', fakeAsync(() => {
            jest.spyOn(messageFacade, 'addMessage');
            jest.spyOn(component.companyServiceFacade, 'activate').mockReturnValue(of(1));
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');
            component.searchPage.searchComponent.selection.select(companyService);

            component.activate();
            tick(600);

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
            );
            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
            expect(component.companyServiceFacade.activate).toHaveBeenCalledWith([companyService.id]);
        }));

        it('should only call activate once, even with double clicks', fakeAsync(() => {
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();

            jest.spyOn(component.companyServiceFacade, 'activate').mockReturnValue(of(1));
            const activateButton = fixture.debugElement.query(By.css('#activate-button')).nativeElement;

            activateButton.click();
            activateButton.click();
            activateButton.click();
            tick(600);
            fixture.detectChanges();

            expect(component.companyServiceFacade.activate).toHaveBeenCalledTimes(1);
        }));
    });

    it('should load the usage for the company service and open a dialog when clicking deactivate', fakeAsync(() => {
        const mockUsage = of(requestForDeactivation);
        component.searchPage.searchComponent.selection.select(companyService);
        jest.spyOn(component.companyServiceFacade, 'findUsage').mockReturnValue(mockUsage);
        jest.spyOn(component.massDeactivate, 'openDialog').mockImplementation();

        component.loadUsage();
        tick(600);
        fixture.detectChanges();

        expect(component.companyServiceFacade.findUsage).toHaveBeenCalledWith([companyService.id]);
        expect(component.massDeactivate.openDialog).toHaveBeenCalledWith(mockUsage);
    }));

    describe('deactivate', () => {
        it('should deactivate, show a message and retrigger search', fakeAsync(() => {
            jest.spyOn(messageFacade, 'addMessage');
            jest.spyOn(component.companyServiceFacade, 'deactivate').mockReturnValue(of(5));
            jest.spyOn(component.searchPage, 'triggerPreviousSearch');
            component.massDeactivate.selection.select(...requestForDeactivation);

            component.deactivate();
            tick(600);

            expect(messageFacade.addMessage).toHaveBeenCalledWith(
                expect.objectContaining({ message: '5 record(s) deactivated', severity: 'success' })
            );
            expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
            expect(component.companyServiceFacade.deactivate).toHaveBeenCalledWith([requestForDeactivation[0].id]);
        }));

        it('should only call deactivate once, even with double clicks', fakeAsync(() => {
            component.searchPage.hasEditAccess = true;
            fixture.detectChanges();

            jest.spyOn(component.companyServiceFacade, 'findUsage').mockImplementation();
            const deactivateButton = fixture.debugElement.query(By.css('#deactivate-button')).nativeElement;

            deactivateButton.click();
            deactivateButton.click();
            deactivateButton.click();
            tick(600);
            fixture.detectChanges();

            expect(component.companyServiceFacade.findUsage).toHaveBeenCalledTimes(1);
        }));
    });

    it('should pass grid options to the search page', () => {
        expect(component.searchPage.gridFormOptions.companyExportFacade).not.toBeNull();
        expect(component.searchPage.gridFormOptions.companyExportFacade).toEqual(
            component.gridFormOptions.companyExportFacade
        );
    });
});
