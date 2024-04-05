import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import {
    PhysicalInventory,
    PhysicalInventoryCount,
    PhysicalInventoryFacade,
} from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FEATURE_CONFIGURATION_TOKEN, FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import { getApplyActionButton } from '@vioc-angular/test/util-test';
import { EMPTY, ReplaySubject, Subject, of } from 'rxjs';
import { PhysicalInventoryForms } from '../physical-inventory-module-forms';
import { PhysicalInventoryComponent } from './physical-inventory.component';

describe('PhysicalInventoryComponent', () => {
    let component: PhysicalInventoryComponent;
    let fixture: ComponentFixture<PhysicalInventoryComponent>;
    let formBuilder: FormBuilder;
    let formFactory: FormFactory;
    let loader: HarnessLoader;
    let componentDestroyed: ReplaySubject<any>;
    let physicalInventoryFacade: PhysicalInventoryFacade;
    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();

    const testPhysicalInventory: PhysicalInventory = {
        id: 1,
        store: {
            id: 10,
            code: 'STORE',
        },
        frequency: {
            id: 100,
            code: 'FREQ',
            description: 'Freq',
        },
        status: {
            id: 1000,
            code: 'OPEN',
            description: 'Open',
        },
        createdOn: '2021-09-26T00:00:00',
        finalizedOn: '2021-09-26T00:00:00',
        updatedByEmployee: null,
        updatedBy: 'test-user',
        updatedOn: '2021-09-27T00:00:00',
        version: 1,
    };

    @Component({
        selector: 'vioc-angular-physical-inventory-products',
        template: '',
    })
    class MockPhysicalInventoryProductComponent {
        readonly allCategories: Described = { ...new Described(), code: 'ALL' };
        @Input() form: TypedFormGroup<PhysicalInventory>;
        @Input() model: PhysicalInventory;
        @Input() accessMode: AccessMode;
        @Input() initiateCategorySearch: Described;
        @Input() isCountingByLocation: boolean;
        @Input() selectedValueIndex: number;
        currentCategory: Described;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatTooltipModule,
                UiActionBarModule,
                UiAuditModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiButtonModule,
                UiFilteredInputMockModule,
                CommonFunctionalityModule,
                UiDialogMockModule,
                MatIconModule,
                FeatureFeatureFlagModule,
            ],
            declarations: [PhysicalInventoryComponent, MockPhysicalInventoryProductComponent],
            providers: [
                FormFactory,
                {
                    provide: ActivatedRoute,
                    useValue: { params: routeParams, parent: parentRoute },
                },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            physicalInventory: {
                                view: {
                                    print: false,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
                {
                    provide: AuthenticationFacade,
                    useValue: { getUser: () => EMPTY } as any as AuthenticationFacade,
                },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { back: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PhysicalInventoryComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        formBuilder = TestBed.inject(FormBuilder);
        loader = TestbedHarnessEnvironment.loader(fixture);
        PhysicalInventoryForms.registerForms(formFactory, formBuilder);

        physicalInventoryFacade = component['physicalInventoryFacade'];
        physicalInventoryFacade.updateCount = jest.fn();
        componentDestroyed = new ReplaySubject(1);

        component.physicalInventoryFacade.findById = jest.fn();
    });

    /** Initialize the the component with the given access mode, type and code. */
    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: PhysicalInventory = testPhysicalInventory,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                storeCode: model?.store.code,
                productCountNumber: model?.id,
            }),
        } as ActivatedRouteSnapshot;

        const physicalInventory = { ...new PhysicalInventory(), ...model };
        if (accessMode !== AccessMode.ADD.urlSegement) {
            jest.spyOn(component.physicalInventoryFacade, 'findById').mockReturnValue(of(physicalInventory));
        }

        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onInit', () => {
        it('should display a loading overlay until the form is loaded', fakeAsync(() => {
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

        it.each`
            accessMode
            ${'add'}
            ${'add-like'}
        `('should throw and error with an unsupported accessMode: $accessMode', ({ accessMode }) => {
            const route = TestBed.inject(ActivatedRoute);
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode: accessMode,
                    storeCode: 'STORE',
                    productCountNumber: 1,
                }),
            } as ActivatedRouteSnapshot;

            expect(() => fixture.detectChanges()).toThrowError(`Unhandled Access Mode: ${accessMode}`);
        });

        describe.each`
            accessMode
            ${'edit'}
            ${'view'}
        `('with $accessMode access', ({ accessMode }) => {
            const initEntry = (access: 'edit' | 'view', statusCode: string) => {
                const status = { ...testPhysicalInventory.status, code: statusCode };
                initialize(access, { ...testPhysicalInventory, status });
            };

            it('should initialize the form', fakeAsync(() => {
                initEntry(accessMode, 'OPEN');
                expect(component.form).toBeTruthy();
                expect(component.form.getRawValue()).toEqual({ ...testPhysicalInventory, counts: null });
            }));

            it('should not initialize the form if one exists', fakeAsync(() => {
                jest.spyOn(formFactory, 'group');
                component.form = new TypedFormGroup<PhysicalInventory>(
                    formBuilder.group(testPhysicalInventory, { accessMode }),
                    componentDestroyed
                );
                initEntry(accessMode, 'OPEN');
                expect(formFactory.group).not.toHaveBeenCalled();
            }));
        });
    });

    describe('existing product count page', () => {
        describe.each`
            accessMode
            ${'edit'}
            ${'view'}
        `('with $accessMode accessMode', ({ accessMode }) => {
            it.each`
                field
                ${'store'}
                ${'frequency'}
                ${'count-number'}
                ${'status'}
                ${'created-date'}
            `(
                'should disable the $field field',
                fakeAsync(({ field }) => {
                    initialize(accessMode);
                    expect(fixture.debugElement.query(By.css(`#${field}-input`)).nativeElement.disabled).toEqual(true);
                })
            );

            describe.each`
                statusCode
                ${'OPEN'}
                ${'CLOSED'}
                ${'FINALIZED'}
            `('with $statusCode status', ({ statusCode }) => {
                it(`should ${status === 'FINALIZED' ? '' : 'not '}display the finalized date field`, fakeAsync(() => {
                    const status = { ...testPhysicalInventory.status, code: statusCode };
                    initialize(accessMode, { ...testPhysicalInventory, status });
                    if (statusCode === 'FINALIZED') {
                        expect(fixture.debugElement.query(By.css('#finalized-date-input'))).toBeTruthy();
                    } else {
                        expect(fixture.debugElement.query(By.css('#finalized-date-input'))).toBeFalsy();
                    }
                }));
            });

            it('should display the products table', fakeAsync(() => {
                initialize(accessMode);
                expect(fixture.debugElement.query(By.css('#product-table'))).toBeTruthy();
            }));
        });
    });

    describe('with stop count button appearing', () => {
        it('should not appear if status is not open', fakeAsync(() => {
            const status = { ...testPhysicalInventory.status, code: 'FINALIZED' };
            initialize('edit', { ...testPhysicalInventory, status });
            expect(fixture.debugElement.query(By.css('#stop-action'))).toBeFalsy();
        }));
    });

    describe('with stop count button', () => {
        beforeEach(fakeAsync(() => {
            jest.spyOn(component.stopDialog, 'open');
            jest.spyOn(component.stopDialog, 'close');
            jest.spyOn(component, 'stopCount');
            jest.spyOn(component.messageFacade, 'addMessage');
            jest.spyOn(component.stopFacade, 'apply');
            jest.spyOn(component.physicalInventoryFacade, 'stopCount').mockReturnValue(of({}));
            initialize('edit');
            // open dialog
            fixture.debugElement.query(By.css('#stop-action')).nativeElement.click();
            fixture.detectChanges();
        }));

        function clickContinue() {
            fixture.debugElement.query(By.css('#stop-continue-button')).nativeElement.click();
            tick(600);
            fixture.detectChanges();
            tick(600);
        }

        it('should prompt user to confirm to stop count', () => {
            // validate that dialog was opened
            expect(component.stopDialog.open).toHaveBeenCalled();
        });

        it('should close prompt after cancelling stop count', () => {
            // validate that button had appeared
            expect(component.stopDialog.open).toHaveBeenCalled();
            const cancelButton = fixture.debugElement.query(By.css('#stop-cancel-button'));
            expect(cancelButton).toBeTruthy();
            // click on cancel button
            cancelButton.nativeElement.click();
            fixture.detectChanges();

            // validate that dialog was closed
            expect(component.stopDialog.close).toHaveBeenCalled();
        });

        it('should call the physicalInventoryFacade to stop the count after confirming', fakeAsync(() => {
            const oldForm = component.form;
            // open dialog
            clickContinue();

            // validate that order calls facade to finalize
            expect(component.stopCount).toHaveBeenCalled();

            expect(component.stopFacade.apply).toHaveBeenCalledWith(
                oldForm,
                component.model,
                expect.anything() //routing testing in another test
            );
            expect(component.physicalInventoryFacade.stopCount).toHaveBeenCalledWith(
                testPhysicalInventory.id,
                testPhysicalInventory.store.code
            );
            // validate that success message displays
            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                message: `Product Count ${testPhysicalInventory.id} was stopped successfully`,
                severity: 'info',
            });
        }));

        it('should call apply only once, even when multiple clicks', fakeAsync(() => {
            const continueButton = fixture.debugElement.query(By.css('#stop-continue-button')).nativeElement;
            // click continue on dialog window multiple times
            continueButton.click();
            continueButton.click();
            continueButton.click();
            tick(600); // tick to account for debounce time and timeout to re-enable button

            // validate that was called once
            expect(component.stopFacade.apply).toHaveBeenCalledTimes(1);
        }));

        it('should reload the component and initialize the products with all categories', fakeAsync(() => {
            jest.spyOn(component, 'ngOnInit');

            // continue past dialog
            clickContinue();

            const productsComponent: MockPhysicalInventoryProductComponent = fixture.debugElement.query(
                By.directive(MockPhysicalInventoryProductComponent)
            ).componentInstance;
            flush();
            expect(productsComponent.initiateCategorySearch).toEqual(productsComponent.allCategories);
            expect(component.ngOnInit).toHaveBeenCalled();
        }));

        it('ngOnInit runs when route params change', fakeAsync(() => {
            jest.spyOn(component, 'ngOnInit');
            component.accessMode = AccessMode.VIEW;
            routeParams.next();
            flush();
            expect(component.ngOnInit).toHaveBeenCalled();
        }));

        it('ngOnInit dont runs when accessMode dont change', fakeAsync(() => {
            jest.spyOn(component, 'ngOnInit');
            component.accessMode = undefined;
            routeParams.next();
            flush();
            expect(component.ngOnInit).not.toHaveBeenCalled();
        }));
    });

    describe('unsavedChanges', () => {
        const testPhysicalInventoryCounts: PhysicalInventoryCount[] = [
            {
                ...new PhysicalInventoryCount(),
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
                // makes the form invalid with -1 count
                actualCount: -1,
                product: {
                    code: '5W20SYNMXB',
                    id: 29219,
                },
                closedOn: null,
            },
        ];

        beforeEach(fakeAsync(() => {
            initialize('edit');
        }));

        it('should check the dirty state of the control', () => {
            expect(component.unsavedChanges).toBeFalsy();
            component.form.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        });

        describe.each`
            counts
            ${testPhysicalInventoryCounts}
            ${[]}
        `('unsavedChangesMessage', ({ counts }) => {
            it(`should ${counts ? '' : 'not '}return a message when counts=${JSON.stringify(counts)}`, () => {
                component.form.setControl(
                    'counts',
                    formFactory.array('PhysicalInventoryCount', counts, componentDestroyed, {
                        accessMode: AccessMode.EDIT,
                    })
                );
                // trigger an update to make invalid
                component.form.getArray('counts').updateValueAndValidity();
                if (counts.length > 0) {
                    expect(component.unsavedChangesMessage()).toEqual(
                        'Products 5W20SYNMXB are unsaved, if you leave your changes will be lost.'
                    );
                } else {
                    expect(component.unsavedChangesMessage()).toBeNull();
                }
            });
        });
    });

    describe('print button', () => {
        it('should display loading overlay when clicked', fakeAsync(() => {
            initialize('view');
            const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                By.directive(MockLoadingOverlayComponent)
            ).componentInstance;

            component.isLoading = false;
            fixture.detectChanges();
            expect(loadingOverlay.loading).toEqual(false);

            //click on button
            fixture.debugElement.query(By.css('#pdf-print-button')).nativeElement.click();
            fixture.detectChanges();

            // Loading overlay should be enabled
            expect(loadingOverlay.loading).toEqual(true);
        }));

        // TODO: remove the below test and re-enable the test on line 467 once print functionality is restored
        it.skip('should open a PDF in a new window', fakeAsync(() => {
            const url = 'https://central.dev.vioc.valvoline.com/';
            const fileBlob = new Blob(['PDF test text'], { type: 'application/pdf' });
            jest.spyOn(component.physicalInventoryFacade, 'getPDF').mockReturnValue(of(fileBlob));
            const createObjectUrlSpy = (global.URL.createObjectURL = jest.fn(() => url));
            const windowOpenSpy = (window.open = jest.fn());
            initialize('edit');

            //click on button
            fixture.debugElement.query(By.css('#pdf-print-button')).nativeElement.click();
            fixture.detectChanges();

            expect(createObjectUrlSpy).toHaveBeenCalledWith(fileBlob);
            //verify that the url is the same
            expect(windowOpenSpy).toHaveBeenCalledWith(url);
        }));
    });

    describe('apply button', () => {
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
                actualCount: 1,
                product: {
                    code: '5W20SYNMXB',
                    id: 29219,
                },
                closedOn: null,
                volumeCalculatorEnabled: false,
            },
            {
                id: {
                    physicalInventoryId: 386656,
                    line: 1,
                },
                category: { id: 1, code: 'OIL' },
                status: {
                    code: 'CLOSED',
                    id: 1108,
                },
                uom: {
                    code: 'QUART',
                    id: 2478,
                },
                actualCount: 2,
                product: {
                    code: '5W30SYNMXB',
                    id: 29220,
                },
                closedOn: null,
                volumeCalculatorEnabled: false,
            },
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
                actualCount: 1,
                product: {
                    code: '5W20SYNMXM',
                    id: 29221,
                },
                closedOn: null,
                volumeCalculatorEnabled: true,
            },
        ];

        function clickApply() {
            getApplyActionButton(fixture).nativeElement.click();
            fixture.detectChanges();
        }

        it('should save and reload the component', fakeAsync(() => {
            jest.spyOn(component.saveFacade, 'apply');
            jest.spyOn(physicalInventoryFacade, 'updateCount').mockReturnValue(of({}));
            jest.spyOn(component, 'ngOnInit');
            jest.spyOn(component.messageFacade, 'addMessage');

            const selectedCategory = [{ code: 'CAT' }];
            const updatedPhysicalInventory = {
                ...testPhysicalInventory,
                counts: [{ ...testPhysicalInventoryCounts[0], countsByLocation: undefined }],
            };

            initialize('edit', updatedPhysicalInventory);
            const currentForm = component.form;
            component.form.getControl('counts').enable();
            component.form.setControl(
                'counts',
                formFactory.array('PhysicalInventoryCount', testPhysicalInventoryCounts, componentDestroyed, {
                    accessMode: AccessMode.EDIT,
                })
            );
            component.productCounts.currentCategories = selectedCategory;
            component.form.getArray('counts').controls[0].markAsDirty();
            fixture.detectChanges();

            clickApply();
            tick(600); // tick to account for debounce time and timeout to re-enable button

            expect(component.saveFacade.apply).toHaveBeenCalledWith(
                currentForm,
                updatedPhysicalInventory,
                expect.anything()
            );
            expect(physicalInventoryFacade.updateCount).toHaveBeenCalledWith(updatedPhysicalInventory);
            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                message: `Product Count ${updatedPhysicalInventory.id} saved successfully`,
                severity: 'info',
            });
            expect(component.productCounts.currentCategories).not.toBeUndefined();
            expect(component.ngOnInit).toHaveBeenCalled();
        }));

        it('should call apply only once, even when multiple clicks', fakeAsync(() => {
            jest.spyOn(component.saveFacade, 'apply');
            jest.spyOn(physicalInventoryFacade, 'updateCount').mockReturnValue(of({}));

            const updatedPhysicalInventory = {
                ...testPhysicalInventory,
                counts: [{ ...testPhysicalInventoryCounts[0], countsByLocation: undefined }],
            };
            initialize('edit', updatedPhysicalInventory);
            component.form.getControl('counts').enable();
            component.form.setControl(
                'counts',
                formFactory.array('PhysicalInventoryCount', testPhysicalInventoryCounts, componentDestroyed, {
                    accessMode: AccessMode.EDIT,
                })
            );
            const selectedCategory = [{ code: 'CAT' }];
            component.productCounts.currentCategories = selectedCategory;
            component.form.getArray('counts').controls[0].markAsDirty();
            fixture.detectChanges();

            // click apply multiple times
            getApplyActionButton(fixture).nativeElement.click();
            getApplyActionButton(fixture).nativeElement.click();
            getApplyActionButton(fixture).nativeElement.click();
            tick(600); // tick to account for debounce time and timeout to re-enable button

            // validate that was called once
            expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
        }));

        it('should calculate volume on apply', fakeAsync(() => {
            jest.spyOn(component.saveFacade, 'apply');
            jest.spyOn(physicalInventoryFacade, 'updateCount').mockReturnValue(of({}));
            jest.spyOn(component, 'ngOnInit');
            jest.spyOn(component.messageFacade, 'addMessage');
            jest.spyOn(component, 'calculateVolumeOnApply');
            jest.spyOn(physicalInventoryFacade, 'calculateVolume').mockReturnValue(of(1));

            const selectedCategory = [{ code: 'CAT' }];
            const index = 2;
            const updatedTestPhysicalInventoryCounts = {
                ...testPhysicalInventory,
                counts: [{ ...testPhysicalInventoryCounts[index], countsByLocation: undefined }],
            };

            initialize('edit', updatedTestPhysicalInventoryCounts);
            const currentForm = component.form;
            component.form.getControl('counts').enable();
            component.form.setControl(
                'counts',
                formFactory.array('PhysicalInventoryCount', testPhysicalInventoryCounts, componentDestroyed, {
                    accessMode: AccessMode.EDIT,
                })
            );
            component.productCounts.currentCategories = selectedCategory;
            component.form.getArray('counts').controls[2].markAsDirty();
            fixture.detectChanges();

            clickApply();
            tick(600); // tick to account for debounce time and timeout to re-enable button

            expect(component.saveFacade.apply).toHaveBeenCalledWith(
                currentForm,
                updatedTestPhysicalInventoryCounts,
                expect.anything()
            );
            expect(physicalInventoryFacade.updateCount).toHaveBeenCalledWith(updatedTestPhysicalInventoryCounts);
            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                message: `Product Count ${updatedTestPhysicalInventoryCounts.id} saved successfully`,
                severity: 'info',
            });
            expect(component.ngOnInit).toHaveBeenCalled();
        }));

        it('should save and reload the component in count by location mode', fakeAsync(() => {
            jest.spyOn(component.saveByLocationFacade, 'apply');
            jest.spyOn(physicalInventoryFacade, 'updateCountByLocation').mockReturnValue(of({}));
            jest.spyOn(component, 'ngOnInit');
            jest.spyOn(component.messageFacade, 'addMessage');

            const selectedCategory = [{ code: 'CAT' }];
            const updatedCount = [
                {
                    ...testPhysicalInventoryCounts[0],
                    countsByLocation: [{ count: 1, location: 'BAY' }],
                    totalQuantity: 1,
                },
            ];
            const updatedPhysicalInventory = {
                ...testPhysicalInventory,
                counts: updatedCount,
            };

            initialize('edit', updatedPhysicalInventory);
            const currentForm = component.form;
            component.isCountingByLocation = true;
            component.form.setControl(
                'counts',
                formFactory.array('PhysicalInventoryCount', updatedCount, componentDestroyed, {
                    accessMode: AccessMode.EDIT,
                    isCountingByLocation: true,
                })
            );
            component.productCounts.currentCategories = selectedCategory;
            component.form.getArray('counts').controls[0].markAsDirty();
            fixture.detectChanges();

            clickApply();
            tick(600); // tick to account for debounce time and timeout to re-enable button

            expect(component.saveByLocationFacade.apply).toHaveBeenCalledWith(
                currentForm,
                updatedPhysicalInventory,
                expect.anything()
            );
            expect(physicalInventoryFacade.updateCountByLocation).toHaveBeenCalledWith(
                updatedPhysicalInventory.id,
                updatedPhysicalInventory.counts[0]
            );
            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                message: `Product Count ${updatedPhysicalInventory.id} saved successfully`,
                severity: 'info',
            });
            expect(component.ngOnInit).toHaveBeenCalled();
        }));

        describe.each`
            formDirty | actualCount | isDisabled
            ${true}   | ${10}       | ${false}
            ${true}   | ${10.1}     | ${true}
            ${false}  | ${10}       | ${true}
            ${false}  | ${null}     | ${true}
            ${false}  | ${10.1}     | ${true}
        `('with form validation', ({ formDirty, actualCount, isDisabled }) => {
            it(`should ${isDisabled ? '' : 'not'}be disabled when the form is ${
                formDirty ? 'dirty' : 'not dirty'
            } and has an actualCount of ${actualCount}`, fakeAsync(async () => {
                initialize('edit');
                component.form.setControl(
                    'counts',
                    formFactory.array(
                        'PhysicalInventoryCount',
                        [{ ...testPhysicalInventoryCounts[0], uom: { code: 'EACH' }, actualCount }],
                        componentDestroyed,
                        {
                            accessMode: AccessMode.EDIT,
                        }
                    )
                );
                if (formDirty) {
                    component.form.getArray('counts').controls[0].markAsDirty();
                }
                component.form.getArray('counts').controls[0].updateValueAndValidity();
                fixture.detectChanges();
                const button = loader.getHarness(MatButtonHarness.with({ selector: '#apply-action' }));
                if (isDisabled) {
                    expect(await (await button).isDisabled()).toEqual(true);
                } else {
                    expect(await (await button).isDisabled()).toEqual(false);
                }
            }));
        });

        describe.each`
            accessMode | status         | isDisplayed
            ${'edit'}  | ${'OPEN'}      | ${true}
            ${'edit'}  | ${'CLOSED'}    | ${false}
            ${'edit'}  | ${'FINALIZED'} | ${false}
            ${'view'}  | ${'OPEN'}      | ${false}
            ${'view'}  | ${'CLOSED'}    | ${false}
            ${'view'}  | ${'FINALIZED'} | ${false}
        `(
            'with product counts in $accessMode accessMode with status $status',
            ({ accessMode, status, isDisplayed }) => {
                it(`should ${isDisplayed ? '' : 'not '}be displayed`, fakeAsync(() => {
                    initialize(accessMode, { ...testPhysicalInventory, status: { code: status } });
                    if (isDisplayed) {
                        expect(getApplyActionButton(fixture)).toBeTruthy();
                    } else {
                        expect(getApplyActionButton(fixture)).toBeFalsy();
                    }
                }));
            }
        );
    });

    describe('Print pdf', () => {
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
                actualCount: 1,
                product: {
                    code: '5W20SYNMXB',
                    id: 29219,
                },
                closedOn: null,
                volumeCalculatorEnabled: false,
            },
            {
                id: {
                    physicalInventoryId: 386656,
                    line: 1,
                },
                category: { id: 1, code: 'OIL' },
                status: {
                    code: 'CLOSED',
                    id: 1108,
                },
                uom: {
                    code: 'QUART',
                    id: 2478,
                },
                actualCount: 2,
                product: {
                    code: '5W30SYNMXB',
                    id: 29220,
                },
                closedOn: null,
                volumeCalculatorEnabled: false,
            },
        ];
        it('should call getPDF', fakeAsync(() => {
            const url = 'https://central.dev.vioc.valvoline.com/';
            const updatedPhysicalInventory = { ...testPhysicalInventory, counts: [testPhysicalInventoryCounts[0]] };
            initialize('edit', updatedPhysicalInventory);

            const fileBlob = new Blob(['PDF test text'], { type: 'application/pdf' });
            const spy = jest.spyOn(component.physicalInventoryFacade, 'getPDF').mockReturnValue(of(fileBlob));
            const windowOpenSpy = (window.open = jest.fn());
            const createObjectUrlSpy = (global.URL.createObjectURL = jest.fn(() => url));

            component.productCounts.categoryCode = ['All'];
            component.getPDF();
            flush();
            expect(spy).toHaveBeenCalled();
            expect(createObjectUrlSpy).toHaveBeenCalledWith(fileBlob);
            //verify that the url is the same
            expect(windowOpenSpy).toHaveBeenCalledWith(url);

            component.productCounts.categoryCode = ['OIL'];
            component.getPDF();
            flush();
            expect(spy).toHaveBeenCalled();
            expect(createObjectUrlSpy).toHaveBeenCalledWith(fileBlob);
            //verify that the url is the same
            expect(windowOpenSpy).toHaveBeenCalledWith(url);
        }));
    });
});
