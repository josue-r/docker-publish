import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 05/05/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageMockModule, MockSearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import { UiMassDeactivateDialogMockModule } from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
// TODO: 05/05/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnMockModule } from '@vioc-angular/shared/feature-dropdown-column';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MockRouterLinkDirective } from '@vioc-angular/test/util-test';
import { of } from 'rxjs';
import { ServiceCatalogSearchComponent } from './service-catalog-search.component';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';

describe('ServiceCatalogSearchComponent', () => {
    let component: ServiceCatalogSearchComponent;
    let fixture: ComponentFixture<ServiceCatalogSearchComponent>;
    let messageFacade: MessageFacade;

    const service = {
        id: 1001,
        code: 'SERVICE',
        description: 'SBATCLEAN',
    } as Service;

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
                FeatureDropdownColumnMockModule,
                FeatureSearchPageMockModule,
                UiMassDeactivateDialogMockModule,
                CommonFunctionalityModule,
            ],
            declarations: [ServiceCatalogSearchComponent, MockRouterLinkDirective],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServiceCatalogSearchComponent);
        component = fixture.componentInstance;
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
            expect(searchPage.entityType).toEqual('Service');
        });

        it('should accept the searchPageFacade', () => {
            expect(searchPage.searchPageFacade).toEqual(component.serviceFacade);
        });

        it('should accept the columns', () => {
            expect(searchPage.columns).toEqual(component.columns);
            expect(searchPage.columns['code']).toEqual(component.columns['code']);
        });

        it('should accept the routePathVariables function', () => {
            expect(searchPage.routePathVariables).toEqual(component.mapToPathVariables);
        });

        it('should pass the defaultSorts', () => {
            expect(searchPage.defaultSorts).toEqual(component.defaultSorts);
        });

        it('should accept the unsavedChanges function', () => {
            searchPage.unsavedChanges = true;
            const unsavedChanges = component.unsavedChanges;
            expect(unsavedChanges).toEqual(true);
        });

        it('should accept the mapToPathVariables function', () => {
            const mappedVariable = component.mapToPathVariables(service);
            expect(mappedVariable).toEqual([service.code]);
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
                jest.spyOn(component.serviceFacade, 'activate').mockReturnValue(of(1));
                component.searchPage.searchComponent.selection.select(service);
                fixture.detectChanges();
            });

            it('should send the activate request and get the number of updated records', () => {
                jest.spyOn(messageFacade, 'addMessage');
                jest.spyOn(component.serviceFacade, 'activate');

                component.activate();

                expect(messageFacade.addMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ message: '1 record(s) activated', severity: 'success' })
                );
                expect(component.serviceFacade.activate).toHaveBeenCalledWith([service.id]);
            });

            it('should only call activate once, even with double clicks', fakeAsync(() => {
                component.searchPage.hasEditAccess = true;
                fixture.detectChanges();

                jest.spyOn(component.serviceFacade, 'activate');

                const activateButton = fixture.debugElement.query(By.css('#activate-button')).nativeElement;

                activateButton.click();
                activateButton.click();
                activateButton.click();
                tick(600);
                fixture.detectChanges();

                expect(component.serviceFacade.activate).toHaveBeenCalledTimes(1);
            }));

            it('should redo previous search', () => {
                jest.spyOn(component.searchPage, 'triggerPreviousSearch');

                component.activate();

                expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
            });
        });

        it('should load the usage for the service and open a dialog when clicking deactivate', () => {
            const mockUsage = of(requestForDeactivation);
            component.searchPage.searchComponent.selection.select(service);
            jest.spyOn(component.serviceFacade, 'findUsage').mockReturnValue(mockUsage);
            jest.spyOn(component.massDeactivate, 'openDialog').mockImplementation();
            component.loadUsage();
            fixture.detectChanges();
            expect(component.serviceFacade.findUsage).toHaveBeenCalledWith([service.id]);
            expect(component.massDeactivate.openDialog).toHaveBeenCalledWith(mockUsage);
        });

        describe('when deactivating', () => {
            beforeEach(() => {
                jest.spyOn(component.serviceFacade, 'deactivate').mockReturnValue(of(5));
                component.searchPage.searchComponent.selection.select(service);
                fixture.detectChanges();
            });

            it('should send the deactivate request and get the number of updated records', () => {
                jest.spyOn(messageFacade, 'addMessage');
                jest.spyOn(component.serviceFacade, 'deactivate');

                component.deactivate(requestForDeactivation);

                expect(messageFacade.addMessage).toHaveBeenCalledWith(
                    expect.objectContaining({ message: '5 record(s) deactivated', severity: 'success' })
                );
                expect(component.serviceFacade.deactivate).toHaveBeenCalledWith([service.id]);
            });

            it('should only call deactivate once, even with double clicks', fakeAsync(() => {
                component.searchPage.hasEditAccess = true;
                fixture.detectChanges();

                jest.spyOn(component.serviceFacade, 'findUsage').mockImplementation();
                const deactivateButton = fixture.debugElement.query(By.css('#deactivate-button')).nativeElement;

                deactivateButton.click();
                deactivateButton.click();
                deactivateButton.click();
                tick(600);
                fixture.detectChanges();

                expect(component.serviceFacade.findUsage).toHaveBeenCalledTimes(1);
            }));

            it('should redo previous search', () => {
                jest.spyOn(component.searchPage, 'triggerPreviousSearch');

                component.deactivate(requestForDeactivation);

                expect(component.searchPage.triggerPreviousSearch).toHaveBeenCalled();
            });
        });
    });
});
