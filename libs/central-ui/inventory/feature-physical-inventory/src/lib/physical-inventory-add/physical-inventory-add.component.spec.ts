import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { ReceiptOfMaterial } from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { MockSelectAndGoComponent, UiSelectAndGoMockModule } from '@vioc-angular/shared/ui-select-and-go';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { of, Subject } from 'rxjs';
import { PhysicalInventoryAddComponent } from './physical-inventory-add.component';

describe('PhysicalInventoryAddComponent', () => {
    let component: PhysicalInventoryAddComponent;
    let fixture: ComponentFixture<PhysicalInventoryAddComponent>;
    let router: Router;
    let loader: HarnessLoader;
    const routeParams = new Subject();
    const productCountNumber = 10000;
    const resource = {
        resources: [
            { id: 10, code: 'STORE' },
            { id: 11, code: 'STORE2' },
        ],
        allCompanies: false,
    };
    const frequency = { id: 100, code: 'FREQ', desciption: 'Freq' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                UiActionBarModule,
                UiFilteredInputMockModule,
                UiLoadingMockModule,
                UiSelectAndGoMockModule,
                UiDialogMockModule,
                CommonFunctionalityModule,
            ],
            declarations: [PhysicalInventoryAddComponent],
            providers: [
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { back: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: HttpClient, useValue: {} },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                {
                    provide: ActivatedRoute,
                    useValue: { params: routeParams, parent: '/inventory/product-count' },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PhysicalInventoryAddComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);

        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        loader = TestbedHarnessEnvironment.loader(fixture);

        component.physicalInventoryFacade.createCount = jest.fn(() => of(productCountNumber));
        component.resourceFacade.findStoresByRoles = jest.fn(() => of(resource));
        component.commonCodeFacade.findByType = jest.fn(() => of([frequency]));
        component.receiptOfMaterialFacade.findOpenProductCountReceipts = jest.fn(() => of([]));
    });

    const initialize = (accessMode = 'add', andflush = true) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
            }),
        } as ActivatedRouteSnapshot;
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should clear dialogs on component destruction', () => {
        expect(component.openReceiptsDialog).toBeTruthy();
        expect(component.existingProductCountDialog).toBeTruthy();

        component.ngOnDestroy();

        expect(component.openReceiptsDialog).toBeFalsy();
        expect(component.existingProductCountDialog).toBeFalsy();
    });

    describe('init', () => {
        it.each`
            accessMode
            ${'edit'}
            ${'view'}
            ${'add-like'}
        `(
            'should throw an error when initialized with accessMode $accessMode',
            fakeAsync(({ accessMode }) => {
                expect(() => initialize(accessMode)).toThrowError(`Unhandled Access Mode: ${accessMode}`);
            })
        );

        describe('with add access', () => {
            beforeEach(fakeAsync(() => {
                initialize();
            }));

            it('should load a list of stores', async () => {
                expect(component.resourceFacade.findStoresByRoles).toHaveBeenCalledWith(
                    component.accessRoles,
                    'ACTIVE',
                    true
                );
                expect(await component.stores$.toPromise()).toEqual(resource);
            });

            it('should load a list of frequencies', async () => {
                expect(component.commonCodeFacade.findByType).toHaveBeenCalledWith('COUNTFREQ', true);
                expect(await component.frequencies$.toPromise()).toEqual([frequency]);
            });

            it('should initialize the store control', () => {
                expect(component.store).toBeTruthy();
                expect(component.store.getError('required')).toEqual(true);
                expect(component.store.value).toEqual(null);
            });

            it('should initialize the frequency control', () => {
                expect(component.frequency).toBeTruthy();
                expect(component.frequency.getError('required')).toEqual(true);
                expect(component.frequency.value).toEqual(null);
            });
        });
    });

    describe('store selection', () => {
        let storeInput;

        describe('store access', () => {
            beforeEach(fakeAsync(() => {
                initialize();
                storeInput = fixture.debugElement.query(By.css('#store-input'))
                    .componentInstance as MockFilteredInputComponent;
            }));

            it('should display a store selection field', () => {
                expect(storeInput).toBeTruthy();
            });

            it('should pass values to the store selection field', () => {
                expect(storeInput.placeHolder).toEqual('Store');
                expect(storeInput.editable).toEqual(true);
                expect(storeInput.options).toEqual(resource.resources);
                expect(storeInput.valueControl.value).toBeNull();
                expect(storeInput.displayFn).toEqual(Described.codeAndDescriptionMapper);
            });

            it('should update the store form value', () => {
                const storeValue = { code: 'STOREINPUT' };
                storeInput.valueControl.setValue(storeValue);
                expect(component.store.value).toEqual(storeValue);
            });
        });

        describe('single store access', () => {
            it('should auto populate the store form if only one store is available', fakeAsync(() => {
                const storeValue = { code: 'STOREINPUT' };
                jest.spyOn(component.resourceFacade, 'findStoresByRoles').mockReturnValueOnce(
                    of({ resources: [storeValue], allCompanies: false })
                );
                initialize();
                expect(component.store.value).toEqual(storeValue);
            }));
        });
    });

    describe('frequency selection', () => {
        let frequencyInput;

        beforeEach(fakeAsync(() => {
            initialize();
            frequencyInput = fixture.debugElement.query(By.css('#frequency-input'))
                .componentInstance as MockFilteredInputComponent;
        }));

        it('should display a frequency selection field', () => {
            expect(frequencyInput).toBeTruthy();
        });

        it('should be disabled if no store is selected', () => {
            const storeValue = { code: 'STOREINPUT' };
            expect(frequencyInput.placeHolder).toEqual('Frequency');

            expect(frequencyInput.editable).toBeFalsy();
            component.store.setValue(storeValue);
            fixture.detectChanges();
            expect(frequencyInput.editable).toBeTruthy();

            expect(frequencyInput.options).toEqual([frequency]);
        });

        it('should update the frequency form value', () => {
            const frequencyValue = { code: 'FREQINPUT' };
            frequencyInput.valueControl.setValue(frequencyValue);
            expect(component.frequency.value).toEqual(frequencyValue);
        });
    });
    describe('with cancel button clicked', () => {
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize();
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('go button', () => {
        const storeCode = 'TEST_STORE';
        const frequencyCode = 'TEST_FREQ';
        let goButton: MockSelectAndGoComponent;

        beforeEach(fakeAsync(() => {
            initialize();
            goButton = fixture.debugElement.query(By.css('#go-button')).componentInstance;
        }));

        it('should be displayed', () => {
            expect(goButton.goButtonDisplayed).toEqual(true);
        });

        it('should be disabled until the store and frequency are selected', () => {
            expect(goButton.goButtonDisabled).toEqual(true);

            component.store.setValue({ code: 'TEST_STORE' });
            component.frequency.setValue({ code: 'TEST_FREQ' });
            fixture.detectChanges();

            expect(goButton.goButtonDisabled).toEqual(false);
        });

        describe('clicked', () => {
            beforeEach(() => {
                component.store.setValue({ code: 'STORE' });
                component.frequency.setValue({ code: 'FREQ' });
                fixture.detectChanges();
                jest.spyOn(component, 'createCount');
                jest.spyOn(component, 'checkOpenRMsAndCreateCount');
                jest.spyOn(component.messageFacade, 'addMessage');
                jest.spyOn(router, 'navigate').mockImplementation();
                component.store.setValue({ code: 'TEST_STORE' });
                component.frequency.setValue({ code: 'TEST_FREQ' });
                fixture.detectChanges();
            });

            const click = async (selector: string) => {
                return (
                    await loader.getHarness(
                        MatButtonHarness.with({
                            selector,
                        })
                    )
                ).click();
            };

            it('should check for open RMs on click', () => {
                const openReceiptsSpy = jest
                    .spyOn(component.receiptOfMaterialFacade, 'findOpenProductCountReceipts')
                    .mockReturnValue(of([]));
                goButton.go.emit();

                expect(component.checkOpenRMsAndCreateCount).toHaveBeenCalled();
                expect(openReceiptsSpy).toHaveBeenCalledWith('TEST_STORE');
            });

            describe('with no existing RMs', () => {
                beforeEach(() => {
                    jest.spyOn(component.receiptOfMaterialFacade, 'findOpenProductCountReceipts').mockReturnValue(
                        of([])
                    );
                });

                it('should not open the open receipts dialog', () => {
                    const openDialogSpy = jest.spyOn(component.openReceiptsDialog, 'open');
                    goButton.go.emit();

                    expect(openDialogSpy).not.toHaveBeenCalled();
                });

                it('should trigger the creation of a product count on click', () => {
                    goButton.go.emit();
                    expect(component.createCount).toHaveBeenCalled();
                    expect(component.physicalInventoryFacade.createCount).toHaveBeenCalledWith(
                        storeCode,
                        frequencyCode
                    );
                });

                it('should display a message to the user', () => {
                    goButton.go.emit();
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Product Count ${productCountNumber} has been created.`,
                        severity: 'success',
                    });
                });

                it('should redirect the user to the edit page', () => {
                    goButton.go.emit();
                    expect(router.navigate).toHaveBeenCalledWith(['edit', 'TEST_STORE', productCountNumber], {
                        relativeTo: '/inventory/product-count',
                    });
                });
            });

            describe('with open receipts of material', () => {
                const rm1: ReceiptOfMaterial = {
                    number: 'rm1',
                    store: { code: 'TEST_STORE' },
                    vendor: { code: 'TEST_VENDOR' },
                    receiptDate: '2021-01-27',
                };
                const rm2: ReceiptOfMaterial = {
                    ...rm1,
                    number: 'rm2',
                    store: { code: 'TEST_STORE' },
                    vendor: { code: 'TEST_VENDOR' },
                    receiptDate: '2021-01-29',
                };

                beforeEach(() => {
                    jest.spyOn(component.receiptOfMaterialFacade, 'findOpenProductCountReceipts').mockReturnValue(
                        of([rm1, rm2])
                    );
                });

                it('should open the receipt dialog to show the user open receipts', () => {
                    const openDialogSpy = jest.spyOn(component.openReceiptsDialog, 'open');
                    goButton.go.emit();

                    expect(openDialogSpy).toHaveBeenCalled();
                });

                it('should display the loading overlay while finding open product count receipts', fakeAsync(() => {
                    const openRMsSubject = new Subject<ReceiptOfMaterial[]>();

                    jest.spyOn(component.receiptOfMaterialFacade, 'findOpenProductCountReceipts').mockReturnValue(
                        openRMsSubject
                    );

                    goButton.go.emit();
                    fixture.detectChanges();

                    const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                        By.directive(MockLoadingOverlayComponent)
                    ).componentInstance;

                    expect(loadingOverlay.loading).toBeTruthy();

                    openRMsSubject.next([rm1, rm2]);
                    flush();
                    fixture.detectChanges();
                    expect(loadingOverlay.loading).toBeFalsy();
                }));

                it('should go back without creating a count if the go back button is clicked', async () => {
                    const closeSpy = jest.spyOn(component.openReceiptsDialog, 'close');
                    goButton.go.emit();

                    await click('#open-receipts-cancel-button');
                    expect(closeSpy).toHaveBeenCalled();
                    expect(component.createCount).not.toHaveBeenCalled();
                });

                it('should have normal create count behavior if the continue button is clicked', async () => {
                    const closeSpy = jest.spyOn(component.openReceiptsDialog, 'close');
                    goButton.go.emit();

                    await click('#open-receipts-continue-button');
                    expect(closeSpy).toHaveBeenCalled();
                    expect(component.createCount).toHaveBeenCalled();
                    expect(component.physicalInventoryFacade.createCount).toHaveBeenCalledWith(
                        storeCode,
                        frequencyCode
                    );
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Product Count ${productCountNumber} has been created.`,
                        severity: 'success',
                    });
                    expect(router.navigate).toHaveBeenCalledWith(['edit', 'TEST_STORE', productCountNumber], {
                        relativeTo: '/inventory/product-count',
                    });
                });

                it('should display links to navigate to the open receipts', async () => {
                    const closeSpy = jest.spyOn(component.openReceiptsDialog, 'close');
                    const navigateSpy = jest.spyOn(router, 'navigate');
                    goButton.go.emit();

                    await click('#open-receipt-0');
                    expect(closeSpy).toHaveBeenCalled();
                    expect(navigateSpy).toHaveBeenCalledWith([
                        '/inventory/receipt-of-material',
                        'edit',
                        rm1.store.code,
                        rm1.number,
                    ]);
                });
                it('should stop loading overlay if an error occurs', fakeAsync(() => {
                    const openRMsSubject = new Subject<[]>();
                    jest.spyOn(component.receiptOfMaterialFacade, 'findOpenProductCountReceipts').mockReturnValue(
                        openRMsSubject
                    );

                    goButton.go.emit();
                    fixture.detectChanges();

                    const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                        By.directive(MockLoadingOverlayComponent)
                    ).componentInstance;

                    expect(loadingOverlay.loading).toBeTruthy();
                    expect(() => {
                        openRMsSubject.error('An error occurred');
                        flush();
                    }).toThrow();
                    fixture.detectChanges();
                    expect(loadingOverlay.loading).toBeFalsy();
                }));

                it('should not display dialog and show warning if the dialog has been destroyed', fakeAsync(() => {
                    jest.spyOn(component.messageFacade, 'addMessage');
                    component.openReceiptsDialog = null; // simulate component being destroyed

                    goButton.go.emit();
                    flush();

                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: 'There are open receipts that prevented the product count from being created',
                        severity: 'warn',
                    });
                }));
            });
            describe('with cancel button clicked', () => {
                it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
                    initialize('edit');
                    fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

                    expect(router.navigate).toHaveBeenCalledWith(['search'], {
                        relativeTo: TestBed.inject(ActivatedRoute).parent,
                    });
                }));
            });

            describe('when there is an existing product count ', () => {
                const apiResponseError = {
                    status: 409,
                    error: {
                        apiVersion: '1.0.0',
                        error: {
                            errors: [
                                {
                                    messageParams: ['406114'],
                                },
                            ],
                        },
                    },
                };

                describe('and the user is still on the page', () => {
                    beforeEach(() => {
                        jest.spyOn(component.existingProductCountDialog, 'open');
                        jest.spyOn(component.existingProductCountDialog, 'close');
                        const productCountObject = new Subject<number>();
                        jest.spyOn(component.physicalInventoryFacade, 'createCount').mockReturnValue(
                            productCountObject
                        );
                        goButton.go.emit();
                        productCountObject.error(apiResponseError);
                    });
                    it('should open the existing count dialog ', () => {
                        expect(component.physicalInventoryFacade.createCount).toHaveBeenCalled();
                        expect(component.existingProductCountDialog.open).toHaveBeenCalled();
                    });
                    it('should stop the loading overlay when the existing product count dialog opens ', () => {
                        const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                            By.directive(MockLoadingOverlayComponent)
                        ).componentInstance;
                        expect(loadingOverlay.loading).toBeFalsy();
                    });
                    it('should close the dialog after clicking GO BACK button', fakeAsync(async () => {
                        //click the GO BACK button
                        const goBackButton = await loader.getHarness(
                            MatButtonHarness.with({ selector: '#existing-product-count-go-back-button' })
                        );
                        await goBackButton.click();

                        //validate the dialog has closed
                        expect(component.existingProductCountDialog.close).toHaveBeenCalled();
                    }));
                    it('should navigate to the existing product count after clicking button that contains that id', fakeAsync(async () => {
                        //click the button with product count number
                        const existingProductCountNumberButton = await loader.getHarness(
                            MatButtonHarness.with({ selector: '#existing-product-count-number-button' })
                        );
                        await existingProductCountNumberButton.click();

                        expect(component.existingProductCountDialog.close).toHaveBeenCalled();

                        //validate the screen is navigated to the existing product count
                        expect(router.navigate).toHaveBeenCalledWith(['edit', 'TEST_STORE', '406114'], {
                            relativeTo: '/inventory/product-count',
                        });
                    }));
                });

                it('should not display dialog and show warning if the dialog has been destroyed', fakeAsync(() => {
                    component.existingProductCountDialog = null; // simulate component destroyed
                    const productCountObject = new Subject<number>();
                    jest.spyOn(component.physicalInventoryFacade, 'createCount').mockReturnValue(productCountObject);

                    goButton.go.emit();
                    productCountObject.error(apiResponseError);
                    flush();

                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message:
                            'There is an existing product count that prevented the product count from being created',
                        severity: 'warn',
                    });
                }));
            });
        });
    });
});
