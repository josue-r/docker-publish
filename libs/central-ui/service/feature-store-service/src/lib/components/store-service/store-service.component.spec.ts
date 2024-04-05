import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    CompanyService,
    CompanyServiceFacade,
    PricingStrategy,
} from '@vioc-angular/central-ui/service/data-access-company-service';
import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import {
    ProductExtraCharge,
    ServiceExtraCharge,
    StoreService,
    StoreServiceFacade,
    StoreServiceMassAdd,
} from '@vioc-angular/central-ui/service/data-access-store-service';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import * as moment from 'moment';
import { Moment } from 'moment';
import { of, ReplaySubject, Subject } from 'rxjs';
import { StoreServiceModuleForms } from '../../store-service-module-forms';
import { StoreServiceComponent } from './store-service.component';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';

@Component({
    selector: 'vioc-angular-service-extra-charge',
    template: '',
})
class MockServiceExtraChargeComponent {
    @Input() serviceExtraCharges;
    @Input() isViewMode;
}

describe('StoreServiceComponent', () => {
    const testDescribe: Described = {
        id: 1,
        code: 'CODE',
        description: 'DESC',
        version: 0,
    };

    const storeService: StoreService = {
        active: true,
        id: { storeId: 1234, serviceId: 8888 },
        store: {
            id: 4444,
            code: 'S4444',
            description: 'Test Store',
            version: 1,
            company: { ...testDescribe, code: 'C', description: 'Company' },
        },
        service: { id: 2, code: 'SERVICE_1', description: 'Service 1', version: 1 },
        servicePrice: 9.99,
        laborAmount: 4,
        priceOverridable: true,
        priceOverrideMax: 100,
        priceOverrideMin: 2,
        priceOverrideMinMaxOverrideable: false,
        productExtraCharges: [
            {
                id: 2222,
                charge: { id: 1, code: 'EXTRCHRG1', description: 'Extra Charge 1', version: 1 },
                productCategory: { id: 1, code: 'OIL_CAT', description: 'Oil', version: 1 },
                amount: 5.99,
                quantityIncluded: 4,
                beginExtraCharge: 4.25,
                taxable: true,
                version: 1,
            } as ProductExtraCharge,
        ],
        promotionStartDate: '2017-01-01',
        promotionEndDate: '2017-01-01',
        promotionLaborAmount: 4,
        promotionPrice: 8.99,
        scheduledChangeDate: '9999-12-31',
        scheduledChangePrice: 10.99,
        extraCharge1: {
            amount: 1,
            charge: { code: 'extraCharge1', description: 'extraCharge1', id: 1, version: 1 },
            taxable: true,
        } as ServiceExtraCharge,
        extraCharge2: {
            amount: 2,
            charge: { code: 'extraCharge2', description: 'extraCharge2', id: 2, version: 2 },
            taxable: false,
        } as ServiceExtraCharge,
        taxable: true,
        updatedBy: 'a414583',
        updatedOn: '2017-01-01',
    };

    const companyService: CompanyService = {
        id: { serviceId: 1, companyId: 2 },
        version: 0,
        salesAccount: { ...testDescribe, code: 'Sales' },
        costAccount: { ...testDescribe, code: 'Cost' },
        active: true,
        company: { ...testDescribe, code: 'C', description: 'Company' },
        service: { id: 2, code: 'SERVICE_1', description: 'Service 1', version: 1 },
        pricingStrategy: PricingStrategy.SERVICE,
    };

    let component: StoreServiceComponent;
    let fixture: ComponentFixture<StoreServiceComponent>;
    let commonCodeFacade: CommonCodeFacade;
    let storeServiceFacade: StoreServiceFacade;
    let companyServiceFacade: CompanyServiceFacade;
    let routerService: RouterService;

    let destroyed: ReplaySubject<any>;
    let testMassAddForm: TypedFormGroup<StoreServiceMassAdd>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                UiLoadingMockModule,
                UiCurrencyPrefixModule,
                UtilFormModule,
                UiInfoButtonModule,
                MatFormFieldModule,
                MatDatepickerModule,
                UiAuditModule,
                MatCheckboxModule,
                MatSelectModule,
                ReactiveFormsModule,
                MatInputModule,
                NoopAnimationsModule,
                UiActionBarModule,
                MomentDateModule,
                MatMomentDateModule,
                CommonFunctionalityModule,
            ],
            declarations: [StoreServiceComponent, MockServiceExtraChargeComponent],
            providers: [
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway' },
                { provide: HttpClient, useValue: {} },
                { provide: ActivatedRoute, useValue: { params: new Subject() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreServiceComponent);
        component = fixture.componentInstance;
        StoreServiceModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        commonCodeFacade = component.commonCodeFacade;
        storeServiceFacade = component.storeServiceFacade;
        companyServiceFacade = component.companyServiceFacade;

        routerService = TestBed.inject(RouterService);

        jest.spyOn(companyServiceFacade, 'findByCompanyAndServiceCode').mockReturnValue(of(companyService));
        jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of([testDescribe]));
        jest.spyOn(storeServiceFacade, 'findByStoreAndService').mockReturnValue(of(storeService));
    });

    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        storeNum: string,
        serviceCode: string,
        model: StoreService
    ) => {
        if (accessMode !== 'add') {
            const route = TestBed.inject(ActivatedRoute);
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode,
                    storeNum,
                    serviceCode,
                }),
            } as ActivatedRouteSnapshot;

            const testStoreService = {
                ...storeService,
                ...model,
            };

            testStoreService.store.code = storeNum;
            testStoreService.service.code = serviceCode;

            jest.spyOn(storeServiceFacade, 'findByStoreAndService').mockReturnValue(of(testStoreService));
        } else {
            destroyed = new ReplaySubject();
            const formFactory = TestBed.inject(FormFactory);
            const changeDetector = {} as ChangeDetectorRef;
            testMassAddForm = formFactory.group(
                'StoreServiceMassAdd',
                {
                    stores: undefined,
                    service: new Service(),
                    storeService: new StoreService(),
                },
                destroyed,
                { changeDetector, accessMode: AccessMode.ADD }
            );
            component.massAddForm = testMassAddForm;
        }
        fixture.detectChanges();
    };

    afterEach(() => {
        if (destroyed) {
            destroyed.next();
            destroyed.complete();
        }
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
        initialize('edit', 'FOO', 'BAR', { ...storeService });
        flush();

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
            initialize('edit', 'FOO', 'BAR', {});
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();
            tick(100);
            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        const defaultExtracCharge: ServiceExtraCharge = {
            amount: null,
            charge: null,
            taxable: null,
        };
        const defaultStoreService: StoreService = {
            ...new StoreService(),
            active: true,
            priceOverridable: false,
            extraCharge1: defaultExtracCharge,
            extraCharge2: defaultExtracCharge,
            taxable: true,
        };

        describe.each`
            accessMode | formEnabled | storeServiceValue      | initStoreService
            ${'edit'}  | ${true}     | ${storeService}        | ${true}
            ${'view'}  | ${false}    | ${storeService}        | ${true}
            ${'add'}   | ${true}     | ${defaultStoreService} | ${false}
        `('with accessMode=$accessMode', ({ accessMode, formEnabled, storeServiceValue, initStoreService }) => {
            it(`should have initialized a ${formEnabled ? '' : 'non'} editable form in ${accessMode} mode`, () => {
                initialize(accessMode, 'FOO', 'BAR', { ...storeServiceValue });

                if (initStoreService) {
                    expect(companyServiceFacade.findByCompanyAndServiceCode).toHaveBeenCalled();
                    expect(storeServiceFacade.findByStoreAndService).toHaveBeenCalledWith('FOO', 'BAR');
                } else {
                    expect(companyServiceFacade.findByCompanyAndServiceCode).not.toHaveBeenCalled();
                    expect(storeServiceFacade.findByStoreAndService).not.toHaveBeenCalled();
                }
                expect(commonCodeFacade.findByType).toHaveBeenCalled();

                // the form should be initialized with the loaded value
                expect(component.form).toBeDefined();
                expect(component.form.getRawValue()).toEqual(storeServiceValue);
                // the form should be enaabled
                expect(component.form.enabled).toBe(formEnabled);
            });
        });
    });

    describe('store service information', () => {
        describe('access mode edit', () => {
            beforeEach(() => {
                initialize('edit', 'FOO', 'BAR', { ...storeService });
            });
            it.each`
                control                   | value                | enabled
                ${{ id: 'store' }}        | ${'FOO'}             | ${false}
                ${{ id: 'service' }}      | ${'BAR - Service 1'} | ${false}
                ${'active'}               | ${true}              | ${true}
                ${{ id: 'servicePrice' }} | ${'9.99'}            | ${true}
                ${{ id: 'laborPrice' }}   | ${'4'}               | ${true}
                ${'taxable'}              | ${true}              | ${true}
                ${'priceOverridable'}     | ${true}              | ${true}
                ${'scheduledChangeDate'}  | ${'12/31/9999'}      | ${true}
                ${'scheduledChangePrice'} | ${'10.99'}           | ${true}
                ${'promotionStartDate'}   | ${'1/1/2017'}        | ${true}
                ${'promotionEndDate'}     | ${'1/1/2017'}        | ${true}
                ${'promotionPrice'}       | ${'8.99'}            | ${true}
                ${'promotionLaborAmount'} | ${'4'}               | ${true}
            `('formControl=$control should have value=$value, enabled=$enabled', ({ control, value, enabled }) => {
                expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
            });
        });

        describe('access mode view', () => {
            beforeEach(() => {
                initialize('view', 'FOO', 'BAR', { ...storeService });
            });
            it.each`
                control                   | value                | enabled
                ${{ id: 'store' }}        | ${'FOO'}             | ${false}
                ${{ id: 'service' }}      | ${'BAR - Service 1'} | ${false}
                ${'active'}               | ${true}              | ${false}
                ${{ id: 'servicePrice' }} | ${'9.99'}            | ${false}
                ${{ id: 'laborPrice' }}   | ${'4'}               | ${false}
                ${'taxable'}              | ${true}              | ${false}
                ${'priceOverridable'}     | ${true}              | ${false}
                ${'scheduledChangeDate'}  | ${'12/31/9999'}      | ${false}
                ${'scheduledChangePrice'} | ${'10.99'}           | ${false}
                ${'promotionStartDate'}   | ${'1/1/2017'}        | ${false}
                ${'promotionEndDate'}     | ${'1/1/2017'}        | ${false}
                ${'promotionPrice'}       | ${'8.99'}            | ${false}
                ${'promotionLaborAmount'} | ${'4'}               | ${false}
            `('formControl=$control should have value=$value, enabled=$enabled', ({ control, value, enabled }) => {
                expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
            });
        });
    });

    describe('with action bar', () => {
        describe.each`
            accessMode | cloneVisible | saveVisible | applyVisible | cancelVisible
            ${'view'}  | ${true}      | ${false}    | ${false}     | ${true}
            ${'edit'}  | ${true}      | ${true}     | ${true}      | ${true}
            ${'add'}   | ${false}     | ${false}    | ${false}     | ${false}
        `(`with accessMode=$accessMode`, ({ accessMode, cloneVisible, saveVisible, applyVisible, cancelVisible }) => {
            beforeEach(() => {
                initialize(accessMode, 'FOO', 'BAR', { ...storeService });
            });

            function testVisibility(button: DebugElement, visible: boolean) {
                if (visible) {
                    expect(button).toBeTruthy();
                } else {
                    expect(button).toBeFalsy();
                }
            }

            // TODO: 6/4/2020 implement with #5584
            // it(`clone button should be ${cloneVisible ? '' : 'not '}visible`, () => {
            //     testVisibility(getCloneActionButton(fixture), cloneVisible);
            // });

            it(`save button should be ${saveVisible ? '' : 'not '}visible`, () => {
                testVisibility(getSaveActionButton(fixture), saveVisible);
            });

            it(`apply button should be ${applyVisible ? '' : 'not '}visible`, () => {
                testVisibility(getApplyActionButton(fixture), applyVisible);
            });

            it(`cancel button should be ${cancelVisible ? '' : 'not '}visible`, () => {
                testVisibility(getCancelActionButton(fixture), cancelVisible);
            });
        });

        describe.each`
            formState    | cloneVisible | saveVisible | applyVisible | cancelVisible
            ${'valid'}   | ${true}      | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${false}     | ${false}    | ${false}     | ${true}
        `(`with $formState form`, ({ formState, cloneVisible, saveVisible, applyVisible, cancelVisible }) => {
            beforeEach(() => {
                initialize('edit', 'FOO', 'BAR', { ...storeService });
                if (formState !== 'valid') {
                    component.form.setErrors({ invalid: true });
                }
                fixture.detectChanges();
            });

            // TODO: 6/4/2020 implement with #5584
            // it(`clone button should be ${cloneVisible ? '' : 'not '}visible`, () => {
            //     expect(getCloneActionButton(fixture).nativeElement.disabled).toBe(!cloneVisible);
            // });

            it(`save button should be ${saveVisible ? '' : 'not '}visible`, () => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveVisible);
            });

            it(`apply button should be ${applyVisible ? '' : 'not '}visible`, () => {
                expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyVisible);
            });

            it(`cancel button should be ${cancelVisible ? '' : 'not '}visible`, () => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelVisible);
            });
        });

        describe('action buttons', () => {
            beforeEach(() => {
                initialize('edit', 'FOO', 'BAR', { ...storeService });
            });
            describe('save button', () => {
                it('should save on click ', fakeAsync(() => {
                    // verify form is valid by checking the list of invalid form control names is empty
                    expect(
                        Object.entries(component.form.controls)
                            .filter((c) => !c[1].disabled && !c[1].valid)
                            .map((c) => c[0])
                    ).toHaveLength(0);
                    jest.spyOn(component.saveFacade, 'save').mockReturnValue(of({}));

                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.saveFacade.save).toHaveBeenCalled();
                }));

                it('should only call save once, even with double clicks', fakeAsync(() => {
                    initialize('edit', 'FOO', 'BAR', { ...storeService });
                    jest.spyOn(component.saveFacade, 'save').mockReturnValue(of({}));

                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.saveFacade.save).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    storeServiceFacade.save = jest.fn(() => saveSubject);
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);
                    fixture.detectChanges();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    storeServiceFacade.save = jest.fn(() => saveSubject);
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        tick(600);
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should nullify extra charge if amount/charge fields null ', fakeAsync(() => {
                    // verify form is valid by checking the list of invalid form control names is empty
                    expect(
                        Object.entries(component.form.controls)
                            .filter((c) => !c[1].disabled && !c[1].valid)
                            .map((c) => c[0])
                    ).toHaveLength(0);
                    jest.spyOn(component.storeServiceFacade, 'save').mockReturnValue(of({}));

                    const saveButton = getSaveActionButton(fixture);
                    expect(saveButton).toBeTruthy();

                    expect(component.form.value.extraCharge1).not.toBeNull();
                    expect(component.form.value.extraCharge2).not.toBeNull();

                    component.form.getControl('extraCharge1').get('charge').setValue(null);
                    component.form.getControl('extraCharge2').get('charge').setValue(null);

                    saveButton.nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.storeServiceFacade.save).toHaveBeenCalledWith(
                        expect.objectContaining({ extraCharge1: null, extraCharge2: null })
                    );
                }));
            });

            describe('apply button', () => {
                it('apply button should save on click ', fakeAsync(() => {
                    // verify form is valid by checking the list of invalid form control names is empty
                    expect(
                        Object.entries(component.form.controls)
                            .filter((c) => !c[1].disabled && !c[1].valid)
                            .map((c) => c[0])
                    ).toHaveLength(0);
                    jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));

                    const applyButton = getApplyActionButton(fixture);
                    expect(applyButton).toBeTruthy();

                    applyButton.nativeElement.click();
                    tick(600);

                    expect(component.saveFacade.apply).toHaveBeenCalled();
                }));

                it('should only call apply once, even with double clicks', fakeAsync(() => {
                    initialize('edit', 'FOO', 'BAR', { ...storeService });
                    jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));

                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();
                    expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const applySubject = new Subject();
                    storeServiceFacade.save = jest.fn(() => applySubject);
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    applySubject.next(null);
                    tick(600);

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const applySubject = new Subject();
                    storeServiceFacade.save = jest.fn(() => applySubject);
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        applySubject.error('An error occurred');
                        tick(600);
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe('add like button', () => {
                // TODO: 6/4/2020 implement with #5584
                // it('should navigate to add like page', fakeAsync(() => {
                //     jest.spyOn(router, 'navigate');
                //     getCloneActionButton(fixture).nativeElement.click();
                //     expect(router.navigate).toHaveBeenCalledWith([
                //         `/maintenance/store-service/clone/${storeService.store.code}/${storeService.service.code}`
                //     ]);
                // }));
            });
        });
    });

    describe('minimumPriceIsGreaterThanOverrideableMax', () => {
        it('priceOverrideMin is greater than priceOverrideMax', () => {
            initialize('edit', 'FOO', 'BAR', { priceOverrideMin: 2, priceOverrideMax: 1 });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeTruthy();
        });

        it('priceOverrideMin is 1 and the priceOverrideMax is 0', () => {
            initialize('edit', 'FOO', 'BAR', { priceOverrideMin: 2, priceOverrideMax: 1 });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeTruthy();
        });

        it('priceOverrideMin is less than priceOverrideMax', () => {
            initialize('edit', 'FOO', 'BAR', { priceOverrideMin: 1, priceOverrideMax: 2 });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeFalsy();
        });
        it('priceOverrideMax is null', () => {
            initialize('edit', 'FOO', 'BAR', { priceOverrideMin: 1, priceOverrideMax: null });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeFalsy();
        });

        it('priceOverrideMax is undefined', () => {
            initialize('edit', 'FOO', 'BAR', { priceOverrideMin: 1, priceOverrideMax: undefined });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeFalsy();
        });
    });

    describe('servicePriceIsGreaterThanOverrideableMax', () => {
        it('servicePrice is greater than priceOverrideMax', () => {
            initialize('edit', 'FOO', 'BAR', { servicePrice: 2, priceOverrideMax: 1 });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeTruthy();
        });

        it('servicePrice is 1 and priceOverrideMax is 0', () => {
            initialize('edit', 'FOO', 'BAR', { servicePrice: 1, priceOverrideMax: 0 });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeTruthy();
        });

        it('priceOverrideMin is less than priceOverrideMax', () => {
            initialize('edit', 'FOO', 'BAR', { servicePrice: 1, priceOverrideMax: 2 });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeFalsy();
        });
        it('priceOverrideMax is null', () => {
            initialize('edit', 'FOO', 'BAR', { servicePrice: 1, priceOverrideMax: null });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeFalsy();
        });

        it('priceOverrideMax is undefined', () => {
            initialize('edit', 'FOO', 'BAR', { servicePrice: 1, priceOverrideMax: undefined });
            expect(component.minimumPriceIsGreaterThanOverrideableMax()).toBeFalsy();
        });
    });

    describe('promotionalPriceIsInEffect', () => {
        const asDateString = (date: Moment) => date.format('yyyy-MM-DD');

        describe.each`
            start                                         | end                                      | showWarning
            ${moment().subtract(2, 'days')}               | ${moment().add(2, 'days')}               | ${true}
            ${asDateString(moment().subtract(2, 'days'))} | ${asDateString(moment().add(2, 'days'))} | ${true}
            ${moment()}                                   | ${moment().add(2, 'days')}               | ${true}
            ${asDateString(moment())}                     | ${asDateString(moment().add(2, 'days'))} | ${true}
            ${moment()}                                   | ${moment()}                              | ${false}
            ${asDateString(moment())}                     | ${asDateString(moment())}                | ${false}
            ${moment().add(1, 'days')}                    | ${moment().add(2, 'days')}               | ${false}
            ${asDateString(moment().add(1, 'days'))}      | ${asDateString(moment().add(2, 'days'))} | ${false}
            ${null}                                       | ${moment().add(2, 'days')}               | ${false}
            ${null}                                       | ${asDateString(moment().add(2, 'days'))} | ${false}
            ${moment().subtract(2, 'days')}               | ${null}                                  | ${false}
            ${asDateString(moment().subtract(2, 'days'))} | ${null}                                  | ${false}
        `('warning', ({ start, end, showWarning }) => {
            it(`should ${showWarning ? '' : 'not '}show if start=${start} & end=${end}`, () => {
                initialize('edit', 'FOO', 'BAR', {
                    promotionStartDate: start,
                    promotionEndDate: end,
                });
                const warning = fixture.debugElement.query(By.css('#promotionalPriceWarning'));
                if (showWarning) {
                    expect(warning).not.toBeNull();
                } else {
                    expect(warning).toBeNull();
                }
            });
        });
    });

    it('should track unsaved changes if form is dirty', () => {
        initialize('edit', 'FOO', 'BAR', { ...storeService });
        expect(component.unsavedChanges).toBeFalsy();

        component.form.markAsDirty();

        expect(component.unsavedChanges).toBeTruthy();
    });

    it('should not show unsaved changes if form does not exist', () => {
        initialize('edit', 'FOO', 'BAR', { ...storeService });
        component.form = undefined;

        expect(component.unsavedChanges).toBeFalsy();
    });
});
