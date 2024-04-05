import { TextFieldModule } from '@angular/cdk/text-field';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, EventEmitter, Input, Output, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    CarFaxMappingFacade,
    ServiceCategoryCarFaxMapping,
} from '@vioc-angular/central-ui/service/data-access-car-fax-mapping';
import { CarSystemFacade } from '@vioc-angular/central-ui/service/data-access-car-system';
import { ServiceFacade } from '@vioc-angular/central-ui/service/data-access-service';
import {
    PreventativeMaintenanceQualifier,
    ServiceCategory,
    ServiceCategoryFacade,
    ServiceCategoryInfo,
    ServiceCategoryMotorInfo,
} from '@vioc-angular/central-ui/service/data-access-service-category';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormErrorMapping, FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { of, Subject } from 'rxjs';
import { ServiceCategoryModuleForms } from '../../service-category-module-forms';
import { ServiceCategoryComponent } from './service-category.component';
import { CommonFunctionalityModule, Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';

@Component({
    selector: 'vioc-angular-service-category-car-fax-mapping',
    template: '',
})
class MockServiceCategoryCarFaxMappingComponent {
    @Input() carFaxMappingFormArray;
    @Input() isViewMode;
    @Input() carFaxServiceNames: string[];
}

@Component({
    selector: 'vioc-angular-service-category-motor-info',
    template: '',
})
class MockServiceCategoryMotorInfoComponent {
    @Input() motorInfoFormArray;
    @Input() isViewMode;
}

@Component({
    selector: 'vioc-angular-preventative-maintenance-qualifier',
    template: '',
})
class MockPreventativeMaintenanceQualifierComponent {
    @Input() pmQualifierFormArray;
    @Input() isViewMode;
}

@Component({
    selector: 'vioc-angular-filtered-input',
    template: ` <mat-error
        *viocAngularFormError="valueControl.errors; customErrorMapping: customErrorMapping; let error"
        >{{ error }}</mat-error
    >`,
})
class MockFilteredInputComponent {
    @Input() options: Described[];
    @Input() valueControl: AbstractControl;
    @Input() editable: boolean;
    @Input() nullable: boolean;
    @Input() placeHolder: string;
    @Input() compareWith;
    @Input() displayFn: string;
    @Input() customErrorMapping: FormErrorMapping;
    @Output() selectionChange = new EventEmitter<MatSelectChange>();
}

describe('ServiceCategoryComponent', () => {
    let component: ServiceCategoryComponent;
    let fixture: ComponentFixture<ServiceCategoryComponent>;
    let commonCodeFacade: CommonCodeFacade;
    let serviceCategoryFacade: ServiceCategoryFacade;
    let carSystemFacade: CarSystemFacade;
    let serviceFacade: ServiceFacade;
    let carFaxMappingFacade: CarFaxMappingFacade;
    const routeParams = new Subject();

    // test data
    const testDescribe: Described = {
        id: 1,
        code: 'TSC',
        description: 'Test Service Category',
        version: 1,
    };

    const testServiceCategoryParent: ServiceCategory = {
        id: 1,
        code: 'TSC',
        description: 'Test Service Category',
        active: true,
        version: 1,
        parentCategory: null,
        defaultService: { ...testDescribe, code: 'DFT', description: 'Test Default Service' },
        nacsProductCode: { ...testDescribe, code: 'NACS', description: 'Test NACS Code' },
        fleetProductCode: { ...testDescribe, code: 'FLEET', description: 'Test Fleet Code' },
        nocrGroup: { ...testDescribe, code: 'NOCR', description: 'Test Nocr Group' },
        premium: false,
        excludeFromMetrics: false,
        serviceInfo: {
            id: 1073,
            serviceCategory: { ...testDescribe },
            appearOnWorkOrder: false,
            carSystem: { ...testDescribe, code: 'SAFETY', description: 'Safety' },
            serviceTime: '45 Minutes',
            competitivePrice: 105.99,
            importance: 'Helps test Service Category',
            customerDisplayName: 'Test Customer Display Name',
            technicalInformationRequired: false,
            recommendationOrder: 1,
            reportGroup: { ...testDescribe, code: 'RPT', description: 'Test Report Group' },
            version: 1,
        } as ServiceCategoryInfo,
        motorInfo: [
            {
                id: 1,
                serviceCategory: { ...testDescribe },
                item: 'TG',
                action: 'None',
                version: 1,
            },
            {
                id: 2,
                serviceCategory: { ...testDescribe },
                item: 'TCR',
                action: 'REP',
                version: 1,
            },
        ] as ServiceCategoryMotorInfo[],
        preventativeMaintenanceQualifiers: [
            {
                id: 1,
                serviceCategory: { ...testDescribe },
                transmissionType: { ...testDescribe, code: 'AT', description: 'Automatic' },
                qualifier: 'AT',
                version: 1,
            },
        ] as PreventativeMaintenanceQualifier[],
        carFaxMapping: [
            {
                id: 1,
                serviceCategory: { ...testDescribe },
                carFaxServiceName: 'Test CarFax Service Name',
                excludeFromMapping: false,
                version: 1,
            },
        ] as ServiceCategoryCarFaxMapping[],
        updatedBy: null,
        updatedOn: null,
    };

    const testChildCategory: ServiceCategory = {
        ...testServiceCategoryParent,
        id: 2,
        code: 'TCC',
        description: 'Test Child Category',
        parentCategory: { ...testDescribe },
        premium: false,
        excludeFromMetrics: false,
        carFaxMapping: [],
        motorInfo: [],
        preventativeMaintenanceQualifiers: [],
        serviceInfo: null,
    };

    const testAddServiceCategory: ServiceCategory = {
        code: 'TESTADD',
        description: 'Test add category',
        active: true,
        nacsProductCode: { ...testDescribe, code: 'NACS', description: 'Test NACS Code' },
        serviceInfo: { ...new ServiceCategoryInfo(), appearOnWorkOrder: false, technicalInformationRequired: false },
        excludeFromMetrics: false,
        premium: false,
        carFaxMapping: [],
        motorInfo: [],
        preventativeMaintenanceQualifiers: [],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                ServiceCategoryComponent,
                MockServiceCategoryCarFaxMappingComponent,
                MockServiceCategoryMotorInfoComponent,
                MockPreventativeMaintenanceQualifierComponent,
                MockFilteredInputComponent,
            ],
            imports: [
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatButtonModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatSelectModule,
                NoopAnimationsModule,
                TextFieldModule,
                UiActionBarModule,
                UiAuditModule,
                UiCurrencyPrefixModule,
                UiLoadingMockModule,
                UtilFormModule,
                UiDialogMockModule,
                CommonFunctionalityModule,
                UiInfoButtonModule,
            ],
            providers: [
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/maintenance/service-category' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        ServiceCategoryModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ServiceCategoryComponent);
        component = fixture.componentInstance;
        commonCodeFacade = component.commonCodeFacade;
        serviceCategoryFacade = component.serviceCategoryFacade;
        serviceFacade = component.serviceFacade;
        carSystemFacade = component.carSystemFacade;
        carFaxMappingFacade = component.carFaxMappingFacade;

        // Facade mocking
        serviceCategoryFacade.findByCode = jest.fn();
        commonCodeFacade.findByType = jest.fn();
        serviceFacade.findActive = jest.fn();
        carSystemFacade.findActive = jest.fn();
        carFaxMappingFacade.getServiceNames = jest.fn();
    });

    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: ServiceCategory = testServiceCategoryParent,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({ accessMode: accessMode, categoryCode: model.code }),
        } as ActivatedRouteSnapshot;
        const serviceCategory = { ...new ServiceCategory(), ...model };
        jest.spyOn(serviceCategoryFacade, 'findByCode').mockReturnValue(of(serviceCategory));

        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display overlay if it is loading', fakeAsync(() => {
        initialize('view');
        const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
            By.directive(MockLoadingOverlayComponent)
        ).componentInstance;

        component.isLoading = false;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(false);

        component.isLoading = true;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(true);
    }));

    describe('with cancel button clicked', () => {
        let router: Router;
        beforeEach(() => {
            router = TestBed.inject(Router);
        });
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('edit');
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        const expectDropdownsLoad = () => {
            expect(serviceFacade.findActive).not.toHaveBeenCalled();
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('BILLCODE');
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('NOCR_METRICS_GROUP');
            expect(commonCodeFacade.findByType).toHaveBeenCalledWith('NACSPRODUCT');
        };

        describe('view mode', () => {
            it('should load serviceCategory data', fakeAsync(() => {
                initialize('view');
                expect(serviceCategoryFacade.findByCode).toHaveBeenCalledWith(testServiceCategoryParent.code);
                expect(commonCodeFacade.findByType).not.toHaveBeenCalled();
                expect(serviceFacade.findActive).not.toHaveBeenCalled();
                expect(component.form.enabled).toBeFalsy();
            }));

            it('should disabled the form', fakeAsync(() => {
                initialize('view');
                expect(component.form.disabled).toBe(true);
            }));

            it('should load carfax dropdown and pass to carfax component', fakeAsync(() => {
                const category = {
                    ...testServiceCategoryParent,
                    carFaxMapping: [
                        ...testServiceCategoryParent.carFaxMapping,
                        { ...testServiceCategoryParent.carFaxMapping[0], carFaxServiceName: 'Another service' },
                    ],
                };
                initialize('view', category);

                expect(
                    (
                        fixture.debugElement.query(By.directive(MockServiceCategoryCarFaxMappingComponent))
                            .componentInstance as MockServiceCategoryCarFaxMappingComponent
                    ).carFaxServiceNames
                ).toEqual(category.carFaxMapping.map((cfm) => cfm.carFaxServiceName));
            }));
        });

        describe('edit mode', () => {
            it('should load dropdowns with parent related data', fakeAsync(() => {
                initialize('edit', testServiceCategoryParent);

                expect(carSystemFacade.findActive).toHaveBeenCalled();
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('SCATRPTGRP');
                expect(serviceCategoryFacade.findByCode).toHaveBeenCalledWith(testServiceCategoryParent.code);
                expectDropdownsLoad();
            }));

            it('should load dropdowns without parent related data', fakeAsync(() => {
                initialize('edit', testChildCategory);

                expect(carSystemFacade.findActive).not.toHaveBeenCalled();
                expect(commonCodeFacade.findByType).not.toHaveBeenCalledWith('SCATRPTGRP');
                expect(serviceCategoryFacade.findByCode).toHaveBeenCalledWith(testChildCategory.code);
                expectDropdownsLoad();
            }));

            it('should create a new form with an updated model when reloading', fakeAsync(() => {
                Object.defineProperty(component, 'updatedModel', {
                    get: jest.fn(() => testServiceCategoryParent),
                    set: jest.fn(),
                });
                initialize('edit');

                jest.spyOn(component, 'createForm').mockImplementation();
                jest.spyOn(component.form, 'getControl').mockReturnValue(new FormControl());
                component.reload();
                // test if reload method was called, creating a new form with an updated model
                expect(component.createForm).toHaveBeenCalledWith(component.updatedModel);
            }));

            it('should load carfax dropdown and pass to carfax component', fakeAsync(() => {
                const services = ['Service 1', 'Service 2'];
                jest.spyOn(carFaxMappingFacade, 'getServiceNames').mockReturnValue(of(services));
                initialize('edit', testServiceCategoryParent);

                expect(carFaxMappingFacade.getServiceNames).toHaveBeenCalled();
                expect(
                    (
                        fixture.debugElement.query(By.directive(MockServiceCategoryCarFaxMappingComponent))
                            .componentInstance as MockServiceCategoryCarFaxMappingComponent
                    ).carFaxServiceNames
                ).toEqual(services);
            }));
        });

        describe('add mode', () => {
            it('should load dropdowns', fakeAsync(() => {
                initialize('add');
                expectDropdownsLoad();
            }));

            it('should default boolean values', fakeAsync(() => {
                initialize('add');
                expect(component.model.active).toBe(true);
                expect(component.model.excludeFromMetrics).toBe(false);
                expect(component.model.premium).toBe(false);
                expect(component.model.serviceInfo).toBeTruthy();
                expect(component.model.serviceInfo.appearOnWorkOrder).toBe(false);
                expect(component.model.serviceInfo.technicalInformationRequired).toBe(false);
            }));
        });
    });

    describe.each`
        accessMode | control                           | value                            | enabled
        ${'view'}  | ${'code'}                         | ${'TSC'}                         | ${false}
        ${'view'}  | ${'description'}                  | ${'Test Service Category'}       | ${false}
        ${'view'}  | ${'active'}                       | ${true}                          | ${false}
        ${'view'}  | ${'carSystem'}                    | ${'Safety'}                      | ${false}
        ${'view'}  | ${'appearOnWorkOrder'}            | ${false}                         | ${false}
        ${'view'}  | ${'defaultService'}               | ${'DFT - Test Default Service'}  | ${false}
        ${'view'}  | ${'recommendationOrder'}          | ${'1'}                           | ${false}
        ${'view'}  | ${'competitivePrice'}             | ${'105.99'}                      | ${false}
        ${'view'}  | ${'serviceTime'}                  | ${'45 Minutes'}                  | ${false}
        ${'view'}  | ${'importance'}                   | ${'Helps test Service Category'} | ${false}
        ${'view'}  | ${'customerDisplayName'}          | ${'Test Customer Display Name'}  | ${false}
        ${'view'}  | ${'reportGroup'}                  | ${'Test Report Group'}           | ${false}
        ${'view'}  | ${'nocrGroup'}                    | ${'Test Nocr Group'}             | ${false}
        ${'view'}  | ${'premium'}                      | ${false}                         | ${false}
        ${'view'}  | ${'excludeFromMetrics'}           | ${false}                         | ${false}
        ${'view'}  | ${'technicalInformationRequired'} | ${false}                         | ${false}
        ${'view'}  | ${'fleetProductCode'}             | ${'Test Fleet Code'}             | ${false}
        ${'view'}  | ${'nacsProductCode'}              | ${'Test NACS Code'}              | ${false}
        ${'edit'}  | ${'code'}                         | ${'TSC'}                         | ${false}
        ${'edit'}  | ${'description'}                  | ${'Test Service Category'}       | ${true}
        ${'edit'}  | ${'active'}                       | ${true}                          | ${false}
        ${'edit'}  | ${'appearOnWorkOrder'}            | ${false}                         | ${true}
        ${'edit'}  | ${'recommendationOrder'}          | ${'1'}                           | ${true}
        ${'edit'}  | ${'competitivePrice'}             | ${'105.99'}                      | ${true}
        ${'edit'}  | ${'serviceTime'}                  | ${'45 Minutes'}                  | ${true}
        ${'edit'}  | ${'importance'}                   | ${'Helps test Service Category'} | ${true}
        ${'edit'}  | ${'customerDisplayName'}          | ${'Test Customer Display Name'}  | ${true}
        ${'edit'}  | ${'premium'}                      | ${false}                         | ${true}
        ${'edit'}  | ${'excludeFromMetrics'}           | ${false}                         | ${true}
        ${'edit'}  | ${'technicalInformationRequired'} | ${false}                         | ${true}
        ${'add'}   | ${'code'}                         | ${''}                            | ${true}
        ${'add'}   | ${'description'}                  | ${''}                            | ${true}
        ${'add'}   | ${'active'}                       | ${true}                          | ${true}
        ${'add'}   | ${'appearOnWorkOrder'}            | ${false}                         | ${true}
        ${'add'}   | ${'recommendationOrder'}          | ${''}                            | ${true}
        ${'add'}   | ${'competitivePrice'}             | ${''}                            | ${true}
        ${'add'}   | ${'serviceTime'}                  | ${''}                            | ${true}
        ${'add'}   | ${'importance'}                   | ${''}                            | ${true}
        ${'add'}   | ${'customerDisplayName'}          | ${''}                            | ${true}
        ${'add'}   | ${'premium'}                      | ${false}                         | ${true}
        ${'add'}   | ${'excludeFromMetrics'}           | ${false}                         | ${true}
        ${'add'}   | ${'technicalInformationRequired'} | ${false}                         | ${true}
    `('fields', ({ accessMode, control, value, enabled }) => {
        it(`should display input for ${control} as ${value} and ${
            enabled ? '' : 'not '
        }be enabled when category is a parent while in ${accessMode} mode`, fakeAsync(() => {
            initialize(accessMode);
            expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
        }));
    });

    describe.each`
        accessMode | value    | enabled
        ${'edit'}  | ${true}  | ${false}
        ${'edit'}  | ${false} | ${true}
        ${'add'}   | ${true}  | ${true}
        ${'add'}   | ${false} | ${true}
    `('active', ({ accessMode, value, enabled }) => {
        const testActive: ServiceCategory = {
            ...testChildCategory,
            active: value,
        };
        it(`should ${
            enabled ? '' : 'not '
        }be enabled if its value is ${value} when in ${accessMode} mode`, fakeAsync(() => {
            initialize(accessMode, testActive);
            if (accessMode === 'add') {
                component.form.patchControlValue('active', value);
                component.form.updateValueAndValidity();
                fixture.detectChanges();
            }
            expectInput(fixture, 'active').toHaveValue(value).toBeEnabled(enabled);
        }));
    });

    describe(`with dropdowns`, () => {
        describe.each`
            accessMode | control               | dropdownValue                                        | expectedValue
            ${'edit'}  | ${'reportGroup'}      | ${testServiceCategoryParent.serviceInfo.reportGroup} | ${testServiceCategoryParent.serviceInfo.reportGroup.description}
            ${'edit'}  | ${'nocrGroup'}        | ${testServiceCategoryParent.nocrGroup}               | ${testServiceCategoryParent.nocrGroup.description}
            ${'edit'}  | ${'fleetProductCode'} | ${testServiceCategoryParent.fleetProductCode}        | ${testServiceCategoryParent.fleetProductCode.description}
            ${'edit'}  | ${'nacsProductCode'}  | ${testServiceCategoryParent.nacsProductCode}         | ${testServiceCategoryParent.nacsProductCode.description}
            ${'add'}   | ${'reportGroup'}      | ${testServiceCategoryParent.serviceInfo.reportGroup} | ${''}
            ${'add'}   | ${'nocrGroup'}        | ${testServiceCategoryParent.nocrGroup}               | ${''}
            ${'add'}   | ${'fleetProductCode'} | ${testServiceCategoryParent.fleetProductCode}        | ${''}
            ${'add'}   | ${'nacsProductCode'}  | ${testServiceCategoryParent.nacsProductCode}         | ${''}
        `('commoncode dropdowns', ({ accessMode, control, dropdownValue, expectedValue }) => {
            it(`should display dropdown input for ${control} as ${expectedValue} and be enabled when a parent category when in ${accessMode} mode`, fakeAsync(() => {
                // Populate dropdown
                jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of([dropdownValue]));
                initialize(accessMode);
                expectInput(fixture, control).toHaveValue(expectedValue).toBeEnabled(true);
            }));
        });

        it.each`
            accessMode | value
            ${'edit'}  | ${testServiceCategoryParent.serviceInfo.carSystem.description}
            ${'add'}   | ${''}
        `(
            `should display dropdown input for car system when in $accessMode mode`,
            fakeAsync(({ accessMode, value }) => {
                jest.spyOn(carSystemFacade, 'findActive').mockReturnValue(
                    of([testServiceCategoryParent.serviceInfo.carSystem])
                );
                initialize(accessMode);
                expectInput(fixture, 'carSystem').toHaveValue(value).toBeEnabled(true);
            })
        );

        describe.each`
            accessMode | value                                                                                                           | enabled
            ${'edit'}  | ${testServiceCategoryParent.defaultService.code + ' - ' + testServiceCategoryParent.defaultService.description} | ${true}
            ${'add'}   | ${''}                                                                                                           | ${false}
        `('default service', ({ accessMode, value, enabled }) => {
            it(`should display dropdown input $value when in $accessMode mode`, fakeAsync(() => {
                jest.spyOn(serviceFacade, 'findActiveByCategory').mockReturnValue(
                    of([testServiceCategoryParent.defaultService])
                );
                initialize(accessMode);
                expectInput(fixture, 'defaultService').toHaveValue(value).toBeEnabled(enabled);
            }));
        });
    });

    // don't need to test enabled inputs, since they wont exist for a child category
    describe.each`
        control                           | present
        ${'carSystem'}                    | ${false}
        ${'appearOnWorkOrder'}            | ${false}
        ${'technicalInformationRequired'} | ${false}
        ${'defaultService'}               | ${false}
        ${'recommendationOrder'}          | ${false}
        ${'competitivePrice'}             | ${false}
        ${'serviceTime'}                  | ${false}
        ${'importance'}                   | ${false}
        ${'customerDisplayName'}          | ${false}
        ${'reportGroup'}                  | ${false}
    `('serviceInfo', ({ control, present }) => {
        it(`should ${present ? '' : 'not '}display input for ${control} when it is a child category`, fakeAsync(() => {
            initialize('view', testChildCategory);
            expectInput(fixture, control).toBePresent(present);
        }));
    });

    describe.each`
        isRootCategory | directive                                        | sectionName
        ${false}       | ${MockServiceCategoryCarFaxMappingComponent}     | ${'CarFaxMapping'}
        ${true}        | ${MockServiceCategoryCarFaxMappingComponent}     | ${'CarFaxMapping'}
        ${false}       | ${MockPreventativeMaintenanceQualifierComponent} | ${'PreventativeMaintenanceQualifier'}
        ${true}        | ${MockPreventativeMaintenanceQualifierComponent} | ${'PreventativeMaintenanceQualifier'}
        ${false}       | ${MockServiceCategoryMotorInfoComponent}         | ${'MotorInfo'}
        ${true}        | ${MockServiceCategoryMotorInfoComponent}         | ${'MotorInfo'}
    `('child categories', ({ isRootCategory, directive, sectionName }) => {
        it(`should ${isRootCategory ? '' : 'not '}display the ${sectionName} section`, fakeAsync(() => {
            if (isRootCategory) {
                initialize('view');
                expect(fixture.debugElement.query(By.directive(directive))).toBeTruthy();
            } else {
                initialize('view', testChildCategory);
                expect(fixture.debugElement.query(By.directive(directive))).toBeFalsy();
            }
        }));
    });

    describe('Form', () => {
        describe.each`
            error                                        | errorMessage
            ${{ parentCategoryNotFound: true }}          | ${'Category was not found'}
            ${{ parentCategoryInactive: true }}          | ${'Category is not active'}
            ${{ parentCategoryCircularHierarchy: true }} | ${'Parent category has a circular hierarchy reference'}
        `('with parent category', ({ error, errorMessage }) => {
            it('should display proper error', fakeAsync(() => {
                initialize('edit');
                // pre check; should be no mat-errors in DOM
                expect(fixture.debugElement.query(By.directive(MatError))).toBeNull();
                // set error for input
                component.form.getControl('parentCategory').setErrors(error);
                fixture.detectChanges();
                // verify error is getting rendered
                const errorDirective = fixture.debugElement.query(By.directive(MatError)).nativeElement;
                expect(errorDirective.innerHTML).toEqual(errorMessage);
            }));
        });
    });

    describe('with the parent category dropdown', () => {
        beforeEach(() => {
            jest.spyOn(component.dialog, 'open');
            jest.spyOn(component.dialog, 'close');
            jest.spyOn(component, 'loadChildForm');
            jest.spyOn(component, 'cancelRootSwitch');
            jest.spyOn(component, 'createForm');
            jest.spyOn(component, 'reload');
            jest.spyOn(serviceCategoryFacade, 'findActive').mockReturnValue(of([testDescribe]));
        });

        describe.each`
            switchToChild
            ${true}
            ${false}
        `(`while in edit mode`, ({ switchToChild }) => {
            it(`should ${switchToChild ? '' : 'not '}hide root fields when ${
                switchToChild ? 'changing from root to child' : 'canceling the change'
            }`, fakeAsync(() => {
                initialize('edit');

                // Change selection in parent category dropdown
                const filterInput = fixture.debugElement.query(By.directive(MockFilteredInputComponent))
                    .componentInstance as MockFilteredInputComponent;
                filterInput.valueControl.setValue(testDescribe);
                filterInput.selectionChange.emit(new MatSelectChange(null, testDescribe));

                // Validate that dialog appears
                expect(component.reload).toHaveBeenCalled();
                expect(component.dialog.open).toHaveBeenCalled();
                expect(fixture.debugElement.query(By.css('#parent-category-dialog'))).toBeTruthy();

                // Validate dialog buttons
                if (switchToChild) {
                    const continueButton = fixture.debugElement.query(By.css('#continue-button'));
                    expect(continueButton).toBeTruthy();
                    continueButton.nativeElement.click();
                    tick(600);
                    expect(component.loadChildForm).toHaveBeenCalled();
                    expect(component.form.getControlValue('parentCategory')).toEqual(testDescribe);
                } else {
                    const cancelButton = fixture.debugElement.query(By.css('#cancel-button'));
                    expect(cancelButton).toBeTruthy();
                    cancelButton.nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.cancelRootSwitch).toHaveBeenCalled();
                    expect(component.form.getControlValue('parentCategory')).toBeNull();
                }
                expect(component.createForm).toHaveBeenCalledWith(component.updatedModel);
                expect(component.dialog.close).toHaveBeenCalled();
            }));
        });

        describe('while in add mode', () => {
            it(`should not display a confirmation dialog when changing a parent to a child`, fakeAsync(() => {
                initialize('add');

                // Change selection in parent category dropdown
                const filterInput = fixture.debugElement.query(By.directive(MockFilteredInputComponent))
                    .componentInstance as MockFilteredInputComponent;
                filterInput.valueControl.setValue(testDescribe);
                filterInput.selectionChange.emit(new MatSelectChange(null, testDescribe));

                // Validate that dialog was not opened
                expect(component.reload).toHaveBeenCalled();
                expect(component.dialog.open).not.toHaveBeenCalled();
                expect(component.createForm).toHaveBeenCalledWith(component.updatedModel);
            }));
        });
    });

    describe('Action Bar', () => {
        describe.each`
            accessMode | saveDisplayed | applyDisplayed | cancelDisplayed
            ${'view'}  | ${false}      | ${false}       | ${true}
            ${'edit'}  | ${true}       | ${true}        | ${true}
            ${'add'}   | ${true}       | ${true}        | ${true}
        `(`in $accessMode mode`, ({ accessMode, saveDisplayed, applyDisplayed, cancelDisplayed }) => {
            const testVisibility = (element: DebugElement, shouldBeDisplayed: boolean) => {
                initialize(accessMode);
                if (shouldBeDisplayed) {
                    expect(element).toBeDefined();
                } else {
                    expect(element).toBeNull();
                }
            };

            it(`should ${saveDisplayed ? '' : 'not '}display the save button`, fakeAsync(() => {
                testVisibility(getSaveActionButton(fixture), saveDisplayed);
            }));
            it(`should ${applyDisplayed ? '' : 'not '}display the apply button`, fakeAsync(() => {
                testVisibility(getApplyActionButton(fixture), applyDisplayed);
            }));
            it(`should ${cancelDisplayed ? '' : 'not '}display the cancel button`, fakeAsync(() => {
                testVisibility(getCancelActionButton(fixture), cancelDisplayed);
            }));
        });

        describe.each`
            accessMode | formState    | saveEnabled | applyEnabled | cancelEnabled
            ${'edit'}  | ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'edit'}  | ${'invalid'} | ${false}    | ${false}     | ${true}
            ${'add'}   | ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'add'}   | ${'invalid'} | ${false}    | ${false}     | ${true}
        `(
            `with $formState form in $accessMode mode`,
            ({ accessMode, formState, saveEnabled, applyEnabled, cancelEnabled }) => {
                beforeEach(fakeAsync(() => {
                    initialize(accessMode);
                    // setup form for validation tests
                    if (formState === 'invalid') {
                        component.form.setErrors({ invalid: true });
                    } else {
                        // if in add mode and if form is to be valid, patch required fields on form
                        if (accessMode === 'add') {
                            component.form.patchValue(testAddServiceCategory);
                            component.form.updateValueAndValidity();
                        }
                    }
                    fixture.detectChanges();
                }));

                it(`save button should be ${saveEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveEnabled);
                }));
                it(`apply button should be ${applyEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyEnabled);
                }));
                it(`cancel button should be ${cancelEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
                }));
            }
        );

        describe('with action buttons', () => {
            let messageFacade: MessageFacade;
            let routerService: RouterService;
            let router: Router;

            const saveAndPostMessage = (model: ServiceCategory = testServiceCategoryParent) => {
                expect(serviceCategoryFacade.save).toHaveBeenCalledWith(model);
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Service category ${model.code} - ${model.description} saved successfully`,
                    severity: 'info',
                });
            };

            beforeEach(() => {
                serviceCategoryFacade.save = jest.fn(() => of(null));
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
                routerService = TestBed.inject(RouterService as Type<RouterService>);
                router = TestBed.inject(Router as Type<Router>);
            });

            describe.each`
                accessMode | model
                ${'edit'}  | ${testServiceCategoryParent}
                ${'add'}   | ${testAddServiceCategory}
            `(`with save button in $accessMode mode`, ({ accessMode, model }) => {
                const updateAddModeForm = () => {
                    // Manually patch required fields to save
                    if (accessMode === 'add') {
                        component.form.patchValue(model);
                        component.form.updateValueAndValidity();
                        fixture.detectChanges();
                    }
                };

                it('should save, add an info message, and navigateToSearchPage have been called', fakeAsync(() => {
                    initialize(accessMode, model);
                    updateAddModeForm();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    saveAndPostMessage({ ...new ServiceCategory(), ...model });
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should only call save once, even with double clicks', fakeAsync(() => {
                    initialize(accessMode, model);
                    jest.spyOn(component.serviceCategoryFacade, 'save').mockReturnValue(of({}));
                    updateAddModeForm();
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.serviceCategoryFacade.save).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    serviceCategoryFacade.save = jest.fn(() => saveSubject);
                    initialize(accessMode, model);
                    updateAddModeForm();
                    expect(component.form.valid).toBe(true);
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);
                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    serviceCategoryFacade.save = jest.fn(() => saveSubject);
                    initialize(accessMode, model);
                    updateAddModeForm();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        flush();
                    }).toThrow();
                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe(`with apply button`, () => {
                it(`should reload model in mode`, fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    jest.spyOn(serviceCategoryFacade, 'save').mockReturnValue(of(null));

                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(serviceCategoryFacade.save).toHaveBeenCalled();
                    expect(component.ngOnInit).toHaveBeenCalled();
                }));

                it('should only call apply once, even with double clicks', fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component.serviceCategoryFacade, 'save').mockReturnValue(of({}));
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.serviceCategoryFacade.save).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const applySubject = new Subject();
                    serviceCategoryFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.isLoading).toBeTruthy();
                    applySubject.next(null);
                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const applySubject = new Subject();
                    serviceCategoryFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        applySubject.error('An error occurred');
                        flush();
                    }).toThrow();
                    expect(component.isLoading).toBeFalsy();
                }));

                it('should navigate edit page when in add mode', fakeAsync(() => {
                    const serviceCategory = {
                        code: 'TESTCD',
                        description: 'test category',
                        active: true,
                        nacsProductCode: { ...new Described() },
                    };

                    initialize('add');
                    // patch not null values
                    component.form.patchValue(serviceCategory);
                    component.apply();
                    expect(router.navigate).toHaveBeenCalledWith(['edit', serviceCategory.code], expect.anything());
                }));
            });
        });
    });

    describe('unsavedChanges', () => {
        beforeEach(() => {
            jest.spyOn(serviceCategoryFacade, 'save');
        });

        it('should track if the form has been modified', fakeAsync(() => {
            initialize('edit');
            expect(component.unsavedChanges).toBeFalsy();
            component.form.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        }));
    });

    describe.each`
        parentCategory
        ${testDescribe}
        ${null}
    `('saveFacade', ({ parentCategory }) => {
        it(`should build a request object with parent category ${JSON.stringify(parentCategory)}`, fakeAsync(() => {
            initialize('edit');
            component.form.setControlValue('parentCategory', parentCategory);
            const requestObject: ServiceCategory = component.saveFacade['buildRequestObject'](
                component.form,
                component.model
            );

            if (isNullOrUndefined(parentCategory)) {
                // root categories should have these fields
                expect(requestObject.defaultService).not.toBeNull();
                expect(requestObject.serviceInfo).not.toBeNull();
                expect(requestObject.carFaxMapping).not.toEqual([]);
                expect(requestObject.motorInfo).not.toEqual([]);
                expect(requestObject.preventativeMaintenanceQualifiers).not.toEqual([]);
            } else {
                // child categories should not have these fields
                expect(requestObject.defaultService).toBeNull();
                expect(requestObject.serviceInfo).toBeNull();
                expect(requestObject.carFaxMapping).toEqual([]);
                expect(requestObject.motorInfo).toEqual([]);
                expect(requestObject.preventativeMaintenanceQualifiers).toEqual([]);
            }
        }));
    });
});
