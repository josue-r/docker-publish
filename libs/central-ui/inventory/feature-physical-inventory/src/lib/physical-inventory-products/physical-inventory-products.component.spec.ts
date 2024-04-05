import { HarnessLoader, parallel } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatSortHeaderHarness } from '@angular/material/sort/testing';
import { MatTableModule } from '@angular/material/table';
import { MatTableHarness } from '@angular/material/table/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ParameterType } from '@vioc-angular/central-ui/config/data-access-parameter';
import {
    PhysicalInventory,
    PhysicalInventoryCount,
} from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FEATURE_CONFIGURATION_TOKEN, FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { CommonFunctionalityModule, Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import { chunk } from 'lodash';
import { EMPTY, ReplaySubject, Subject, of } from 'rxjs';
import { PhysicalInventoryForms } from '../physical-inventory-module-forms';
import { PhysicalInventoryProductsComponent } from './physical-inventory-products.component';

describe('PhysicalInventoryProductsComponent', () => {
    let component: PhysicalInventoryProductsComponent;
    let fixture: ComponentFixture<PhysicalInventoryProductsComponent>;
    let loader: HarnessLoader;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;

    @Component({
        selector: 'vioc-angular-slide-toggle',
        template: '',
    })
    class MockSlideToggleComponent {
        @Input() label: string;
        @Input() innerLabel: string;
        @Input() toggled: boolean;
        @Input() disabled: boolean;
        @Output() changeEvent = new EventEmitter<{ checked: boolean }>();
    }

    const testProductCategories: Described[] = [
        { id: 1, code: 'OIL' },
        { id: 1, code: 'GB' },
        { id: 1, code: 'WIPERS' },
    ];
    const testPhysicalInventoryCounts: PhysicalInventoryCount[] = [
        {
            id: {
                physicalInventoryId: 386656,
                line: 0,
            },
            category: { id: 1, code: 'OIL' },
            status: {
                code: 'OPEN',
                id: 1107,
            },
            uom: {
                code: 'QUART',
                id: 2478,
            },
            actualCount: 576,
            product: {
                code: '5W20SYNMXB',
                id: 29219,
            },

            qohCountWhenOpened: 100,
            qohCountWhenClosed: null,
            variance: null,
            closedOn: null,
            version: 1,
            volumeCalculatorEnabled: false,
        },
        {
            id: {
                physicalInventoryId: 386656,
                line: 1,
            },
            category: { id: 1, code: 'OIL' },
            status: {
                code: 'OPEN',
                id: 1107,
            },
            uom: {
                code: 'QUART',
                id: 2478,
            },
            actualCount: 456,
            product: {
                code: '0W20SYNMXB',
                id: 29220,
            },
            qohCountWhenOpened: 100,
            qohCountWhenClosed: null,
            variance: null,
            closedOn: null,
            version: 1,
            volumeCalculatorEnabled: false,
        },
        {
            id: {
                physicalInventoryId: 386656,
                line: 2,
            },
            category: { id: 1, code: 'GB' },
            status: {
                code: 'OPEN',
                id: 1107,
            },
            uom: {
                code: 'PINT',
                id: 2474,
            },
            actualCount: 740,
            product: {
                code: 'MAXATFB',
                id: 8304,
            },
            qohCountWhenOpened: 100,
            qohCountWhenClosed: null,
            variance: null,
            closedOn: null,
            version: 1,
            volumeCalculatorEnabled: false,
        },
        {
            id: {
                physicalInventoryId: 386656,
                line: 3,
            },
            category: { id: 1, code: 'WIPERS' },
            status: {
                code: 'OPEN',
                id: 1107,
            },
            uom: {
                code: 'EACH',
                id: 2479,
            },
            actualCount: 41,
            product: {
                code: 'VWB22AQ',
                id: 13824,
            },
            qohCountWhenOpened: 100,
            qohCountWhenClosed: null,
            variance: null,
            closedOn: null,
            version: 1,
            volumeCalculatorEnabled: false,
        },
        {
            id: {
                physicalInventoryId: 386656,
                line: 4,
            },
            category: { id: 1, code: 'GB' },
            status: {
                code: 'CLOSED',
                id: 1107,
            },
            uom: {
                code: 'PINT',
                id: 2474,
            },
            actualCount: 100,
            product: {
                code: 'CVT',
                id: 14154,
            },
            qohCountWhenOpened: 100,
            qohCountWhenClosed: 100,
            variance: 0,
            closedOn: '2020-06-27T19:21:04.423398',
            volumeCalculatorEnabled: false,
        },
        {
            //this should be used by test - 'should trigger the selected row ${rowNumber} to be CLOSED'
            // This Object is required to check the close count with
            //  zero quantity & actualCount must be 0.
            id: {
                physicalInventoryId: 386658,
                line: 5,
            },
            category: { id: 1, code: 'GB' },
            status: {
                code: 'OPEN',
                id: 1107,
            },
            uom: {
                code: 'PINT',
                id: 2474,
            },
            actualCount: 576,
            product: {
                code: 'PQR',
                id: 14154,
            },
            qohCountWhenOpened: 100,
            qohCountWhenClosed: null,
            variance: null,
            closedOn: null,
            volumeCalculatorEnabled: false,
        },
        {
            id: {
                physicalInventoryId: 386657,
                line: 6,
            },
            category: { id: 1, code: 'GB' },
            status: {
                code: 'OPEN',
                id: 1107,
            },
            uom: {
                code: 'PINT',
                id: 2474,
            },
            actualCount: 100,
            product: {
                code: 'CVTQ',
                id: 14154,
            },
            qohCountWhenOpened: 100,
            qohCountWhenClosed: 100,
            variance: 0,
            closedOn: '2020-06-27T19:21:04.423398',
            storeTank: {
                companyTank: {
                    heightUom: { id: 1, code: 'INCH' },
                },
            },
            volumeCalculatorEnabled: true,
        },
    ];

    const testPhysicalInventory: PhysicalInventory = {
        ...new PhysicalInventory(),
        id: 10000,
        store: { code: 'STORE' },
        status: { id: 1, code: 'OPEN', description: 'Open' },
        version: 1,
        counts: testPhysicalInventoryCounts,
    };

    const updatedPhysicalInventory: PhysicalInventory = {
        ...testPhysicalInventory,
        status: { id: 1, code: 'OPEN', description: 'Open' },
        updatedBy: 'a418811',
        updatedByEmployee: { id: 'a418811', firstName: 'Unit', lastName: 'Tester' },
        updatedOn: '2021-07-07T11:49:53.267955',
        version: 2,
        counts: [
            {
                id: {
                    physicalInventoryId: 386656,
                    line: 0,
                },
                product: {
                    code: '5W20SYNMXB',
                    id: 29219,
                },
                status: {
                    code: 'OPEN',
                    id: 1108,
                },
                actualCount: 45.0,
                closedOn: '2021-07-07T11:49:53.267955',
                version: 2,
                volumeCalculatorEnabled: false,
            },
            {
                id: {
                    physicalInventoryId: 386656,
                    line: 1,
                },
                category: { id: 1, code: 'OIL' },
                status: {
                    code: 'OPEN',
                    id: 1107,
                },
                uom: {
                    code: 'QUART',
                    id: 2478,
                },
                actualCount: 20.0,
                product: {
                    code: '0W20SYNMXB',
                    id: 29220,
                },
                closedOn: '2021-07-07T11:49:53.267955',
                version: 2,
                volumeCalculatorEnabled: false,
            },
            {
                id: {
                    physicalInventoryId: 386656,
                    line: 1,
                },
                category: { id: 1, code: 'OIL' },
                status: {
                    code: 'OPEN',
                    id: 1107,
                },
                uom: {
                    code: 'QUART',
                    id: 2478,
                },
                actualCount: 100.0,
                product: {
                    code: '0W20SYNMXB',
                    id: 29220,
                },
                closedOn: '2021-07-07T11:49:53.267955',
                version: 2,
                volumeCalculatorEnabled: false,
            },
        ],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatTableModule,
                MatSortModule,
                MomentDateModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiButtonModule,
                UiDialogMockModule,
                UiFilteredInputMockModule,
                CommonFunctionalityModule,
                FeatureFeatureFlagModule,
            ],
            declarations: [PhysicalInventoryProductsComponent, MockSlideToggleComponent],
            providers: [
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: Router, useValue: { navigate: jest.fn() } },
                {
                    provide: AuthenticationFacade,
                    useValue: { getUser: () => EMPTY } as any as AuthenticationFacade,
                },
                { provide: FeatureFlagFacade, useValue: { isEnabled: jest.fn(() => of(true)) } },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            physicalInventory: {
                                edit: {
                                    calculator: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PhysicalInventoryProductsComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        componentDestroyed = new ReplaySubject(1);
        loader = TestbedHarnessEnvironment.loader(fixture);
        PhysicalInventoryForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));

        component.parameterFacade.findStoreParameterValue = jest.fn(() => EMPTY);
        component.productCategoryFacade.findSecondLevelByStore = jest.fn(() => of(testProductCategories));
        component.physicalInventoryFacade.searchCountProductsByCategories = jest.fn(() =>
            of(testPhysicalInventoryCounts)
        );
        component.physicalInventoryFacade.updateCount = jest.fn(() => of({}));
        component.physicalInventoryFacade.closeCount = jest.fn(() => of({}));
        component.parameterFacade.findStoreParameterValue = jest.fn(() => of(null));
    });

    afterEach(() => componentDestroyed.next());

    /** Initialize the the component with the given access mode, type and code. */
    const initialize = (
        accessMode: 'view' | 'edit',
        initCategory = undefined,
        physicalInventory = testPhysicalInventory,
        andflush = true
    ) => {
        const mode = AccessMode.of(accessMode);
        component.accessMode = mode;
        component.model = physicalInventory;
        component.form = formFactory.group('PhysicalInventory', physicalInventory, componentDestroyed, {
            accessMode: mode,
        });
        component.initiateCategorySearch = initCategory;
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
        tick(100);
    };

    const getCheckbox = (selector: string) => {
        return loader.getHarness(
            MatCheckboxHarness.with({
                selector,
            })
        );
    };
    const clickCheckbox = async (selector: string) => {
        const checkbox = await getCheckbox(selector);
        await checkbox.toggle();
    };
    const isChecked = (selector: string) => {
        return getCheckbox(selector).then((checkbox) => checkbox.isChecked());
    };
    const getInput = (selector: string) => {
        return loader.getHarness(MatInputHarness.with({ selector }));
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onInit', () => {
        it('should load a list of second level categories', fakeAsync(async () => {
            initialize('edit');
            expect(component.productCategoryFacade.findSecondLevelByStore).toHaveBeenCalledWith(
                testPhysicalInventory.store.code
            );
            expect(await component.categories$.toPromise()).toEqual(
                component.allCategories.concat(testProductCategories)
            );
        }));

        it('should not load the products on initial page load if initialCategorySearch is undefined', fakeAsync(() => {
            initialize('edit');
            expect(component.physicalInventoryFacade.searchCountProductsByCategories).not.toHaveBeenCalled();
        }));

        it('should load the products on the initial page load if initialCategorySearch is all categories', fakeAsync(() => {
            initialize('edit', component.allCategories);
            expect(component.physicalInventoryFacade.searchCountProductsByCategories).toHaveBeenCalledWith(
                testPhysicalInventory.id,
                null,
                false
            );
        }));

        it('should configure the category selection to not load products on selecting the same category', fakeAsync(() => {
            initialize('edit', component.allCategories);
            // called a second time after the initial find ALL call
            expect(component.physicalInventoryFacade.searchCountProductsByCategories).toHaveBeenNthCalledWith(
                1,
                testPhysicalInventory.id,
                null,
                false
            );

            // update the value again with the same value
            component.categoryControl.setValue(component.allCategories);
            fixture.detectChanges();
            // ensure it did not get called a second time
            expect(component.physicalInventoryFacade.searchCountProductsByCategories).not.toHaveBeenCalledTimes(3);
        }));

        it('should not change the category with a dirty form and cancelling the confirm', fakeAsync(() => {
            jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
            initialize('edit');
            const category: Described[] = [{ id: 1, code: 'true' }];
            component.form.markAsDirty();
            component.categoryControl.setValue(category);
            component.getProductByCategories();
            flush();
            expect(window.confirm).toHaveBeenCalled();
            expect(component.categoryControl.value).toEqual([]);
        }));

        it('should change the category with a dirty form and confirming the change', fakeAsync(() => {
            jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
            initialize('edit');
            const category: Described[] = [{ id: 1, code: 'true' }];
            component.form.markAsDirty();
            component.categoryControl.setValue(category);
            component.getProductByCategories();
            flush();
            expect(window.confirm).toHaveBeenCalled();
            expect(component.categoryControl.value).toEqual(category);
        }));

        it('should change the category with a pristine form', fakeAsync(() => {
            initialize('edit');
            const category: Described[] = [{ id: 1, code: 'true' }];
            component.form.markAsPristine();
            component.categoryControl.setValue(category);
            component.getProductByCategories();
            flush();
            expect(component.categoryControl.value).toEqual(category);
        }));

        describe.each`
            status
            ${'OPEN'}
            ${'CLOSED'}
            ${'FINALIZED'}
        `('uom tolerances', ({ status }) => {
            it(`should ${status === 'OPEN' ? '' : 'not '}be loaded when the status is ${status}`, fakeAsync(() => {
                const tolerance = 100;
                component.parameterFacade.findStoreParameterValue = jest.fn(() => of(tolerance));
                initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: status } });
                if (status === 'OPEN') {
                    component.supportedUomToleranceTypes.forEach((t) => {
                        expect(component.parameterFacade.findStoreParameterValue).toHaveBeenCalledWith(
                            component.toleranceParamPrefix.concat(t),
                            ParameterType.INTEGER,
                            testPhysicalInventory.store.id
                        );
                        expect(component.uomToleranceMap.get(t)).toEqual(tolerance);
                    });
                } else {
                    expect(component.parameterFacade.findStoreParameterValue).toHaveBeenCalledWith(
                        component.showVarianceParameter,
                        ParameterType.BOOLEAN,
                        testPhysicalInventory.store.id
                    );
                }
            }));
        });

        it('should contains height uom', fakeAsync(() => {
            initialize('edit', component.allCategories);
            const id = component.form.getArray('counts').controls[6].get('id').value;
            expect(component.form.getArray('counts').controls[0].get('height')).toBeNull();
            expect(component.form.getArray('counts').controls[6].get('height')).not.toBeNull();
            expect(component.slideToggleLabels.get(id)).toEqual('PINT');
        }));

        it('should call setHeight on keyup', fakeAsync(async () => {
            let spy = jest.spyOn(component, 'setHeight');
            initialize('edit', component.allCategories);
            const countInput = await getInput('#count-input-6');
            const countHost = await countInput.host();
            countHost.dispatchEvent('keyup');
            fixture.detectChanges();
            expect(spy).toHaveBeenCalled();
        }));

        it('should call updateTotalQuantity on change', fakeAsync(async () => {
            let spy = jest.spyOn(component, 'updateTotalQuantity');
            initialize('edit', component.allCategories);
            const input = await getInput('#count-input-6');
            const host = await input.host();
            host.dispatchEvent('change');
            fixture.detectChanges();
            expect(spy).toHaveBeenCalled();
        }));

        describe('calculator', () => {
            describe.each`
                isEnabled
                ${true}
                ${false}
            `(`feature flag`, ({ isEnabled }) => {
                it(`should ${isEnabled ? 'not ' : ''}be hidden if the feature is ${
                    isEnabled ? 'enabled' : 'disabled'
                }`, fakeAsync(() => {
                    jest.spyOn(component.featureFlagFacade, 'isEnabled').mockReturnValueOnce(of(isEnabled));
                    initialize('edit', component.allCategories);
                    component.addCalculatorFields();
                    flush();
                    fixture.detectChanges();

                    const calculatorToggles = fixture.debugElement.query(By.css('#calculator-slider'));

                    if (isEnabled) {
                        expect(calculatorToggles).toBeTruthy();
                    } else {
                        expect(calculatorToggles).toBeFalsy();
                    }
                }));
            });

            it.each`
                checked
                ${true}
                ${false}
            `(
                'should change uom when slide toggle $checked',
                fakeAsync(({ checked }) => {
                    initialize('edit', component.allCategories);
                    const id = component.form.getArray('counts').controls[6].get('id').value;
                    component.addCalculatorFields();
                    component.setHeight(component.form.getArray('counts').controls[6], 6);
                    component.physicalInventoryFacade.calculateVolume = jest.fn(() => of(100));
                    component.getVolume(checked, component.form.getArray('counts').controls[6], 6);
                    fixture.detectChanges();
                    if (checked) {
                        expect(component.physicalInventoryFacade.calculateVolume).toBeCalled();
                        expect(component.form.getArray('counts').controls[6].get('actualCount').value).toEqual(100);
                        expect(component.slideToggleLabels.get(id)).toEqual(
                            component.volumeToHeightCodes.get(id).volume
                        );
                    } else {
                        component.setHeight(component.form.getArray('counts').controls[6], 6);
                        expect(
                            component.form.getArray('counts').controls[6].get('volumeCalculatorEnabled').value
                        ).toEqual(true);
                        expect(component.physicalInventoryFacade.calculateVolume).not.toBeCalled();
                        expect(component.slideToggleLabels.get(id)).toEqual(
                            component.volumeToHeightCodes.get(id).height
                        );
                    }
                })
            );

            describe.each`
                countValue
                ${100}
                ${0}
            `('slider toggle', ({ countValue }) => {
                beforeEach(() => {
                    component.physicalInventoryFacade.searchCountProductsByCategories = jest.fn(() =>
                        of([{ ...testPhysicalInventoryCounts[6], actualCount: countValue }])
                    );
                });
                it(`should ${
                    countValue != 0 ? '' : 'not '
                }be toggled to volume by default when the count value is ${countValue}`, fakeAsync(() => {
                    initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'OPEN' } });
                    const id = component.form.getArray('counts').controls[0].get('id').value;
                    if (countValue != 0) {
                        expect(component.innerLabels.get(id)).toEqual(component.sliderInnerLabel.volume);
                    } else {
                        expect(component.innerLabels.get(id)).toEqual(component.sliderInnerLabel.height);
                    }
                }));
            });

            it('should handle errors', fakeAsync(() => {
                const testError = 'Test Error';
                const generateResponse = new Subject<any>();
                jest.spyOn(component.physicalInventoryFacade, 'calculateVolume').mockReturnValue(generateResponse);
                initialize('edit', component.allCategories);
                component.addCalculatorFields();
                component.setHeight(component.form.getArray('counts').controls[6], 6);
                component.getVolume(true, component.form.getArray('counts').controls[6], 6);

                generateResponse.error(testError);
                // after api call has finished
                expect(() => {
                    flush();
                }).toThrowError(testError);
                expect(component.isLoadingCount[6]).toBeFalsy();
                expect(component.form.getArray('counts').controls[6].get('actualCount').value).toEqual(0.0);
            }));
        });

        describe('applying warning', () => {
            it.each`
                status
                ${'CLOSED'}
                ${'FINALIZED'}
            `(
                'should not apply warnings when the status is $status',
                fakeAsync(({ status }) => {
                    initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: status } });
                    component.form.getArray('counts').controls.forEach((c) => expect(c.get('warning')).toBeNull());
                })
            );

            describe.each`
                countValue
                ${100}
                ${99}
                ${10}
                ${null}
            `('max stock limit', ({ countValue }) => {
                beforeEach(() => {
                    component.physicalInventoryFacade.searchCountProductsByCategories = jest.fn(() =>
                        of([{ ...testPhysicalInventoryCounts[0], actualCount: countValue, maxStockLimit: 99 }])
                    );
                });

                it(`should ${
                    countValue > 99 ? '' : 'not '
                }be displayed when the count value is ${countValue}`, fakeAsync(() => {
                    initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'OPEN' } });
                    if (countValue > 99) {
                        expect(component.form.getArray('counts').controls[0].get('warning')?.value).toContain(
                            'Greater than max stock limit 99'
                        );
                    } else if (isNullOrUndefined(countValue)) {
                        expect(component.form.getArray('counts').controls[0].get('warning')).toBeNull();
                    } else {
                        expect(component.form.getArray('counts').controls[0].get('warning').value).toEqual([]);
                    }
                }));
            });

            it('should not display a max stock limit warning if the max stock limit is null', fakeAsync(() => {
                component.physicalInventoryFacade.searchCountProductsByCategories = jest.fn(() =>
                    of([{ ...testPhysicalInventoryCounts[0], maxStockLimit: null }])
                );
                initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'OPEN' } });
                expect(component.form.getArray('counts').controls[0].get('warning').value).toEqual([]);
            }));

            describe.each`
                countValue
                ${11}
                ${10}
                ${5}
                ${null}
            `('exceeded variance', ({ countValue }) => {
                const tolerance = 100;
                const quantityOnHand = 5;
                beforeEach(() => {
                    component.parameterFacade.findStoreParameterValue = jest.fn(() => of(tolerance));
                    component.physicalInventoryFacade.searchCountProductsByCategories = jest.fn(() =>
                        of([{ ...testPhysicalInventoryCounts[0], actualCount: countValue, quantityOnHand }])
                    );
                });

                it(`should ${
                    countValue > quantityOnHand ? '' : 'not '
                }be displayed when the count value is ${countValue}, the tolerance is ${tolerance} and the QOH is ${quantityOnHand}`, fakeAsync(() => {
                    const minExceededValue = 10;
                    initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'OPEN' } });
                    if (countValue > minExceededValue) {
                        expect(component.form.getArray('counts').controls[0].get('warning')?.value).toContain(
                            `Greater than variance ${tolerance}%`
                        );
                    } else if (isNullOrUndefined(countValue)) {
                        expect(component.form.getArray('counts').controls[0].get('warning')).toBeNull();
                    } else {
                        expect(component.form.getArray('counts').controls[0].get('warning').value).toEqual([]);
                    }
                }));
            });

            it('should not display a variance warning if the QOH is null', fakeAsync(() => {
                component.physicalInventoryFacade.searchCountProductsByCategories = jest.fn(() =>
                    of([{ ...testPhysicalInventoryCounts[0], quantityOnHand: null }])
                );
                initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'OPEN' } });
                expect(component.form.getArray('counts').controls[0].get('warning').value).toEqual([]);
            }));
        });
    });
    describe('show Warning', () => {
        it.each`
            status
            ${'CLOSED'}
            ${'FINALIZED'}
        `(
            'should not display warning checkbox when the status is $status',
            fakeAsync(({ status }) => {
                initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: status } });
                fixture.detectChanges();
                const showWarning = fixture.debugElement.query(By.css('#show-warning'));
                expect(showWarning).toBeNull();
            })
        );
        it('should  display warning checkbox when the status is open', fakeAsync(async () => {
            initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'OPEN' } });
            fixture.detectChanges();
            const showWarning = fixture.debugElement.query(By.css('#show-warning'));
            expect(showWarning).not.toBeNull();
        }));

        it('should not display warnings', fakeAsync(async () => {
            initialize('edit', component.allCategories);
            component.form = null;
            component.warningFilter(true);
            expect(component.products.data[0].get('warning')?.value).toEqual([]);
        }));

        it('should display Only Warning', fakeAsync(async () => {
            initialize('edit', component.allCategories);
            const warnings = ['test warning 1', 'test warning 2'];
            component.form.getArray('counts').controls[0].get('warning').setValue(warnings);
            component.form.getArray('counts').controls[1].get('warning').setValue([]);
            component.warningFilter(true);
            expect(component.products.data[0].get('warning')?.value).toEqual(warnings);
            expect(component.products.data[1]).toBeUndefined();
            component.warningFilter(false);
            expect(component.products.data[0].get('warning')?.value).toEqual(warnings);
            expect(component.products.data[1].get('warning')?.value).toEqual([]);
        }));

        it('should be able to check the show warning box before selecting a category', fakeAsync(async () => {
            jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
            initialize('edit');
            component.warningFilter(true);
            expect(component.showWarning).toEqual(true);
            component.form.markAsDirty();
            component.categoryControl.setValue(component.allCategories);
            component.getProductByCategories();
            flush();
            expect(window.confirm).toHaveBeenCalled();
            expect(component.categoryControl.value).toEqual(component.allCategories);
        }));
    });

    describe('get Product By Categories on Open-Close Event', () => {
        function openChanged(event: boolean) {
            if (!event) {
                const spy = jest.spyOn(component, 'getProductByCategories');
                component.openChangedEvent(event);
                expect(spy).toHaveBeenCalled();
            } else {
                const spy = jest.spyOn(component, 'resetCategories');
                component.openChangedEvent(event);
                expect(spy).toHaveBeenCalled();
            }
        }
        it.each`
            event
            ${true}
            ${false}
        `(
            'should create when event=$event',
            fakeAsync((event) => {
                initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'open' } });
                component.categoryControl.setValue(testProductCategories);
                component.currentCategories = testProductCategories;
                openChanged(event);
                component.categoryControl.setValue(component.allCategories.concat(testProductCategories));
                component.currentCategories = component.allCategories.concat(testProductCategories);
                openChanged(event);
                component.categoryControl.setValue(component.allCategories);
                component.currentCategories = component.allCategories;
                openChanged(event);
                component.categoryControl.setValue(testProductCategories);
                component.currentCategories = testProductCategories;
                component.categoryCode = [];
                openChanged(event);
                component.categoryControl.setValue([]);
                openChanged(event);
                component.categoryControl = null;
                openChanged(event);
            })
        );
    });
    describe('get Product By Categories', () => {
        it('should create when categories selected', fakeAsync(() => {
            initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'open' } });
            component.categoryControl.setValue(testProductCategories);
            component.getProductByCategories();
            tick(100); // clear timers in queue
            expect(component.categoryControl.value).toEqual(component.currentCategories);
            component.getProductByCategories();
            tick(100); // clear timers in queue
            expect(component.currentCategories).toEqual(component.categoryControl.value);
            component.categoryControl.setValue(component.allCategories);
            component.getProductByCategories();
            tick(100); // clear timers in queue
            expect(component.categoryControl.value).toEqual(component.currentCategories);
            component.getProductByCategories();
            tick(100); // clear timers in queue
            expect(component.currentCategories).toEqual(component.categoryControl.value);
        }));
    });

    describe('Select all Category codes', () => {
        it('should select All categories if All option checked', fakeAsync(() => {
            initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'open' } });
            component.categoryControl.setValue(component.allCategories);
            component.selectCategoryCodes(component.allCategories[0]);
            expect(component.categoryControl.value).toEqual(component.allCategories.concat(testProductCategories));
        }));

        it('should unselect all categories if All option unchecked', fakeAsync(() => {
            initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'open' } });
            component.categoryControl.setValue(testProductCategories);
            component.selectCategoryCodes(component.allCategories[0]);
            expect(component.categoryControl.value.length).toEqual(0);
        }));

        it('should unselect All option if category unchecked', fakeAsync(() => {
            initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'open' } });
            component.categoryControl.setValue(component.allCategories);
            component.selectCategoryCodes(component.allCategories[0]);
            component.categoryControl.value.splice(
                component.categoryControl.value.indexOf(testProductCategories[1]),
                1
            );
            component.selectCategoryCodes(testProductCategories[1]);
            expect(component.categoryControl.value[0]).not.toEqual(component.allCategories[0]);
            component.categoryControl.value.splice(
                component.categoryControl.value.indexOf(testProductCategories[2]),
                1
            );
            component.selectCategoryCodes(testProductCategories[2]);
            expect(component.categoryControl.value[0]).not.toEqual(component.allCategories[0]);
        }));

        it('should select ALL option if all categories selected', fakeAsync(() => {
            initialize('edit', component.allCategories, { ...testPhysicalInventory, status: { code: 'open' } });
            //select all option
            component.categoryControl.setValue(component.allCategories);
            component.selectCategoryCodes(component.allCategories[0]);
            //Unchecked  options, It will remove all selection
            component.categoryControl.value.splice(
                component.categoryControl.value.indexOf(testProductCategories[1]),
                1
            );
            component.selectCategoryCodes(testProductCategories[1]);
            component.categoryControl.value.splice(
                component.categoryControl.value.indexOf(testProductCategories[2]),
                1
            );
            component.selectCategoryCodes(testProductCategories[2]);
            expect(component.categoryControl.value).not.toEqual(component.allCategories.concat(testProductCategories));
            //Again check same options one by one,It will again select All option
            component.categoryControl.value.push(testProductCategories[1]);
            component.selectCategoryCodes(testProductCategories[1]);
            expect(component.categoryControl.value).not.toEqual(component.allCategories.concat(testProductCategories));
            component.categoryControl.value.push(testProductCategories[2]);
            component.selectCategoryCodes(testProductCategories[2]);
            expect(component.categoryControl.value).toEqual(component.allCategories.concat(testProductCategories));
            //Option all Unchecked
            component.categoryControl.setValue(component.allCategories.concat(testProductCategories));
            //Unchecked  all option, It will remove all selection
            component.categoryControl.value.splice(
                component.categoryControl.value.indexOf(component.allCategories[0]),
                1
            );
            component.selectCategoryCodes(component.allCategories[0]);
            expect(component.categoryControl.value.length).toEqual(0);
        }));
    });

    describe('category filter', () => {
        const getCategoryInput = (): MockFilteredInputComponent => {
            return fixture.debugElement.query(By.css('#category-filter')).componentInstance;
        };

        it('should pass a list of categories', fakeAsync(() => {
            initialize('edit', component.allCategories);
            expect(getCategoryInput().options).toEqual(component.allCategories.concat(testProductCategories));
        }));

        it('should update the current category List', fakeAsync(() => {
            initialize('edit', component.allCategories);
            expect(component.categoryControl.value).toEqual(component.allCategories);
        }));

        it('should map ALL to null', fakeAsync(() => {
            initialize('edit', component.allCategories);
            fixture.detectChanges();
            expect(component.physicalInventoryFacade.searchCountProductsByCategories).toHaveBeenCalledWith(
                testPhysicalInventory.id,
                null,
                false
            );
        }));

        it('should prevent the user from selecting a category when the table is loading', fakeAsync(() => {
            initialize('edit', component.allCategories);
            const categoryInput = getCategoryInput();
            // should be editable when not loading products
            expect(categoryInput.editable).toEqual(true);
            component.isLoadingProducts = true;
            fixture.detectChanges();
            // should NOT be editable when not loading products
            expect(categoryInput.editable).toEqual(false);
        }));

        describe.each`
            disableWarning
            ${true}
            ${false}
        `('show warnings checkbox', ({ disableWarning }) => {
            it(`should be ${disableWarning ? 'disabled' : 'enabled'} when ${
                disableWarning ? '' : 'not '
            }searching`, fakeAsync(async () => {
                initialize('edit', component.allCategories);

                component.isShowWarningDisabled = disableWarning;
                fixture.detectChanges();

                const warningCheckbox = loader.getHarness(
                    MatCheckboxHarness.with({
                        selector: '#show-warning',
                    })
                );
                expect(await (await warningCheckbox).isDisabled()).toEqual(disableWarning);
            }));
        });

        describe.each`
            SHOW_VARIANCE_BOOK_ON_PHY_INV
            ${true}
            ${false}
        `('initialize form', ({ SHOW_VARIANCE_BOOK_ON_PHY_INV }) => {
            it(`should ${
                SHOW_VARIANCE_BOOK_ON_PHY_INV ? '' : 'not '
            }  initialize the table with variance values`, fakeAsync(() => {
                const changeDetectorSpy = jest.spyOn(component['changeDetector'], 'detectChanges');
                jest.spyOn(component.parameterFacade, 'findStoreParameterValue').mockReturnValue(
                    of(SHOW_VARIANCE_BOOK_ON_PHY_INV)
                );
                jest.spyOn(component, 'initializeForm');
                jest.spyOn(component, 'initializeTable');
                initialize('edit', component.allCategories);
                expect(component.initializeForm).toHaveBeenCalled();
                expect(component.initializeTable).toHaveBeenCalled();
                expect(changeDetectorSpy).toHaveBeenCalled();
                expect(component.products.data).toEqual(
                    component.form.getArray('counts').controls as TypedFormGroup<PhysicalInventoryCount>[]
                );
                if (SHOW_VARIANCE_BOOK_ON_PHY_INV) {
                    expect(component.displayedColumns).toContain('variance');
                    expect(component.displayedColumns).toContain('qohCountWhenOpened');
                    expect(component.displayedColumns).toContain('qohCountWhenClosed');
                } else {
                    expect(component.displayedColumns).not.toContain('variance');
                    expect(component.displayedColumns).not.toContain('qohCountWhenOpened');
                    expect(component.displayedColumns).not.toContain('qohCountWhenClosed');
                }
            }));
        });

        it('should reset the counts control', fakeAsync(() => {
            jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
            initialize('edit', component.allCategories);
            const resertSpy = jest.spyOn(component.form.getControl('counts'), 'reset');

            // make the form dirty and mock confirming the unsaved changes message
            component.form.markAsDirty();
            component.categoryControl.setValue(testProductCategories);
            component.getProductByCategories();
            flush();
            expect(component.form.dirty).toEqual(false);
            expect(resertSpy).toHaveBeenCalled();
        }));
    });

    describe('product table', () => {
        describe.each`
            accessMode
            ${'edit'}
            ${'view'}
        `('with $accessMode accessMode', ({ accessMode }) => {
            it(`should ${
                accessMode === 'edit' ? '' : 'disable '
            }row selection and count field with ${accessMode} accessMode`, fakeAsync(() => {
                initialize(accessMode, component.allCategories);
                component.form
                    .getArray('counts')
                    // filter closed product counts because they will have no checkbox
                    .controls.filter((c: TypedFormGroup<PhysicalInventoryCount>) => !c.disabled)
                    .forEach(async (v: TypedFormGroup<PhysicalInventoryCount>) => {
                        const index = v.getRawValue().id.line;
                        const rowCount = await getInput(`#count-input-${index}`);
                        if (accessMode === 'edit') {
                            const rowCheckbox = await getCheckbox(`#checkbox-${index}`);
                            expect(await rowCheckbox.isDisabled()).toEqual(false);
                            expect(await rowCount.isDisabled()).toEqual(false);
                        } else {
                            expect(fixture.debugElement.query(By.css(`#checkbox-${index}`))).toBeFalsy();
                            expect(await rowCount.isDisabled()).toEqual(true);
                        }
                    });
            }));
        });

        describe('row selection', () => {
            beforeEach(fakeAsync(() => {
                initialize('edit', component.allCategories);
            }));

            it('should allow the user to select all records', async () => {
                jest.spyOn(component, 'masterToggle');
                await clickCheckbox('#select-all-checkbox');
                expect(component.masterToggle).toHaveBeenCalled();
                component.form
                    .getArray('counts')
                    .controls.filter((c: TypedFormGroup<PhysicalInventoryCount>) => !c.disabled)
                    .forEach(async (v: TypedFormGroup<PhysicalInventoryCount>, i) => {
                        expect(await isChecked(`#checkbox-${i}`)).toEqual(true);
                        expect(component.selection.isSelected(v)).toEqual(true);
                    });
            });
            describe('when changing the category dropdown', () => {
                it('should clear all selection checkboxes', async () => {
                    jest.spyOn(component, 'masterToggle');
                    jest.spyOn(component.selection, 'clear');

                    await clickCheckbox('#select-all-checkbox');
                    expect(await isChecked('#select-all-checkbox')).toBeTruthy();

                    // validate select all checkboxes are cleared
                    component.categoryControl.setValue(testProductCategories);
                    component.getProductByCategories();
                    expect(component.selection.clear).toHaveBeenCalled();
                    expect(await isChecked('#select-all-checkbox')).toBeFalsy();
                });
                it('should not display items selected text', async () => {
                    // validate the items selected text is displayed
                    await clickCheckbox('#checkbox-0');
                    fixture.detectChanges();
                    expect(fixture.debugElement.query(By.css('#items-selected-text')).nativeElement.innerHTML).toEqual(
                        '1 item(s) selected'
                    );

                    // validate the text is removed
                    component.categoryControl.setValue(testProductCategories);
                    component.getProductByCategories();
                    expect(fixture.debugElement.query(By.css('#items-selected-text'))).toBeNull();
                });
            });

            it('should allow the user to select individual rows', async () => {
                await clickCheckbox('#checkbox-0');
                expect(await isChecked('#checkbox-0')).toEqual(true);
                expect(component.selection.isSelected(component.products.data[0])).toEqual(true);
                // nothing else should be selected
                expect(await isChecked('#checkbox-1')).toEqual(false);
                expect(component.selection.isSelected(component.products.data[1])).toEqual(false);
            });

            it('should remove the select all if all counts are disabled', () => {
                component.products.data.forEach((c) => c.disable());
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('#select-all-checkbox'))).toBeFalsy();
            });
        });

        describe('sorting', () => {
            it.each`
                column
                ${'product-code-header'}
                ${'category-code-header'}
                ${'uom-header'}
                ${'count-header'}
                ${'closed-date-header'}
                ${'qohCountWhenOpened-header'}
                ${'qohCountWhenClosed-header'}
                ${'variance-header'}
            `(
                'should be sortable by the $column column',
                fakeAsync(async ({ column }) => {
                    jest.spyOn(component.parameterFacade, 'findStoreParameterValue').mockReturnValue(of(true));
                    initialize('edit', component.allCategories);
                    jest.spyOn(component.products, 'sortingDataAccessor');
                    expect(component.products.sort).toBeTruthy();

                    const headerButton = loader.getHarness(
                        MatSortHeaderHarness.with({
                            selector: `#${column}`,
                        })
                    );
                    await (await headerButton).click();
                    expect(await (await headerButton).isActive()).toEqual(true);
                    expect(component.products.sortingDataAccessor).toHaveBeenCalled();
                })
            );

            it.each`
                column
                ${'uom-header'}
            `(
                'should be sortable by the $column column for height uom',
                fakeAsync(async ({ column }) => {
                    jest.spyOn(component.parameterFacade, 'findStoreParameterValue').mockReturnValue(of(true));
                    initialize('edit', component.allCategories);
                    component.getVolume(false, component.form.getArray('counts').controls[6], 6);
                    fixture.detectChanges();
                    jest.spyOn(component.products, 'sortingDataAccessor');
                    expect(component.products.sort).toBeTruthy();
                    const headerButton = loader.getHarness(
                        MatSortHeaderHarness.with({
                            selector: `#${column}`,
                        })
                    );
                    await (await headerButton).click();
                    expect(await (await headerButton).isActive()).toEqual(true);
                    expect(component.products.sortingDataAccessor).toHaveBeenCalled();
                })
            );
        });
        describe('updating counts', () => {
            const getCountInput = async (index = 0) =>
                loader.getHarness(MatFormFieldHarness.with({ selector: `#count-form-field-${index}` }));

            beforeEach(fakeAsync(() => {
                jest.spyOn(component.physicalInventoryFacade, 'updateCount').mockReturnValueOnce(
                    of(updatedPhysicalInventory)
                );
                initialize('edit', component.allCategories);
            }));

            it('should apply the decimal places directive', async () => {
                const countInput = await getInput('#count-input-0');
                const countHost = await countInput.host();
                // Expect empty string since no additional params are passed
                expect(await countHost.getAttribute('viocangulardecimalplaces')).toEqual('');
            });

            it('should display validation errors', async () => {
                const countControl = component.products.data[0].getControl('actualCount');
                countControl.setValue(-1);
                countControl.markAsTouched();
                expect(await (await getCountInput()).getTextErrors()).toEqual(['Value cannot be less than 0']);
            });
        });

        describe('closing counts', () => {
            const getCloseButton = async () => loader.getHarness(MatButtonHarness.with({ selector: '#close-action' }));
            const closeCount = async (
                row: { rowNumber: number; quantity: number }[] = [{ rowNumber: 0, quantity: 1 }]
            ) => {
                row.forEach(async (r) => {
                    jest.spyOn(component, 'closeCount');
                    jest.spyOn(component, 'closeBatchedCounts');
                    jest.spyOn(component.physicalInventoryFacade, 'closeCount').mockReturnValueOnce(
                        of(updatedPhysicalInventory)
                    );
                    if (component.form.getArray('counts').controls[r.rowNumber].get('volumeCalculatorEnabled').value) {
                        component.setHeight(component.form.getArray('counts').controls[r.rowNumber], r.rowNumber);
                        component.physicalInventoryFacade.calculateVolume = jest.fn(() => of(100));
                    }
                    component.form.getArray('counts').controls[r.rowNumber].get('actualCount').setValue(r.quantity);
                    await clickCheckbox(`#checkbox-${r.rowNumber}`);
                    await (await getCloseButton()).click();
                });
                flush();
                tick(600); // need to wait for the time on the disable double click debounce
            };
            const closeBatchCount = async (
                row: { rowNumber: number; quantity: number }[] = [{ rowNumber: 0, quantity: 1 }]
            ) => {
                await clickCheckbox(`#select-all-checkbox`);
                const arrChunk = chunk(row, 500);
                arrChunk.forEach(async (r) => {
                    jest.spyOn(component, 'closeCount');
                    jest.spyOn(component, 'closeBatchedCounts');
                    jest.spyOn(component.physicalInventoryFacade, 'closeCount').mockReturnValueOnce(
                        of(updatedPhysicalInventory)
                    );
                });
                await (await getCloseButton()).click();
                flush();
            };

            beforeEach(fakeAsync(() => {
                component.parameterFacade.findStoreParameterValue = jest.fn(() => of(50));
                jest.spyOn(component.closeCountWarningDialog, 'open');
                jest.spyOn(component.closeCountWarningDialog, 'close');
                jest.spyOn(component, 'closeCount');
                jest.spyOn(component.parameterFacade, 'findStoreParameterValue').mockReturnValue(of(true));
                initialize('edit', component.allCategories);
            }));

            describe.each`
                rowNumber
                ${0}
                ${5}
            `('closing a row', ({ rowNumber }) => {
                it(`should trigger the selected row ${rowNumber} to be CLOSED`, fakeAsync(async () => {
                    await closeCount([{ rowNumber, quantity: 576 }]);
                    const updateModel = Object.assign(
                        { ...component.model },
                        {
                            ...testPhysicalInventory,
                            counts: [{ ...testPhysicalInventoryCounts[rowNumber], warning: [] }],
                        }
                    );
                    expect(component.closeCount).toHaveBeenCalled();
                    expect(component.physicalInventoryFacade.closeCount).toHaveBeenCalledWith(updateModel);
                }));
            });

            it(`should trigger the selected row to be closed with volume calculation`, fakeAsync(async () => {
                await closeCount([{ rowNumber: 6, quantity: 576 }]);
                const updateModel = Object.assign(
                    { ...component.model },
                    {
                        ...testPhysicalInventory,
                        counts: [{ ...testPhysicalInventoryCounts[6], height: 100, warning: [] }],
                    }
                );
                const id = component.form.getArray('counts').controls[6].get('id').value;
                const label = component.slideToggleLabels.get(id);
                expect(component.closeCount).toHaveBeenCalled();
                expect(label).toEqual(component.volumeToHeightCodes.get(id).volume);
                expect(component.physicalInventoryFacade.closeCount).toHaveBeenCalledWith(updateModel);
            }));

            it('should call batchCloseCounts', fakeAsync(async () => {
                jest.spyOn(component, 'batchCloseCounts');
                expect(component.closeBatchCounts.length).toEqual(0);
            }));

            it('should check the dirty state of the control', () => {
                expect(component.unsavedChanges).toBeFalsy();
                component.closeBatchCounts = [{ rowNumber: 1, quantity: 456 }];
                expect(component.unsavedChanges).toBeTruthy();
            });

            it('should call close batch counts', fakeAsync(async () => {
                component.physicalInventoryFacade.calculateVolume = jest.fn(() => of(100));
                const arr = Array(1000)
                    .fill(null)
                    .map((_, id) => ({ rowNumber: 1 + id, quantity: 456 + id }));
                await closeBatchCount(arr);
                tick(600); // need to wait for the time on the disable double click debounce
                expect(component.closeBatchedCounts).toHaveBeenCalled();
                expect(component.closeCount).toHaveBeenCalled();
            }));

            it('should prompt user to warn about the max zero quantity products allow', fakeAsync(async () => {
                jest.spyOn(component, 'openCloseCountWarningDialog');
                component.parameterFacade.findStoreParameterValue = jest.fn(() => of(1));
                await closeCount([{ rowNumber: 0, quantity: 0 }]);
                // validate that dialog was opened
                expect(component.openCloseCountWarningDialog).toHaveBeenCalled();
                expect(component.closeCountWarningDialog.open).toHaveBeenCalled();
            }));
            it('should close prompt after going back on the close count warning dialog', fakeAsync(async () => {
                jest.spyOn(component, 'openCloseCountWarningDialog');
                jest.spyOn(component, 'closeCloseCountWarningDialog');
                component.parameterFacade.findStoreParameterValue = jest.fn(() => of(1));
                await closeCount([{ rowNumber: 0, quantity: 0 }]);
                // validate that dialog was opened
                expect(component.openCloseCountWarningDialog).toHaveBeenCalled();
                expect(component.closeCountWarningDialog.open).toHaveBeenCalled();

                const goBackButton = fixture.debugElement.query(By.css('#go-back-dialog-button'));
                expect(goBackButton).toBeTruthy();
                // click on go Back button
                goBackButton.nativeElement.click();
                fixture.detectChanges();

                // validate that dialog was closed
                expect(component.closeCloseCountWarningDialog).toHaveBeenCalled();
                expect(component.closeCountWarningDialog.close).toHaveBeenCalled();
            }));

            it('should not prompt user to warn about the max zero quantity products allow', fakeAsync(async () => {
                jest.spyOn(component, 'openCloseCountWarningDialog');
                component.parameterFacade.findStoreParameterValue = jest.fn(() => of(100));
                await closeCount([
                    { rowNumber: 0, quantity: 0 },
                    { rowNumber: 1, quantity: 1 },
                ]);
                // validate that dialog was opened
                expect(component.openCloseCountWarningDialog).not.toHaveBeenCalled();
                expect(component.closeCountWarningDialog.open).not.toHaveBeenCalled();
            }));

            it('should close the dialog and call closeCount()', fakeAsync(async () => {
                jest.spyOn(component, 'openCloseCountWarningDialog');
                jest.spyOn(component, 'closeCloseCountWarningDialog');
                jest.spyOn(component, 'closeCount');
                component.parameterFacade.findStoreParameterValue = jest.fn(() => of(1));
                await closeCount([{ rowNumber: 0, quantity: 0 }]);
                // validate that dialog was opened
                expect(component.openCloseCountWarningDialog).toHaveBeenCalled();
                expect(component.closeCountWarningDialog.open).toHaveBeenCalled();
                component.closeCountWarningDialog.dialogRef = {
                    getState: jest.fn(() => 0),
                } as unknown as MatDialogRef<any>;

                // press close on the dialog
                const closeButton = fixture.debugElement.query(By.css('#close-dialog-button'));
                expect(closeButton).toBeTruthy();
                // click on close button
                closeButton.nativeElement.click();
                flush();
                fixture.detectChanges();

                // validate that dialog was close
                expect(component.closeCloseCountWarningDialog).toHaveBeenCalled();
                expect(component.closeCountWarningDialog.close).toHaveBeenCalled();

                // validate that closeCount was called
                expect(component.closeCount).toHaveBeenCalled();
            }));

            it('should clear the selected values', fakeAsync(async () => {
                jest.spyOn(component.selection, 'clear');
                await closeCount();
                expect(component.selection.clear).toHaveBeenCalled();
            }));

            it('should be disabled if a value is being saved', fakeAsync(async () => {
                jest.spyOn(component, 'closeCount');
                const product = component.products.data[0];
                component.selection.select(product);
                await clickCheckbox('#checkbox-1');
                // button should be displayed
                expect(await (await getCloseButton()).isDisabled()).toEqual(false);
                await closeCount();
                // button should be hidden again once
                expect(fixture.debugElement.query(By.css('#close-action'))).toBeFalsy();
            }));

            it('should be disabled if a value is being saved', fakeAsync(async () => {
                jest.spyOn(component, 'closeCount');
                const product = component.products.data[0];
                component.selection.select(product);
                await clickCheckbox('#checkbox-1');
                // button should be displayed
                expect(await (await getCloseButton()).isDisabled()).toEqual(false);
                await closeCount();
                // button should be hidden again once
                expect(fixture.debugElement.query(By.css('#close-action'))).toBeFalsy();
            }));

            it('should update the selected count values with the return from the API', fakeAsync(async () => {
                await closeCount();
                // check default details for updated values
                expect(component.form.getControlValue('status')).toEqual(updatedPhysicalInventory.status);
                expect(component.form.getControlValue('finalizedOn')).toEqual(updatedPhysicalInventory.finalizedOn);
                expect(component.form.getControlValue('updatedBy')).toEqual(updatedPhysicalInventory.updatedBy);
                expect(component.form.getControlValue('updatedByEmployee')).toEqual(
                    updatedPhysicalInventory.updatedByEmployee
                );
                expect(component.form.getControlValue('updatedOn')).toEqual(updatedPhysicalInventory.updatedOn);
                expect(component.form.getControlValue('version')).toEqual(updatedPhysicalInventory.version);

                // check count updated values
                const count = component.products.data[0].getRawValue();
                const updatedCount = updatedPhysicalInventory.counts[0];
                expect(count.actualCount).toEqual(updatedCount.actualCount);
                expect(count.closedOn).toEqual(updatedCount.closedOn);
                expect(count.status).toEqual(updatedCount.status);
                expect(count.version).toEqual(updatedCount.version);
                expect(count.variance).toEqual(updatedCount.variance);
                expect(count.qohCountWhenClosed).toEqual(updatedCount.qohCountWhenClosed);
            }));

            it('should not close if any of the selected rows are invalid', fakeAsync(async () => {
                jest.spyOn(component.messageFacade, 'addMessage');
                closeCount([
                    { rowNumber: 0, quantity: -133 },
                    { rowNumber: 2, quantity: null },
                ]);

                await clickCheckbox('#select-all-checkbox');
                jest.spyOn(component.physicalInventoryFacade, 'closeCount');
                await (await getCloseButton()).click();
                tick(600); // need to wait for the time on the disable double click debounce
                expect(component.physicalInventoryFacade.closeCount).not.toHaveBeenCalled();
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'error',
                    message:
                        'The following products have validation errors and cannot be closed: ' +
                        testPhysicalInventoryCounts[0].product.code +
                        ', ' +
                        testPhysicalInventoryCounts[2].product.code,
                });
            }));

            it('should remove the warning when a product is closed', fakeAsync(async () => {
                const warnings = ['test warning 1', 'test warning 2'];
                jest.spyOn(component, 'closeCount');
                jest.spyOn(component.physicalInventoryFacade, 'closeCount').mockReturnValueOnce(
                    of(updatedPhysicalInventory)
                );
                component.form.getArray('counts').controls[0].get('warning').setValue(warnings);
                component.form.getArray('counts').controls[0].get('actualCount').setValue(5);
                await clickCheckbox(`#checkbox-${0}`);
                expect(component.form.getArray('counts').controls[0].get('warning')?.value).toEqual(warnings);
                await (await getCloseButton()).click();
                flush();
                tick(600); // need to wait for the time on the disable double click debounce
                const id = component.form.getArray('counts').controls[1].get('id').value;
                expect(component.form.getArray('counts').controls[0].get('warning')?.value).toEqual([]);
                expect(component.innerLabels.get(id)).toEqual(component.sliderInnerLabel.height);
                expect(component.slideToggleLabels.get(id)).toEqual(component.volumeToHeightCodes.get(id).height);
            }));

            it('should only close the selected counts once', fakeAsync(async () => {
                jest.spyOn(component, 'closeCount');
                jest.spyOn(component.physicalInventoryFacade, 'closeCount').mockReturnValueOnce(
                    of(updatedPhysicalInventory)
                );
                component.form.getArray('counts').controls[0].get('actualCount').setValue(5);
                await clickCheckbox('#checkbox-0');
                // Multiple clicks to close button should still call the api once
                (await getCloseButton()).click();
                (await getCloseButton()).click();
                (await getCloseButton()).click();
                flush();
                tick(600); // need to wait for the time on the disable double click debounce
                // Expect only one api call
                expect(component.closeCount).toHaveBeenCalledTimes(1);
            }));
        });
    });

    describe('count by location', () => {
        it('should change view to countByLocation mode when toggled', fakeAsync(() => {
            initialize('edit', component.allCategories);
            expect(fixture.debugElement.query(By.css('#select-location'))).toBeFalsy();
            expect(fixture.debugElement.query(By.css('#filter-product-input'))).toBeFalsy();
            expect(fixture.debugElement.query(By.css('#total-quantity-header'))).toBeFalsy();

            component.toggleCountByLocation({ checked: true });
            tick(100); // clear timers in queue
            expect(fixture.debugElement.query(By.css('#select-location'))).toBeTruthy();
            expect(fixture.debugElement.query(By.css('#filter-product-input'))).toBeTruthy();
            expect(fixture.debugElement.query(By.css('#total-quantity-header'))).toBeTruthy();
        }));

        describe('switching locations', () => {
            beforeEach(fakeAsync(async () => {
                initialize('edit');
                component.toggleCountByLocation({ checked: true });

                // update the actual count
                const input = await loader.getHarness(MatInputHarness.with({ selector: '#count-input-0' }));
                await input.setValue('10');
                expect(component.products.data[0].getControlValue('actualCount')).toEqual(10);
            }));

            const selectLocation = async () => {
                // select a different location from the dropdown
                const select = await loader.getHarness(MatSelectHarness);
                await select.open();
                const options = await select.getOptions();
                await options[1].click();
            };

            it(`should reset the actual count to 0`, fakeAsync(async () => {
                await selectLocation();
                expect(component.products.data[0].getControlValue('actualCount')).toEqual(0);
            }));

            it(`should record the previous count and location`, fakeAsync(async () => {
                component.updateTotalQuantity(component.products.data[0]);
                await selectLocation();
                expect(component.products.data[0].getControlValue('countsByLocation')).toEqual([
                    { count: 10, location: 'BAY' },
                ]);
            }));

            it(`should maintain the location option selected when apply is press`, fakeAsync(async () => {
                jest.spyOn(component, 'resetActualCount');
                jest.spyOn(component, 'ngOnInit');
                jest.spyOn(component.selectedValueIndexOutput, 'emit');

                // Check if the Location dropList has the default value of "BAY"
                expect(component.locations[0]).toStrictEqual({ code: 'BAY', description: 'Bay' });
                expect(component.currentLocation.value).toBe('BAY');

                // Simulate user to select the second option on the Location droplist "DISPLAY"
                await selectLocation();
                tick(200);

                // Check if the component is sending the index (value 1) of the second option to parent component
                expect(component.resetActualCount).toBeCalled();
                expect(component.selectedValueIndexOutput.emit).toHaveBeenCalledWith(1);

                // Simulate user clicking on Apply that would reload the child component, receive the index from the parent and call ngOnInit
                component.selectedValueIndex = 1;
                component.ngOnInit();
                tick(200);

                // Expect that the droplist default value is the one that was selected by the user
                expect(component.ngOnInit).toBeCalled();
                expect(component.currentLocation.value).toBe('DISPLAY');
                expect(component.locations[0]).toStrictEqual({ code: 'DISPLAY', description: 'Display' });
            }));
        });

        describe('filter product', () => {
            it('should call filterProducts when typing in the input', fakeAsync(async () => {
                jest.spyOn(component, 'filterProducts');
                initialize('edit', component.allCategories);
                component.toggleCountByLocation({ checked: true });
                // get the product filter input
                const input = await loader.getHarness(MatInputHarness.with({ selector: '#filter-product-input' }));
                await input.setValue('A');
                tick(300);
                expect(component.filterProducts).toBeCalledWith(false, 'A');
            }));

            it('should only display codes that have 5W20SYNMXB', fakeAsync(async () => {
                initialize('edit');
                component.toggleCountByLocation({ checked: true });

                component.filterProduct.setValue('5W20SYNMXB');
                tick(200);

                // select a category
                const category: Described[] = [{ id: 1, code: 'OIL' }];
                component.categoryControl.setValue(category);
                component.getProductByCategories();

                const table = await loader.getHarness(MatTableHarness);
                const row = (await table.getRows())[0];
                const cells = await row.getCells();
                const cellTexts = await parallel(() => cells.map((cell) => cell.getText()));
                expect(cellTexts).toContain('5W20SYNMXB');
            }));
        });

        describe('total quantity', () => {
            it('should be updated when the actual count is set', fakeAsync(async () => {
                jest.spyOn(component, 'resetActualCount');
                jest.spyOn(component, 'updateTotalQuantity');
                initialize('edit', component.allCategories);
                component.toggleCountByLocation({ checked: true });
                fixture.detectChanges();
                flush();

                const input = await loader.getHarness(MatInputHarness.with({ selector: '#count-input-0' }));
                await input.setValue('10');
                expect(component.products.data[0].getControlValue('actualCount')).toEqual(10);

                component.updateTotalQuantity(component.products.data[0]);

                const select = await loader.getHarness(MatSelectHarness);
                await select.open();
                const options = await select.getOptions();

                await options[1].click();

                fixture.detectChanges();
                flush();

                expect(component.resetActualCount).toHaveBeenCalled();
                expect(component.products.data[0].get('actualCount').value).toEqual(0); // to be 0
                expect(component.products.data[0].get('totalQuantity').value).toEqual(10); // to be 10
            }));

            it('should update a second time when the actual count is set a second time', fakeAsync(async () => {
                jest.spyOn(component, 'resetActualCount');
                jest.spyOn(component, 'updateTotalQuantity');
                initialize('edit', component.allCategories);
                component.toggleCountByLocation({ checked: true });
                fixture.detectChanges();
                flush();

                const input = await loader.getHarness(MatInputHarness.with({ selector: '#count-input-0' }));
                await input.setValue('10');
                expect(component.products.data[0].getControlValue('actualCount')).toEqual(10);

                component.updateTotalQuantity(component.products.data[0]);

                // reenter second quantity count value
                await input.setValue('20');
                expect(component.products.data[0].getControlValue('actualCount')).toEqual(20);

                component.updateTotalQuantity(component.products.data[0]);

                const select = await loader.getHarness(MatSelectHarness);
                await select.open();
                const options = await select.getOptions();

                await options[1].click();

                fixture.detectChanges();
                flush();

                expect(component.resetActualCount).toHaveBeenCalled();
                expect(component.products.data[0].get('actualCount').value).toEqual(0); // to be 0
                expect(component.products.data[0].get('totalQuantity').value).toEqual(20); // to be 20
            }));
        });

        describe.each`
            locationToggleChecked
            ${true}
            ${false}
        `('column', ({ locationToggleChecked }) => {
            beforeEach(fakeAsync(() => {
                jest.spyOn(component.switchedToChangeByLocation, 'emit');
                initialize('edit', component.allCategories);
                if (locationToggleChecked) {
                    component.toggleCountByLocation({ checked: true });
                }
                tick(100); // clear timers in queue
            }));

            it(`should ${locationToggleChecked ? '' : 'not '}display total quantity column`, fakeAsync(() => {
                if (locationToggleChecked) {
                    expect(component.displayedColumns).toContain('totalQuantity');
                } else {
                    expect(component.displayedColumns).not.toContain('totalQuantity');
                }
            }));

            it(`should ${
                locationToggleChecked ? '' : 'not '
            }emit an event that is has switched to count by location mode`, fakeAsync(() => {
                if (locationToggleChecked) {
                    expect(component.switchedToChangeByLocation.emit).toHaveBeenCalledWith(true);
                } else {
                    expect(component.switchedToChangeByLocation.emit).not.toHaveBeenCalled();
                }
            }));

            it(`should ${locationToggleChecked ? '' : 'not '}display select checkboxes`, fakeAsync(() => {
                if (locationToggleChecked) {
                    expect(component.displayedColumns).not.toContain('select');
                } else {
                    expect(component.displayedColumns).toContain('select');
                }
            }));
        });
    });
});
