import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Resources } from '@vioc-angular/central-ui/organization/data-access-resources';
import {
    FeatureSharedStoreSelectionMockModule,
    MockStoreSelectionComponent,
} from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { ServiceExtraCharge, StoreService } from '@vioc-angular/central-ui/service/data-access-store-service';
import {
    FeatureSharedServiceSelectionMockModule,
    MockServiceSelectionComponent,
} from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import {
    QueryPage,
    QueryRestriction,
    QuerySearch,
    QuerySort,
    SearchLine,
} from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureMassUpdateMockModule, MockMassUpdateComponent } from '@vioc-angular/shared/feature-mass-update';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import {
    MockStepperNavigationComponent,
    UiStepperNavigationMockModule,
} from '@vioc-angular/shared/ui-stepper-navigation';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators, UtilColumnModule } from '@vioc-angular/shared/util-column';
import { FormFactory, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { of, Subject } from 'rxjs';
import { StoreServiceModuleForms } from '../../store-service-module-forms';
import { StoreServiceMassUpdateComponent } from './store-service-mass-update.component';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';

describe('StoreServiceMassUpdateComponent', () => {
    let component: StoreServiceMassUpdateComponent;
    let fixture: ComponentFixture<StoreServiceMassUpdateComponent>;
    let messageFacade: MessageFacade;

    const testCompany = { id: 1, code: 'COMP', description: 'compdesc' };
    const testCompany2 = { id: 2, code: 'COMP2', description: 'compdesc2' };
    const testStore = { id: 3, code: 'STORE', description: 'storedesc' };
    const testStore2 = { id: 4, code: 'STORE2', description: 'storedesc2' };
    const testService = { id: 5, code: 'SERV', description: 'servdesc' };
    const testService2 = { id: 6, code: 'SERV2', description: 'servdesc2' };
    const testStoreService = {
        ...new StoreService(),
        extraCharge1: { ...new ServiceExtraCharge() },
        extraCharge2: { ...new ServiceExtraCharge() },
        laborAmount: 1.0,
    };
    const maxPreviewableStores = 55;
    const maxPreviewableServices = 25;

    const nextStep = (index?: number) => {
        const matStepper: MatStepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
        matStepper.next();
        if (index) {
            expect(matStepper.selectedIndex).toEqual(index);
        }
    };
    const getStoreSelectionComponent = (): MockStoreSelectionComponent => {
        return fixture.debugElement.query(By.directive(MockStoreSelectionComponent)).componentInstance;
    };
    const completeCompanySelection = () => {
        jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(
            of({ resources: [testCompany, testCompany2], allCompanies: false })
        );
        fixture.detectChanges();
        component.companyFormControl.setValue(testCompany);
        nextStep(1);
        fixture.detectChanges();
    };
    const completeStoreSelection = () => {
        component.storesFormControl.setValue([testStore, testStore2]);
        nextStep(2);
        fixture.detectChanges();
    };
    const completeStoreSelection_exceedsMaxNumStores = () => {
        component.storesFormControl.setValue(Array(maxPreviewableStores + 1).fill(testStore));
        nextStep(2);
    };
    const getServiceSelectionComponent = (): MockServiceSelectionComponent => {
        return fixture.debugElement.query(By.directive(MockServiceSelectionComponent)).componentInstance;
    };
    const completeServiceSelection = () => {
        component.servicesFormControl.setValue([testService, testService2]);
        nextStep(3);
        fixture.detectChanges();
    };
    const completeServiceSelection_exceedsMaxNumServices = () => {
        component.servicesFormControl.setValue(Array(maxPreviewableServices + 1).fill(testService));
        nextStep(3);
    };
    const getMassUpdateComponent = (): MockMassUpdateComponent => {
        return fixture.debugElement.query(By.directive(MockMassUpdateComponent)).componentInstance;
    };
    const completeServiceInformation = () => {
        const massUpdateComponent = getMassUpdateComponent();
        massUpdateComponent.updatableFieldForm.get('laborAmount').markAsDirty();
        massUpdateComponent.updatableFieldForm.get('laborAmount').setValue(1.23);
        massUpdateComponent.updatableFieldForm.updateValueAndValidity();
        nextStep(4);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatStepperModule,
                UiStepperNavigationMockModule,
                MatSelectModule,
                NoopAnimationsModule,
                UiLoadingMockModule,
                ReactiveFormsModule,
                UtilFormMockModule,
                FeatureSharedStoreSelectionMockModule,
                FeatureSharedServiceSelectionMockModule,
                FeatureMassUpdateMockModule,
                MatListModule,
                UtilColumnModule,
                CommonFunctionalityModule,
            ],
            declarations: [StoreServiceMassUpdateComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                {
                    provide: HttpClient,
                    useValue: {
                        get() {
                            return of([]);
                        },
                    },
                },
                FormFactory,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        StoreServiceModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(StoreServiceMassUpdateComponent);
        component = fixture.componentInstance;
        messageFacade = TestBed.inject(MessageFacade);
    });

    describe('creation', () => {
        beforeEach(() => {
            // trigger ngOnInit
            fixture.detectChanges();
        });

        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should pass stepper to vioc angular stepper', () => {
            const matStepper = fixture.debugElement.query(By.directive(MatStepper));
            expect(matStepper).toBeTruthy();
            const viocStepper = fixture.debugElement.query(By.directive(MockStepperNavigationComponent));
            expect(viocStepper).toBeTruthy();

            expect((viocStepper.componentInstance as MockStepperNavigationComponent).stepper).toEqual(
                matStepper.componentInstance
            );
        });
    });

    describe('company selection', () => {
        const openCompanyDropdown = () => {
            const companySelect = fixture.debugElement.query(By.css('#company-select'));
            expect(companySelect).toBeTruthy();
            companySelect.nativeElement.click();
            fixture.detectChanges();
        };

        it('should populate company dropdown with companies user has security for', () => {
            const resourceFacadeSpy = jest
                .spyOn(component['resourceFacade'], 'findCompaniesByRoles')
                .mockReturnValue(of({ resources: [testCompany, testCompany2], allCompanies: false }));
            fixture.detectChanges();
            openCompanyDropdown();
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            // including blank option
            expect(options.length).toEqual(3);
            expect(options[1].nativeElement.textContent).toEqual(`${testCompany.code} - ${testCompany.description}`);
            expect(options[2].nativeElement.textContent).toEqual(`${testCompany2.code} - ${testCompany2.description}`);
            expect(resourceFacadeSpy).toHaveBeenCalledWith(['ROLE_STORE_SERVICE_UPDATE']);
        });

        it('should include a blank option for company dropdown', () => {
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(
                of({ resources: [testCompany, testCompany2], allCompanies: false })
            );
            fixture.detectChanges();
            openCompanyDropdown();
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            expect(options[0].nativeElement.textContent.trim()).toEqual('');
        });

        it('should display loading until companies are loaded', fakeAsync(() => {
            const companySubject = new Subject<Resources>();
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(companySubject);
            fixture.detectChanges();
            let companySelect = fixture.debugElement.query(By.css('#company-select'));
            // mock loading directive hides component
            expect(companySelect).toBeFalsy();
            companySubject.next({ resources: [testCompany], allCompanies: false });
            flush();
            fixture.detectChanges();
            tick(100); //clear timers in queue
            companySelect = fixture.debugElement.query(By.css('#company-select'));
            expect(companySelect).toBeTruthy();
        }));

        it('should allow selecting a company', () => {
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(
                of({ resources: [testCompany, testCompany2], allCompanies: false })
            );
            fixture.detectChanges();
            expect(component.companyFormControl.value).toBeFalsy();
            openCompanyDropdown();
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            options[1].nativeElement.click();
            fixture.detectChanges();
            expect(component.companyFormControl.value).toEqual(testCompany);
        });

        it('should prevent going to next step until a company is selected', () => {
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(
                of({ resources: [testCompany, testCompany2], allCompanies: false })
            );
            fixture.detectChanges();
            nextStep(0);
            openCompanyDropdown();
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            options[1].nativeElement.click();
            fixture.detectChanges();
            nextStep(1);
        });

        it('should display error for the company form control', () => {
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(
                of({ resources: [testCompany, testCompany2], allCompanies: false })
            );
            fixture.detectChanges();
            const error = { error: 'testError' };
            component.companyFormControl.updateValueAndValidity();
            component.companyFormControl.markAsTouched();
            component.companyFormControl.setErrors(error);
            fixture.detectChanges();
            const formError = fixture.debugElement.query(By.css('mat-error'));
            expect(formError).toBeTruthy();
            // Mock form error directive uses JSON.stringify
            expect(formError.nativeElement.textContent.trim()).toEqual(JSON.stringify(error));
        });

        it('should clear selected stores when a company is selected', fakeAsync(() => {
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(
                of({ resources: [testCompany, testCompany2], allCompanies: false })
            );
            fixture.detectChanges();
            flush();
            const storeSelection = getStoreSelectionComponent();
            storeSelection.control.setValue([testStore]);
            flush();
            jest.spyOn(storeSelection, 'clear');
            openCompanyDropdown();
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            options[1].nativeElement.click();
            fixture.detectChanges();
            flush();
            expect(storeSelection.clear).toHaveBeenCalled();
            expect.assertions(2);
        }));

        it('should clear selected services when a company is selected', fakeAsync(() => {
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValue(
                of({ resources: [testCompany, testCompany2], allCompanies: false })
            );
            fixture.detectChanges();
            flush();
            const serviceSelection = getServiceSelectionComponent();
            serviceSelection.control.setValue([testService]);
            flush();
            jest.spyOn(serviceSelection, 'clear');
            openCompanyDropdown();
            const options = fixture.debugElement.queryAll(By.directive(MatOption));
            options[1].nativeElement.click();
            fixture.detectChanges();
            flush();
            expect(serviceSelection.clear).toHaveBeenCalled();
            expect.assertions(2);
        }));
    });

    describe('store selection', () => {
        beforeEach(() => {
            completeCompanySelection();
        });

        it('should be able to select stores', () => {
            getStoreSelectionComponent().control.setValue([testStore, testStore2]);
            expect(component.storesFormControl.value).toEqual([testStore, testStore2]);
        });

        it('should search for stores only in the selected company', async () => {
            const responseEntity: ResponseEntity<Described> = { content: [testStore, testStore2], totalElements: 2 };
            const storeSearchSpy = jest
                .spyOn(component['resourceFacade'], 'searchStoresByRoles')
                .mockReturnValue(of(responseEntity));
            const column: Column = Column.of({
                apiFieldPath: 'code',
                name: 'Store Number',
                type: 'string',
            });
            const queryRestriction = new SearchLine(column, Comparators.startsWith, 's').toQueryRestriction();
            const querySearch: QuerySearch = {
                queryRestrictions: [queryRestriction],
                page: new QueryPage(0, 10),
                sort: new QuerySort(column),
            };
            const companyQueryRestriction: QueryRestriction = {
                fieldPath: 'company',
                dataType: 'company',
                operator: Comparators.equalTo.value,
                values: [testCompany.id],
            };
            component.storeSelection.searchFn(querySearch);
            expect(storeSearchSpy).toHaveBeenCalledWith(
                {
                    ...querySearch,
                    queryRestrictions: expect.arrayContaining([queryRestriction, companyQueryRestriction]),
                },
                ['ROLE_STORE_SERVICE_UPDATE'],
                'FULL'
            );
        });

        it('should properly secure store selection', () => {
            expect(getStoreSelectionComponent().accessRoles).toEqual(['ROLE_STORE_SERVICE_UPDATE']);
        });

        it('should prevent going to the next step until a store is selected', () => {
            nextStep(1);
            getStoreSelectionComponent().control.setValue([testStore]);
            nextStep(2);
        });

        it('should clear selected services and service search results when store selection changes', fakeAsync(() => {
            jest.spyOn(component['resourceFacade'], 'searchStoresByRoles').mockImplementation();
            const serviceSelection = getServiceSelectionComponent();
            jest.spyOn(serviceSelection, 'clear');
            getStoreSelectionComponent().control.setValue([testStore2]);
            flush();
            expect(serviceSelection.clear).toHaveBeenCalled();
            expect.assertions(2);
        }));
    });

    describe('service selection', () => {
        beforeEach(() => {
            completeCompanySelection();
            completeStoreSelection();
        });

        it('should be able to select services', () => {
            getServiceSelectionComponent().control.setValue([testService, testService2]);
            expect(component.servicesFormControl.value).toEqual([testService, testService2]);
        });

        it('should search for only the selected stores', async () => {
            const responseEntity: ResponseEntity<Described> = {
                content: [testService, testService2],
                totalElements: 2,
            };
            const serviceSearchSpy = jest
                .spyOn(component['storeServiceFacade'], 'searchAssignedServicesByStore')
                .mockReturnValue(of(responseEntity));
            const column: Column = Column.of({
                apiFieldPath: 'code',
                name: 'Service Code',
                type: 'string',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.startsWith, 's').toQueryRestriction()],
                page: new QueryPage(0, 10),
                sort: new QuerySort(column),
            };
            component.serviceSelection.searchFn(querySearch);
            // selected in completeStoreSelection()
            expect(serviceSearchSpy).toHaveBeenCalledWith(querySearch, [testStore, testStore2]);
        });

        it('should prevent going to the next step until a service is selected', () => {
            nextStep(2);
            getServiceSelectionComponent().control.setValue([testService]);
            nextStep(3);
        });
    });

    describe('service information', () => {
        beforeEach(() => {
            completeCompanySelection();
            completeStoreSelection();
            completeServiceSelection();
        });

        it('should have store service mass update', () => {
            const massUpdateComponent = getMassUpdateComponent();
            massUpdateComponent.updatableFieldForm.setValue(testStoreService);
            expect(component.storeServiceFormControl.value).toEqual(testStoreService);
            expect(massUpdateComponent.columns).toEqual(component.columns);
            expect(massUpdateComponent.nested).toBeFalsy();
        });

        it('should have no defaulted values', () => {
            expect(component.storeServiceFormControl.value).toEqual({
                ...new StoreService(),
                extraCharge1: { ...new ServiceExtraCharge() },
                extraCharge2: { ...new ServiceExtraCharge() },
            });
        });

        it('should prevent going to the next screen until a value is added', () => {
            nextStep(3);
            getMassUpdateComponent().updatableFieldForm.get('laborAmount').markAsDirty();
            getMassUpdateComponent().updatableFieldForm.updateValueAndValidity();
            nextStep(4);
        });
    });

    describe('read more option', () => {
        it('should not display read more option for store and service lists', () => {
            completeCompanySelection();
            completeStoreSelection();
            completeServiceSelection();
            completeServiceInformation();
            fixture.detectChanges();

            let storeLabel = fixture.debugElement.query(By.css('#store-label'));
            let serviceLabel = fixture.debugElement.query(By.css('#service-label'));

            expect(storeLabel).toBeFalsy();
            expect(serviceLabel).toBeFalsy();
        });

        it('should display read more option for store and service lists', () => {
            completeCompanySelection();
            completeStoreSelection_exceedsMaxNumStores();
            completeServiceSelection_exceedsMaxNumServices();
            completeServiceInformation();
            fixture.detectChanges();

            let storeLabel = fixture.debugElement.query(By.css('#store-label'));
            let serviceLabel = fixture.debugElement.query(By.css('#service-label'));

            expect(storeLabel).toBeTruthy();
            expect(serviceLabel).toBeTruthy();
        });
    });

    describe('preview', () => {
        const clickUpdateButton = () => fixture.debugElement.query(By.css('#update-action')).nativeElement.click();

        beforeEach(() => {
            completeCompanySelection();
            completeStoreSelection();
            completeServiceSelection();
            completeServiceInformation();
        });

        it('should display preview', () => {
            expect(fixture.debugElement.query(By.css('#preview')).nativeElement.textContent).toContain(
                'These services will be updated:  SERV, SERV2At the following applicable stores: STORE, STORE2'
            );

            let services = fixture.debugElement.query(By.css('#service-list')).nativeElement.textContent;
            let stores = fixture.debugElement.query(By.css('#store-list')).nativeElement.textContent;
            expect(services).toContain('SERV, SERV2');
            expect(stores).toContain('STORE, STORE2');

            const servicePriceControl = getMassUpdateComponent().updatableFieldForm.get('servicePrice');
            servicePriceControl.setValue(4.56);
            servicePriceControl.markAsDirty();
            getMassUpdateComponent().updatableFieldForm.updateValueAndValidity();
            fixture.detectChanges();

            services = fixture.debugElement.query(By.css('#service-list')).nativeElement.textContent;
            stores = fixture.debugElement.query(By.css('#store-list')).nativeElement.textContent;
            expect(services).toContain('SERV, SERV2');
            expect(stores).toContain('STORE, STORE2');
        });

        it('should update when update button is clicked', fakeAsync(() => {
            const massUpdateSpy = jest.spyOn(component['storeServiceFacade'], 'massUpdate').mockReturnValue(of(4));
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();

            // values from complete<Step> methods
            expect(massUpdateSpy).toHaveBeenCalledWith({
                stores: [testStore, testStore2],
                services: [testService, testService2],
                storeService: {
                    ...new StoreService(),
                    extraCharge1: { ...new ServiceExtraCharge() },
                    extraCharge2: { ...new ServiceExtraCharge() },
                    laborAmount: 1.23,
                },
                updateFields: ['laborAmount'],
            });
        }));

        it('should only call update once, even with double clicks', fakeAsync(() => {
            const massUpdateSpy = jest.spyOn(component['storeServiceFacade'], 'massUpdate').mockReturnValue(of(4));

            clickUpdateButton();
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            expect(massUpdateSpy).toHaveBeenCalledTimes(1);
        }));

        it('should include fields for nested columns', fakeAsync(() => {
            const massUpdateComponent = getMassUpdateComponent();
            massUpdateComponent.updatableFieldForm.get('scheduledChangeDate').markAsDirty();
            massUpdateComponent.updatableFieldForm.get('scheduledChangePrice').markAsDirty();
            const massUpdateSpy = jest.spyOn(component['storeServiceFacade'], 'massUpdate').mockReturnValue(of(4));
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();

            expect(massUpdateSpy).toHaveBeenCalledWith({
                stores: expect.anything(),
                services: expect.anything(),
                storeService: expect.anything(),
                updateFields: ['laborAmount', 'scheduledChangeDate', 'scheduledChangePrice'],
            });
        }));

        it('should display loading overlay while processing', fakeAsync(() => {
            const updateSubject = new Subject<number>();
            component['storeServiceFacade'].massUpdate = jest.fn(() => updateSubject);
            const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                By.directive(MockLoadingOverlayComponent)
            ).componentInstance;
            tick(600);
            fixture.detectChanges();
            expect(loadingOverlay.loading).toBeFalsy();

            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            expect(loadingOverlay.loading).toBeTruthy();

            updateSubject.next(4);
            flush();
            fixture.detectChanges();

            expect(loadingOverlay.loading).toBeFalsy();
        }));

        it('should cancel loading if an update error occurs', fakeAsync(() => {
            const updateSubject = new Subject<number>();
            component['storeServiceFacade'].massUpdate = jest.fn(() => updateSubject);
            const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                By.directive(MockLoadingOverlayComponent)
            ).componentInstance;
            expect(loadingOverlay.loading).toBeFalsy();

            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            expect(loadingOverlay.loading).toBeTruthy();

            expect(() => {
                updateSubject.error('An error occurred');
                tick(600);
            }).toThrow();
            fixture.detectChanges();

            expect(loadingOverlay.loading).toBeFalsy();
        }));

        it('should display a message with the number of updated records', fakeAsync(() => {
            component['storeServiceFacade'].massUpdate = jest.fn(() => of(4));
            jest.spyOn(messageFacade, 'addSaveCountMessage');
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();

            expect(messageFacade.addSaveCountMessage).toHaveBeenCalledWith(4, 'updated');
        }));

        it('should reset stepper when update has completed', fakeAsync(() => {
            component['storeServiceFacade'].massUpdate = jest.fn(() => of(4));
            const stepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance as MatStepper;
            jest.spyOn(stepper, 'reset');
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            expect(stepper.reset).toHaveBeenCalled();
        }));

        it('should reset selection components and mass update component on update', fakeAsync(() => {
            component['storeServiceFacade'].massUpdate = jest.fn(() => of(4));
            jest.spyOn(getStoreSelectionComponent(), 'clear');
            jest.spyOn(getServiceSelectionComponent(), 'clear');
            jest.spyOn(getMassUpdateComponent(), 'reset');
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            expect(getStoreSelectionComponent().clear).toHaveBeenCalled();
            expect(getServiceSelectionComponent().clear).toHaveBeenCalled();
            expect(getMassUpdateComponent().reset).toHaveBeenCalled();
        }));
    });

    describe('unsavedChanges', () => {
        it('should track if the form have unsavedChanges', () => {
            expect(component.unsavedChanges).toBeFalsy();
            component.form.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        });

        it('should track if the company form have unsavedChanges', () => {
            expect(component.unsavedChanges).toBeFalsy();
            component.companyFormControl.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        });
    });
});
