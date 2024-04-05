import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import {
    CommonTechnicalModuleForms,
    FeatureSharedCommonTechnicalMockModule,
    MockTechnicalVehicleDetailSelectionComponent,
} from '@vioc-angular/central-ui/technical/common-technical';
import { Tsb, TsbFacade, YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import {
    FeatureDocumentSelectionMockModule,
    MockDocumentSelectionComponent,
} from '@vioc-angular/central-ui/technical/feature-shared-document-selection';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { getApplyActionButton, getCancelActionButton, getSaveActionButton } from '@vioc-angular/test/util-test';
import { of, Subject } from 'rxjs';
import { TsbForms } from '../tsb-module.forms';
import { TsbComponent } from './tsb.component';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';

describe('TsbComponent', () => {
    let component: TsbComponent;
    let fixture: ComponentFixture<TsbComponent>;
    let loader: HarnessLoader;
    let tsbFacade: TsbFacade;
    let serviceCategoryFacade: ServiceCategoryFacade;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatCheckboxModule,
                MatButtonModule,
                UiActionBarModule,
                UiAuditModule,
                UiLoadingMockModule,
                UtilFormModule,
                UiFilteredInputModule,
                FeatureDocumentSelectionMockModule,
                FeatureSharedCommonTechnicalMockModule,
                UiInfoButtonModule,
                CommonFunctionalityModule,
            ],
            declarations: [TsbComponent],
            providers: [
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: ActivatedRoute, useValue: { params: new Subject(), parent: '/maintenance/tsb' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        TsbForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        CommonTechnicalModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(TsbComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        tsbFacade = component['tsbFacade'];
        serviceCategoryFacade = component['serviceCategoryFacade'];
        jest.spyOn(serviceCategoryFacade, 'findActive').mockReturnValue(of([{ id: 3, code: 'TEST' }]));
    });

    const testTsb: Tsb = {
        id: 1,
        name: 'Test TSB',
        active: true,
        serviceCategory: { id: 1010, code: 'AIR CONDITIONER' },
        externalLink: null,
        documentFile: {
            id: 4,
            fileName: 'Test PDF.pdf',
            mimeType: 'application/pdf',
            document: btoa('file content'),
            version: 0,
        },
        version: 0,
        vehicles: [
            {
                id: 1, // indicates an update
                yearStart: 2019,
                yearEnd: 2022,
                makeId: 76,
                modelId: 1032,
                engineConfigId: null,
                attributes: [{ type: { id: 3 }, key: 5, version: 0 }],
                version: 0,
            },
            {
                id: null, // indicates an add
                yearStart: 2019,
                yearEnd: 2022,
                makeId: 76,
                modelId: 1032,
                engineConfigId: null,
                attributes: [{ type: { id: 3 }, key: 6 }],
            },
        ],
    };

    /** Initialize the the component with the given access mode and tsb id */
    const initialize = (accessMode: 'view' | 'edit' | 'add', model: Tsb = testTsb, andFlush = true) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                tsbId: model.id,
            }),
        } as ActivatedRouteSnapshot;
        jest.spyOn(tsbFacade, 'findById').mockReturnValue(of(model));
        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

    const getButton = async (selector: string): Promise<MatButtonHarness> =>
        await loader.getHarness(MatButtonHarness.with({ selector }));

    const clickButton = async (selector: string): Promise<void> => await (await getButton(selector)).click();

    const getVehicleDetailsComponent = () =>
        fixture.debugElement
            .query(By.directive(MockTechnicalVehicleDetailSelectionComponent))
            .injector.get(MockTechnicalVehicleDetailSelectionComponent);

    it('should create', fakeAsync(() => {
        initialize('add');
        expect(component).toBeTruthy();
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
        describe('in add mode', () => {
            it('should create a new Tsb and pull down a list of service categories', fakeAsync(() => {
                initialize('add');
                expect(tsbFacade.findById).not.toHaveBeenCalled();
                expect(component.model).toEqual(new Tsb());
                expect(serviceCategoryFacade.findActive).toHaveBeenCalled();
            }));
        });

        describe.each`
            numberOfVehicles | shouldFilter
            ${99}            | ${true}
            ${31}            | ${true}
            ${30}            | ${false}
            ${6}             | ${false}
            ${0}             | ${false}
        `('filter', ({ numberOfVehicles, shouldFilter }) => {
            it(`should ${shouldFilter ? '' : 'not '}filter if given ${numberOfVehicles} vehicles`, fakeAsync(() => {
                const vehicles = [];
                for (let i = 0; i < numberOfVehicles; i++) {
                    const vehicle = {
                        id: i,
                        yearStart: 2020,
                        yearEnd: 2020,
                        makeId: i % 3,
                        modelId: i % 5,
                        engineConfigId: null,
                        attributes: [],
                        version: 0,
                    };
                    vehicles.push(vehicle);
                }
                initialize('edit', { ...testTsb, vehicles });
                expect(getVehicleDetailsComponent().filter).toEqual(shouldFilter);
                if (shouldFilter) {
                    expect(fixture.debugElement.query(By.css('#vehicle-detail-filter-info'))).not.toBeNull();
                } else {
                    expect(fixture.debugElement.query(By.css('#vehicle-detail-filter-info'))).toBeNull();
                }
            }));
        });
    });

    describe('action bar', () => {
        const applyBtnSelector = '#apply-action';
        const saveBtnSelector = '#save-action';

        const fillOutForm = (name = 'New Tsb Name'): void => {
            component.form.setControlValue('name', name);
            component.form.setControlValue('externalLink', 'http://www.abc.com');
            flush();
        };

        describe.each`
            button
            ${applyBtnSelector}
            ${saveBtnSelector}
        `('disable logic', ({ button }) => {
            it(`should enable/disable ${button} based on the form's validity`, fakeAsync(async () => {
                initialize('add');
                expect(await (await getButton(button)).isDisabled()).toBeTruthy();
                fillOutForm();
                expect(await (await getButton(button)).isDisabled()).toBeFalsy();
                expect.assertions(2);
            }));
        });

        describe.each`
            accessMode | button      | buttonGetter             | rendered
            ${'view'}  | ${'apply'}  | ${getApplyActionButton}  | ${false}
            ${'view'}  | ${'save'}   | ${getSaveActionButton}   | ${false}
            ${'view'}  | ${'cancel'} | ${getCancelActionButton} | ${true}
            ${'edit'}  | ${'apply'}  | ${getApplyActionButton}  | ${true}
            ${'edit'}  | ${'save'}   | ${getSaveActionButton}   | ${true}
            ${'edit'}  | ${'cancel'} | ${getCancelActionButton} | ${true}
            ${'add'}   | ${'apply'}  | ${getApplyActionButton}  | ${true}
            ${'add'}   | ${'save'}   | ${getSaveActionButton}   | ${true}
            ${'add'}   | ${'cancel'} | ${getCancelActionButton} | ${true}
        `('render logic', ({ accessMode, button, buttonGetter, rendered }) => {
            it(`should ${rendered ? '' : 'not '}render ${button} in ${accessMode} mode`, fakeAsync(() => {
                initialize(accessMode);
                if (rendered) {
                    expect(buttonGetter(fixture)).not.toBeNull();
                } else {
                    expect(buttonGetter(fixture)).toBeNull();
                }
            }));
        });

        describe('adding a TSB', () => {
            const tsbId = 8;

            const saveOrApply = async (selector: string): Promise<void> => {
                // setup
                const messageFacade = TestBed.inject(MessageFacade);
                jest.spyOn(messageFacade, 'addMessage').mockImplementation();
                const tsbName = 'Test Name';
                jest.spyOn(tsbFacade, 'save').mockReturnValueOnce(of(tsbId));

                initialize('add');
                fillOutForm(tsbName);
                // execute
                await clickButton(selector);
                tick(600);

                // verify
                expect(tsbFacade.save).toHaveBeenCalled();
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'info',
                    message: `Tsb ${tsbName} saved successfully`,
                });
            };

            describe('apply button', () => {
                it('should save and navigate to the edit page', fakeAsync(async () => {
                    await saveOrApply(applyBtnSelector);
                    // Should navigate to edit page
                    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['edit', tsbId], expect.anything());
                }));

                it('should only call apply once, even with double clicks', fakeAsync(async () => {
                    // setup
                    const tsbName = 'Test Name';
                    jest.spyOn(tsbFacade, 'save').mockReturnValueOnce(of(tsbId));
                    initialize('add');
                    fillOutForm(tsbName);

                    // execute
                    await clickButton(applyBtnSelector);
                    await clickButton(applyBtnSelector);
                    tick(600);

                    fixture.detectChanges();
                    expect(TestBed.inject(Router).navigate).toHaveBeenCalledTimes(1);
                }));
            });

            describe('save button', () => {
                it('should save and navigateToSearchPage have been called', fakeAsync(async () => {
                    await saveOrApply(saveBtnSelector);
                    // Should navigate back
                    expect(TestBed.inject(RouterService).navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should only call save once, even with double clicks', fakeAsync(async () => {
                    // setup
                    const tsbName = 'Test Name';
                    jest.spyOn(tsbFacade, 'save').mockReturnValueOnce(of(tsbId));
                    initialize('add');
                    fillOutForm(tsbName);

                    // execute
                    await clickButton(saveBtnSelector);
                    await clickButton(saveBtnSelector);
                    tick(600);

                    fixture.detectChanges();
                    expect(TestBed.inject(RouterService).navigateToSearchPage).toHaveBeenCalledTimes(1);
                }));
            });
        });

        describe('updating', () => {
            describe.each`
                button
                ${applyBtnSelector}
                ${saveBtnSelector}
            `('via $button', ({ button }) => {
                beforeEach(() => jest.spyOn(tsbFacade, 'save').mockReturnValueOnce(of(null)));

                it('should send up only the document id if the document data has not changed', fakeAsync(async () => {
                    initialize('edit');
                    await clickButton(button);
                    tick(600);
                    expect(tsbFacade.save).toHaveBeenCalledWith({
                        ...testTsb,
                        ...component.form.value,
                        documentFile: { id: testTsb.documentFile.id },
                    });
                }));

                it('should send up document data if it changed', fakeAsync(async () => {
                    const newDocument = {
                        id: testTsb.documentFile.id,
                        fileName: 'new.pdf',
                        mimeType: 'application/pdf',
                        document: btoa('new content'),
                        version: testTsb.documentFile.version,
                    };
                    initialize('edit');
                    component.form.setControlValue('documentFile', newDocument);
                    await clickButton(button);
                    tick(600);
                    expect(tsbFacade.save).toHaveBeenCalledWith({
                        ...testTsb,
                        ...component.form.value,
                        documentFile: newDocument,
                    });
                }));

                it('should filter out empty vehicles', fakeAsync(async () => {
                    const validVehicle = testTsb.vehicles[0];
                    const emptyVehicleModel = {
                        ...testTsb,
                        // At least one valid vehicle is required execute saves
                        vehicles: [validVehicle, new YearMakeModelEngine()],
                    };
                    initialize('edit', emptyVehicleModel);

                    await clickButton(button);
                    tick(600);

                    // Expect empty vehicle to be filtered out
                    expect(tsbFacade.save).toHaveBeenCalledWith({
                        ...testTsb,
                        ...component.form.value,
                        vehicles: [validVehicle],
                        documentFile: { id: testTsb.documentFile.id },
                    });
                }));

                it('should filter out empty attributes', fakeAsync(async () => {
                    const emptyAttributeModel = {
                        ...testTsb,
                        // represents an existing attribute that has been cleared out but not deleted
                        vehicles: [
                            { ...testTsb.vehicles[0], attributes: [{ id: 1, type: null, key: null, version: 0 }] },
                        ],
                    };
                    initialize('edit', emptyAttributeModel);

                    await clickButton(button);
                    tick(600);
                    expect(tsbFacade.save).toHaveBeenCalledWith({
                        ...testTsb,
                        ...component.form.value,
                        vehicles: [{ ...testTsb.vehicles[0], attributes: [] }],
                        documentFile: { id: testTsb.documentFile.id },
                    });
                }));

                it('should handle an empty attributes array', fakeAsync(async () => {
                    const nullAttributeModel = {
                        ...testTsb,
                        vehicles: [{ ...testTsb.vehicles[0], attributes: [] }],
                    };
                    initialize('edit', nullAttributeModel);

                    await clickButton(button);
                    tick(600);
                    expect(tsbFacade.save).toHaveBeenCalledWith({
                        ...testTsb,
                        ...component.form.value,
                        vehicles: [{ ...testTsb.vehicles[0], attributes: [] }],
                        documentFile: { id: testTsb.documentFile.id },
                    });
                }));

                describe.each`
                    type                    | vehicleModel                                                                                                              | validVehicleModel
                    ${'engine designation'} | ${{ ...testTsb.vehicles[0], makeId: null, attributes: [{ id: 1, type: { code: 'ENGINE_DESIGNATION' }, key: 10 }] }}       | ${{ ...testTsb.vehicles[0], makeId: null, attributes: [] }}
                    ${'sub model'}          | ${{ ...testTsb.vehicles[0], makeId: null, modelId: null, attributes: [{ id: 2, type: { code: 'SUB_MODEL' }, key: 11 }] }} | ${{ ...testTsb.vehicles[0], makeId: null, modelId: null, attributes: [] }}
                    ${'sub model'}          | ${{ ...testTsb.vehicles[0], makeId: 1, modelId: null, attributes: [{ id: 2, type: { code: 'SUB_MODEL' }, key: 11 }] }}    | ${{ ...testTsb.vehicles[0], makeId: 1, modelId: null, attributes: [] }}
                `('clearing invalid attributes', ({ type, vehicleModel, validVehicleModel }) => {
                    it(`should filter out invalid ${type} when the vehicles=${JSON.stringify(
                        vehicleModel
                    )}`, fakeAsync(async () => {
                        const invalidEngineDesignationModel = {
                            ...testTsb,
                            vehicles: [vehicleModel],
                        };
                        initialize('edit', invalidEngineDesignationModel);

                        await clickButton(button);
                        tick(600);

                        expect(tsbFacade.save).toHaveBeenCalledWith({
                            ...testTsb,
                            ...component.form.value,
                            documentFile: { id: testTsb.documentFile.id },
                            vehicles: [validVehicleModel],
                        });
                    }));
                });
            });
        });
    });

    describe('vehicle details', () => {
        describe.each`
            accessMode | editable
            ${'add'}   | ${true}
            ${'edit'}  | ${true}
            ${'view'}  | ${false}
        `('editable', ({ accessMode, editable }) => {
            it(`should be ${editable ? '' : 'not '}editable in ${accessMode} mode`, fakeAsync(() => {
                initialize(accessMode);
                expect(getVehicleDetailsComponent().editable).toEqual(editable);
            }));
        });

        it('should pass the vehicles form', fakeAsync(() => {
            initialize('edit');
            expect(getVehicleDetailsComponent().vehicleDetails).toEqual(component.vehiclesControlArray);
        }));

        describe.each`
            accessMode | vehicles            | displayed
            ${'add'}   | ${testTsb.vehicles} | ${true}
            ${'add'}   | ${[]}               | ${true}
            ${'edit'}  | ${testTsb.vehicles} | ${true}
            ${'edit'}  | ${[]}               | ${true}
            ${'view'}  | ${testTsb.vehicles} | ${true}
            ${'view'}  | ${[]}               | ${false}
        `('displayed', ({ accessMode, vehicles, displayed }) => {
            it(`should ${displayed ? '' : 'not '}be displayed when in ${accessMode} mode and vehicles=${JSON.stringify(
                vehicles
            )}`, fakeAsync(() => {
                initialize(accessMode, { ...testTsb, vehicles });
                const vehicleDetailsSection = fixture.debugElement.query(By.css('.vehicle-details.section'));
                if (displayed) {
                    expect(vehicleDetailsSection).not.toBeNull();
                } else {
                    expect(vehicleDetailsSection).toBeNull();
                }
            }));
        });
    });

    describe('document selection', () => {
        const getDocumentSelectionComponent = (): MockDocumentSelectionComponent =>
            fixture.debugElement
                .query(By.directive(MockDocumentSelectionComponent))
                .injector.get(MockDocumentSelectionComponent);

        describe('document change', () => {
            it('should update the form with the new document', fakeAsync(() => {
                const testDocument = { id: null, fileName: 'pdf.pdf', document: '1234&=', mimeType: 'application/pdf' };
                initialize('add');
                expect(component.form.getControlValue('documentFile')).toBeNull();
                getDocumentSelectionComponent().documentFileChange.emit(testDocument);
                expect(component.form.getControlValue('documentFile')).toEqual(testDocument);
                expect(component.form.dirty).toBeTruthy();
            }));
        });

        describe('externalLink change', () => {
            it('should update the form with the new external link', fakeAsync(() => {
                const testLink = 'https://www.google.com';
                initialize('add');
                expect(component.form.getControlValue('externalLink')).toBeNull();
                getDocumentSelectionComponent().externalLinkChange.emit(testLink);
                expect(component.form.getControlValue('externalLink')).toEqual(testLink);
                expect(component.form.dirty).toBeTruthy();
            }));
        });

        describe.each`
            accessMode | editable
            ${'add'}   | ${true}
            ${'edit'}  | ${true}
            ${'view'}  | ${false}
        `('editable', ({ accessMode, editable }) => {
            it(`should ${editable ? '' : 'not '}be editable in ${accessMode} mode`, fakeAsync(() => {
                initialize(accessMode);
                expect(getDocumentSelectionComponent().editable).toEqual(editable);
            }));
        });

        describe('info', () => {
            it('should pass on the info about TSBs', fakeAsync(() => {
                initialize('edit');
                expect(getDocumentSelectionComponent().info).toEqual(
                    'A TSB requires either a document or an external link.'
                );
            }));
        });
    });

    describe('unsaved changes', () => {
        it('should be true if there are changes to the form', fakeAsync(() => {
            initialize('add');
            expect(component.unsavedChanges).toEqual(false);
            component.form.setControlValueDirtying('name', 'New TSB');
            expect(component.unsavedChanges).toEqual(true);
        }));
    });
});
