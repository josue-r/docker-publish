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
import { MatListModule } from '@angular/material/list';
import { MatSelectionListHarness } from '@angular/material/list/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { Product, ProductFacade } from '@vioc-angular/central-ui/product/data-access-product';
import {
    CommonTechnicalModuleForms,
    FeatureSharedCommonTechnicalMockModule,
    MockTechnicalVehicleDetailSelectionComponent,
} from '@vioc-angular/central-ui/technical/common-technical';
import { TechnicalAlert, TechnicalAlertFacade } from '@vioc-angular/central-ui/technical/data-access-technical-alert';
import { YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import {
    FeatureDocumentSelectionMockModule,
    MockDocumentSelectionComponent,
} from '@vioc-angular/central-ui/technical/feature-shared-document-selection';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { FEATURE_CONFIGURATION_TOKEN, FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { MockAddRemoveButtonComponent, UiAddRemoveButtonMockModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { getApplyActionButton, getCancelActionButton, getSaveActionButton } from '@vioc-angular/test/util-test';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { TechnicalAlertForms } from '../technical-alert-module.forms';
import { TechnicalAlertComponent } from './technical-alert.component';

describe('TechnicalAlertComponent', () => {
    let component: TechnicalAlertComponent;
    let fixture: ComponentFixture<TechnicalAlertComponent>;
    let technicalAlertFacade: TechnicalAlertFacade;
    let commonCodeFacade: CommonCodeFacade;
    let productFacade: ProductFacade;
    let messageFacade: MessageFacade;
    let loader: HarnessLoader;

    const activeAlertScreens = [
        { id: 5, code: 'VISIT_INFO', description: 'Visit Info' },
        { id: 6, code: 'TECH_INFO', description: 'Tech Info' },
        { id: 7, code: 'INSPECTION', description: 'Inspection' },
    ];
    const passiveAlertScreens = [...activeAlertScreens, { id: 8, code: 'Oil_EVAC', description: 'Oil Evac' }];
    const product: Product = {
        id: 45,
        code: '12345',
        description: 'Test Product',
        version: 0,
    };
    const testTechnicalAlert: TechnicalAlert = {
        id: 1,
        name: 'Test Alert',
        comments: 'Test Technical Alert',
        active: true,
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
        ],
        activeScreens: [
            { screen: { id: 5, code: 'VISIT_INFO', description: 'Visit Info' } },
            { screen: { id: 6, code: 'TECH_INFO', description: 'Tech Info' } },
        ],
        passiveScreens: [{ screen: { id: 8, code: 'Oil_EVAC', description: 'Oil Evac' } }],
        product: null,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatCheckboxModule,
                MatButtonModule,
                MatListModule,
                UiActionBarModule,
                UiAuditModule,
                UiLoadingMockModule,
                UtilFormModule,
                FeatureSharedCommonTechnicalMockModule,
                FeatureDocumentSelectionMockModule,
                UiInfoButtonModule,
                UiDialogMockModule,
                UiAddRemoveButtonMockModule,
                FeatureFeatureFlagModule,
                CommonFunctionalityModule,
            ],
            declarations: [TechnicalAlertComponent],
            providers: [
                FormFactory,
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: ActivatedRoute, useValue: { params: new Subject(), parent: '/maintenance/alerts' } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()), post: jest.fn(), put: jest.fn() } },
                {
                    provide: AuthenticationFacade,
                    useValue: { getUser: () => EMPTY } as any as AuthenticationFacade,
                },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            technicalAlert: {
                                addAndEdit: {
                                    addOrEditProduct: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        TechnicalAlertForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        CommonTechnicalModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(TechnicalAlertComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        technicalAlertFacade = component['technicalAlertFacade'];
        commonCodeFacade = component['commonCodeFacade'];
        productFacade = component['productFacade'];
        messageFacade = component['messageFacade'];
    });

    /** Initialize the the component with the given access mode and tsb id */
    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: TechnicalAlert = testTechnicalAlert,
        andFlush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                alertId: model.id,
            }),
        } as ActivatedRouteSnapshot;
        jest.spyOn(technicalAlertFacade, 'findById').mockReturnValue(of(model));
        jest.spyOn(commonCodeFacade, 'findByType').mockReturnValueOnce(of(activeAlertScreens)); // first call to get active alert screens
        jest.spyOn(commonCodeFacade, 'findByType').mockReturnValueOnce(of(passiveAlertScreens)); // second call to get passive alert screens
        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

    const getButton = (selector: string): Promise<MatButtonHarness> =>
        loader.getHarness(MatButtonHarness.with({ selector }));

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

    describe('OnInit', () => {
        describe.each`
            accessMode | expectedModel           | formValue
            ${'add'}   | ${new TechnicalAlert()} | ${{ ...new TechnicalAlert(), active: true }}
            ${'edit'}  | ${testTechnicalAlert}   | ${testTechnicalAlert}
            ${'view'}  | ${testTechnicalAlert}   | ${testTechnicalAlert}
        `('with $accessMode', ({ accessMode, expectedModel, formValue }) => {
            it(`should load the technical alert and load active/passive alert screens with ${accessMode} access`, fakeAsync(() => {
                initialize(accessMode);
                expect(component.model).toEqual(expectedModel);
                component.updateAlertScreens();
                expect(component.form.getRawValue()).toEqual({
                    ...formValue,
                    activeScreens: formValue.activeScreens.map((as) => {
                        return { screen: as.screen };
                    }),
                    passiveScreens: formValue.passiveScreens.map((ps) => {
                        return { screen: ps.screen };
                    }),
                });
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('ALERT_ACTIVE_SCREEN', true);
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('ALERT_PASSIVE_SCREEN', true);
            }));
        });

        it('should set the existing active/passive alert screens with edit access', fakeAsync(() => {
            initialize('edit');
            expect(component.selectedActiveAlertScreens.selectedOptions.selected.map((o) => o.value)).toEqual(
                testTechnicalAlert.activeScreens.map((a) => a.screen)
            );
            expect(component.selectedPassiveAlertScreens.selectedOptions.selected.map((o) => o.value)).toEqual(
                testTechnicalAlert.passiveScreens.map((a) => a.screen)
            );
        }));

        it('should disable the form with view access', fakeAsync(() => {
            initialize('view');
            expect(component.form.disabled).toEqual(true);
        }));

        it('should throw an error with an unsupported access mode', fakeAsync(() => {
            const route = TestBed.inject(ActivatedRoute);
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode: 'add-like',
                }),
            } as ActivatedRouteSnapshot;
            expect(() => fixture.detectChanges()).toThrowError('Unhandled Access Mode: add-like');
        }));

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
                initialize('edit', { ...testTechnicalAlert, vehicles });
                const vehicleDetailsComponent = fixture.debugElement
                    .query(By.directive(MockTechnicalVehicleDetailSelectionComponent))
                    .injector.get(MockTechnicalVehicleDetailSelectionComponent);
                expect(vehicleDetailsComponent.filter).toEqual(shouldFilter);
                if (shouldFilter) {
                    expect(fixture.debugElement.query(By.css('#vehicle-detail-filter-info'))).not.toBeNull();
                } else {
                    expect(fixture.debugElement.query(By.css('#vehicle-detail-filter-info'))).toBeNull();
                }
            }));
        });
    });

    describe('active/passive alert screens selection', () => {
        const getAlertScreenSelection = (selector: string): Promise<MatSelectionListHarness> =>
            loader.getHarness(MatSelectionListHarness.with({ selector }));

        describe('updating', () => {
            beforeEach(fakeAsync(() => initialize('add')));

            it.each`
                alertScreen        | displayedList          | selector
                ${'active alert'}  | ${activeAlertScreens}  | ${'#active-alert-screens'}
                ${'passive alert'} | ${passiveAlertScreens} | ${'#passive-alert-screens'}
            `(
                'should display the description of the alerts in the $alertScreen list',
                async ({ displayedList, selector }) => {
                    displayedList.forEach(async (v) => {
                        // verify every item passed from the alert screens list is displayed, by description
                        expect(await (await getAlertScreenSelection(selector)).getItems(v.description)).toBeTruthy();
                    });
                }
            );
        });

        describe.each`
            accessMode | alertScreen         | selector                    | disabled
            ${'add'}   | ${'active alerts'}  | ${'#active-alert-screens'}  | ${false}
            ${'edit'}  | ${'active alerts'}  | ${'#active-alert-screens'}  | ${false}
            ${'view'}  | ${'active alerts'}  | ${'#active-alert-screens'}  | ${true}
            ${'add'}   | ${'passive alerts'} | ${'#passive-alert-screens'} | ${false}
            ${'edit'}  | ${'passive alerts'} | ${'#passive-alert-screens'} | ${false}
            ${'view'}  | ${'passive alerts'} | ${'#passive-alert-screens'} | ${true}
        `('$alertScreen', ({ accessMode, selector, disabled }) => {
            it(`should ${disabled ? '' : 'not '}be disabled with ${accessMode} access`, fakeAsync(async () => {
                initialize(accessMode);
                expect(await (await getAlertScreenSelection(selector)).isDisabled()).toEqual(disabled);
            }));
        });
    });

    describe('documents/externalLinks selection', () => {
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
            it(`should ${editable ? '' : 'not '}be editable with ${accessMode} access`, fakeAsync(() => {
                initialize(accessMode);
                expect(getDocumentSelectionComponent().editable).toEqual(editable);
            }));
        });
    });

    describe('vehicle details', () => {
        describe.each`
            accessMode | vehicles                       | displayed
            ${'add'}   | ${testTechnicalAlert.vehicles} | ${true}
            ${'add'}   | ${[]}                          | ${true}
            ${'edit'}  | ${testTechnicalAlert.vehicles} | ${true}
            ${'edit'}  | ${[]}                          | ${true}
            ${'view'}  | ${testTechnicalAlert.vehicles} | ${true}
            ${'view'}  | ${[]}                          | ${false}
        `('displayed', ({ accessMode, vehicles, displayed }) => {
            it(`should ${displayed ? '' : 'not '}be displayed with ${accessMode} access`, fakeAsync(() => {
                initialize(accessMode, { ...testTechnicalAlert, vehicles });
                const vehicleDetails = fixture.debugElement.query(
                    By.directive(MockTechnicalVehicleDetailSelectionComponent)
                );
                if (displayed) {
                    expect(vehicleDetails).not.toBeNull();
                    expect(vehicleDetails.componentInstance.vehicleDetails).toEqual(
                        component.form.getArray('vehicles')
                    );
                } else {
                    expect(vehicleDetails).toBeNull();
                }
            }));
        });

        describe.each`
            accessMode | editable
            ${'add'}   | ${true}
            ${'edit'}  | ${true}
            ${'view'}  | ${false}
        `('editable', ({ accessMode, editable }) => {
            it(`should be ${editable ? '' : 'not '}editable with ${accessMode} access`, fakeAsync(() => {
                initialize(accessMode);
                const vehicleDetailsSection = fixture.debugElement.query(
                    By.directive(MockTechnicalVehicleDetailSelectionComponent)
                ).componentInstance as MockTechnicalVehicleDetailSelectionComponent;
                expect(vehicleDetailsSection.editable).toEqual(editable);
            }));
        });
    });

    describe('action bar', () => {
        describe('adding an alert', () => {
            const alertId = 10;
            const alertName = 'Test Technical Alert';

            const saveForm = async (selector: string) => {
                await (await getButton(selector)).click();
                fixture.debugElement.query(By.css('#alert-add-continue-button')).nativeElement.click();
                fixture.detectChanges();
                tick(600);
                expect(technicalAlertFacade.save).toHaveBeenCalled();
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'info',
                    message: `Technical Alert ${alertName} saved successfully`,
                });
            };

            beforeEach(fakeAsync(() => {
                jest.spyOn(technicalAlertFacade, 'save').mockReturnValueOnce(of(alertId));
                jest.spyOn(messageFacade, 'addMessage').mockImplementation();

                initialize('add');

                component.form.setControlValue('name', alertName);
                component.form.setControlValue('comments', 'Test Alert Comment');
                component.form.setControlValue('activeScreens', testTechnicalAlert.activeScreens);
                // select the existing active screens
                component.selectedActiveAlertScreens.options.forEach((o) => {
                    if (testTechnicalAlert.activeScreens.map((as) => as.screen.code).includes(o.value.code)) {
                        o.toggle();
                    }
                });
                flush();
            }));

            describe('apply button', () => {
                it('should save and navigate to the edit page', fakeAsync(async () => {
                    jest.spyOn(component['router'], 'navigate');
                    await saveForm('#apply-action');
                    expect(component['router'].navigate).toHaveBeenCalledWith(['edit', alertId], expect.anything());
                }));

                it('should only call apply once, even with double clicks', fakeAsync(async () => {
                    jest.spyOn(component['router'], 'navigate');
                    await (await getButton('#apply-action')).click();
                    await (await getButton('#apply-action')).click();
                    fixture.debugElement.query(By.css('#alert-add-continue-button')).nativeElement.click();
                    fixture.detectChanges();
                    tick(600);
                    expect(component['router'].navigate).toHaveBeenCalledTimes(1);
                }));

                it('should not call apply when cancel clicked on warning dialog', fakeAsync(async () => {
                    jest.spyOn(component['router'], 'navigate');
                    await (await getButton('#apply-action')).click();
                    fixture.debugElement.query(By.css('#alert-add-cancel-button')).nativeElement.click();
                    fixture.detectChanges();
                    tick(600);
                    expect(component['router'].navigate).toHaveBeenCalledTimes(0);
                }));
            });

            describe('save button', () => {
                it('should save and navigate to the search page', fakeAsync(async () => {
                    await saveForm('#save-action');
                    expect(component['routerService'].navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should only call save once, even with double clicks', fakeAsync(async () => {
                    jest.spyOn(component['router'], 'navigate');

                    await (await getButton('#save-action')).click();
                    await (await getButton('#save-action')).click();
                    fixture.debugElement.query(By.css('#alert-add-continue-button')).nativeElement.click();
                    fixture.detectChanges();
                    tick(600);
                    expect(component['routerService'].navigateToSearchPage).toHaveBeenCalledTimes(1);
                }));

                it('should not call save when cancel clicked on warning dialog', fakeAsync(async () => {
                    jest.spyOn(component['router'], 'navigate');

                    await (await getButton('#save-action')).click();
                    fixture.debugElement.query(By.css('#alert-add-cancel-button')).nativeElement.click();
                    fixture.detectChanges();
                    tick(600);
                    expect(component['routerService'].navigateToSearchPage).toHaveBeenCalledTimes(0);
                }));
            });
        });

        describe('updating an alert', () => {
            // alert screen mapping that is passed to the API
            const alertScreens = {
                activeScreens: testTechnicalAlert.activeScreens.map((a) => {
                    return { screen: a.screen };
                }),
                passiveScreens: testTechnicalAlert.passiveScreens.map((a) => {
                    return { screen: a.screen };
                }),
            };

            describe.each`
                button     | selector
                ${'apply'} | ${'#apply-action'}
                ${'save'}  | ${'#save-action'}
            `('using the $button button', ({ selector }) => {
                beforeEach(() => jest.spyOn(technicalAlertFacade, 'save').mockReturnValueOnce(of(null)));

                it('should send up only the document id if the document data has not changed', fakeAsync(async () => {
                    initialize('edit');

                    await (await getButton(selector)).click();
                    tick(600);
                    expect(technicalAlertFacade.save).toHaveBeenCalledWith({
                        ...testTechnicalAlert,
                        ...component.form.value,
                        ...alertScreens,
                        documentFile: { id: testTechnicalAlert.documentFile.id },
                    });
                }));

                it('should send up document data if it changed', fakeAsync(async () => {
                    const newDocument = {
                        id: testTechnicalAlert.documentFile.id,
                        fileName: 'new.pdf',
                        mimeType: 'application/pdf',
                        document: btoa('new content'),
                        version: testTechnicalAlert.documentFile.version,
                    };
                    initialize('edit');
                    component.form.setControlValue('documentFile', newDocument);

                    await (await getButton(selector)).click();
                    tick(600);
                    expect(technicalAlertFacade.save).toHaveBeenCalledWith({
                        ...testTechnicalAlert,
                        ...component.form.value,
                        ...alertScreens,
                        documentFile: newDocument,
                    });
                }));

                it('should filter out empty vehicles', fakeAsync(async () => {
                    const emptyVehicleModel = { ...testTechnicalAlert, vehicles: [new YearMakeModelEngine()] };
                    initialize('edit', emptyVehicleModel);

                    await (await getButton(selector)).click();
                    tick(600);
                    expect(technicalAlertFacade.save).toHaveBeenCalledWith({
                        ...testTechnicalAlert,
                        ...component.form.value,
                        ...alertScreens,
                        documentFile: { id: testTechnicalAlert.documentFile.id },
                        vehicles: [],
                    });
                }));

                it('should filter out empty attributes', fakeAsync(async () => {
                    const emptyAttributeModel = {
                        ...testTechnicalAlert,
                        // represents an existing attribute that has been cleared out but not deleted
                        vehicles: [
                            {
                                ...testTechnicalAlert.vehicles[0],
                                attributes: [{ id: 1, type: null, key: null, version: 0 }],
                            },
                        ],
                    };
                    initialize('edit', emptyAttributeModel);

                    await (await getButton(selector)).click();
                    tick(600);
                    expect(technicalAlertFacade.save).toHaveBeenCalledWith({
                        ...testTechnicalAlert,
                        ...component.form.value,
                        ...alertScreens,
                        documentFile: { id: testTechnicalAlert.documentFile.id },
                        vehicles: [{ ...testTechnicalAlert.vehicles[0], attributes: [] }],
                    });
                }));

                it('should handle an empty attributes array', fakeAsync(async () => {
                    const nullAttributeModel = {
                        ...testTechnicalAlert,
                        vehicles: [{ ...testTechnicalAlert.vehicles[0], attributes: [] }],
                    };
                    initialize('edit', nullAttributeModel);

                    await (await getButton(selector)).click();
                    tick(600);
                    expect(technicalAlertFacade.save).toHaveBeenCalledWith({
                        ...testTechnicalAlert,
                        ...component.form.value,
                        ...alertScreens,
                        documentFile: { id: testTechnicalAlert.documentFile.id },
                        vehicles: [{ ...testTechnicalAlert.vehicles[0], attributes: [] }],
                    });
                }));

                describe.each`
                    type                    | vehicleModel                                                                                                                         | validVehicleModel
                    ${'engine designation'} | ${{ ...testTechnicalAlert.vehicles[0], makeId: null, attributes: [{ id: 1, type: { code: 'ENGINE_DESIGNATION' }, key: 10 }] }}       | ${{ ...testTechnicalAlert.vehicles[0], makeId: null, attributes: [] }}
                    ${'sub model'}          | ${{ ...testTechnicalAlert.vehicles[0], makeId: null, modelId: null, attributes: [{ id: 2, type: { code: 'SUB_MODEL' }, key: 11 }] }} | ${{ ...testTechnicalAlert.vehicles[0], makeId: null, modelId: null, attributes: [] }}
                    ${'sub model'}          | ${{ ...testTechnicalAlert.vehicles[0], makeId: 1, modelId: null, attributes: [{ id: 2, type: { code: 'SUB_MODEL' }, key: 11 }] }}    | ${{ ...testTechnicalAlert.vehicles[0], makeId: 1, modelId: null, attributes: [] }}
                `('clearing invalid attributes', ({ type, vehicleModel, validVehicleModel }) => {
                    it(`should filter out invalid ${type} when the vehicles=${JSON.stringify(
                        vehicleModel
                    )}`, fakeAsync(async () => {
                        const invalidEngineDesignationModel = {
                            ...testTechnicalAlert,
                            vehicles: [vehicleModel],
                        };
                        initialize('edit', invalidEngineDesignationModel);

                        await (await getButton(selector)).click();
                        tick(600);
                        expect(technicalAlertFacade.save).toHaveBeenCalledWith({
                            ...testTechnicalAlert,
                            ...component.form.value,
                            ...alertScreens,
                            documentFile: { id: testTechnicalAlert.documentFile.id },
                            vehicles: [validVehicleModel],
                        });
                    }));
                });
            });
        });

        describe.each`
            button     | selector
            ${'apply'} | ${'#apply-action'}
            ${'save'}  | ${'#save-action'}
        `('form validity', ({ button, selector }) => {
            it(`should enable/disable the ${button} button`, fakeAsync(async () => {
                initialize('add');
                const disabledButton = await getButton(selector);
                tick(600);
                expect(await disabledButton.isDisabled()).toBeTruthy();

                component.form.setControlValue('name', 'Test Alert');
                component.form.setControlValue('comments', 'Test Alert Comment');
                component.form.setControlValue('activeScreens', testTechnicalAlert.activeScreens);

                const enabledButton = await getButton(selector);
                tick(600);
                expect(await enabledButton.isDisabled()).toBeFalsy();
                expect.assertions(2);
            }));
        });

        describe.each`
            accessMode | button      | buttonGetter             | isDisplayed
            ${'view'}  | ${'apply'}  | ${getApplyActionButton}  | ${false}
            ${'view'}  | ${'save'}   | ${getSaveActionButton}   | ${false}
            ${'view'}  | ${'cancel'} | ${getCancelActionButton} | ${true}
            ${'edit'}  | ${'apply'}  | ${getApplyActionButton}  | ${true}
            ${'edit'}  | ${'save'}   | ${getSaveActionButton}   | ${true}
            ${'edit'}  | ${'cancel'} | ${getCancelActionButton} | ${true}
            ${'add'}   | ${'apply'}  | ${getApplyActionButton}  | ${true}
            ${'add'}   | ${'save'}   | ${getSaveActionButton}   | ${true}
            ${'add'}   | ${'cancel'} | ${getCancelActionButton} | ${true}
        `('in $accessMode access mode', ({ accessMode, button, buttonGetter, isDisplayed }) => {
            it(`should ${isDisplayed ? '' : 'not '}display the ${button} button`, fakeAsync(() => {
                initialize(accessMode);
                if (isDisplayed) {
                    expect(buttonGetter(fixture)).not.toBeNull();
                } else {
                    expect(buttonGetter(fixture)).toBeNull();
                }
            }));
        });
    });

    describe('unsaved changes', () => {
        it('should be true if there are changes to the form', fakeAsync(() => {
            initialize('add');
            expect(component.unsavedChanges).toEqual(false);
            component.form.setControlValueDirtying('name', 'Test Technical Alert');
            expect(component.unsavedChanges).toEqual(true);
        }));
    });

    describe('product details', () => {
        describe.each`
            accessMode
            ${'edit'}
            ${'add'}
        `('product starts as null in $accessMode access mode', ({ accessMode }) => {
            it('should allow a product code to be entered manually', fakeAsync(() => {
                jest.spyOn(component.featureFlagFacade, 'isEnabled').mockReturnValueOnce(of(true));
                jest.spyOn(productFacade, 'findByCode').mockReturnValueOnce(of(product));
                jest.spyOn(component, 'addProductFromInput');
                initialize(accessMode);

                // Checks addProductFromInput
                const productGoButton = fixture.debugElement.query(By.css('#product-go'));
                component.productCodeControl.patchValue(product.code);
                fixture.detectChanges();
                productGoButton.nativeElement.click();
                tick(600);
                fixture.detectChanges();
                tick(600); // clear timers in queue
                const productCodeField = fixture.debugElement.query(By.css('#product-code'));
                const productDescriptionField = fixture.debugElement.query(By.css('#product-description'));
                const removeButton = fixture.debugElement.query(By.css('#remove-button'));

                expect(component.addProductFromInput).toHaveBeenCalled();
                expect(component.form.getControlValue('product').code).toBe(product.code);
                expect(productCodeField.nativeElement.disabled).toBeTruthy();
                expect(component.form.getControlValue('product').description).toBe(product.description);
                expect(productDescriptionField.nativeElement.disabled).toBeTruthy();
                expect(removeButton.nativeElement.disabled).toBeFalsy();
            }));

            it('should have actions passed to the product search dialog', fakeAsync(() => {
                jest.spyOn(component.featureFlagFacade, 'isEnabled').mockReturnValueOnce(of(true));
                initialize(accessMode);

                const dialog = fixture.debugElement.query(By.css('#search-add-product'));
                const dialogComponent = dialog.componentInstance;

                expect(dialogComponent.content).not.toBeNull();
                expect(dialog.query(By.css('#product-selection'))).not.toBeNull();
                expect(dialogComponent.actions).not.toBeNull();
                expect(dialog.query(By.css('#cancel-search-button'))).not.toBeNull();
                expect(dialog.query(By.css('#add-product-button'))).not.toBeNull();

                jest.spyOn(component, 'openSearchDialog').mockImplementation(() => {});
                // should open searchDialog
                fixture.debugElement.query(By.css('#product-search')).nativeElement.click();
                tick(600);
                expect(component.openSearchDialog).toHaveBeenCalled();

                // should close the searchDialog
                jest.spyOn(component, 'closeSearchDialog');
                dialog.query(By.css('#cancel-search-button')).nativeElement.click();
                tick(600);
                fixture.detectChanges();

                expect(component.closeSearchDialog).toHaveBeenCalled();
            }));

            it('should allow add by searching for product code', fakeAsync(() => {
                jest.spyOn(component.featureFlagFacade, 'isEnabled').mockReturnValueOnce(of(true));
                jest.spyOn(productFacade, 'findByCode').mockReturnValueOnce(of(product));
                jest.spyOn(component, 'addProductFromSearch');
                jest.spyOn(component, 'addProductFromInput');
                initialize(accessMode);

                // Checks addProductFromSearch, should add selected product
                component.productSelectionControl.patchValue([product]);
                fixture.detectChanges();
                const dialog = fixture.debugElement.query(By.css('#search-add-product'));
                dialog.query(By.css('#add-product-button')).nativeElement.click();
                tick(600);
                fixture.detectChanges();
                tick(600); // clear timers in queue

                expect(component.addProductFromSearch).toHaveBeenCalled();
                expect(component.addProductFromInput).toHaveBeenCalled();
                expect(component.form.getControlValue('product').code).toBe(product.code);

                // should populate product code and description
                const productCodeField = fixture.debugElement.query(By.css('#product-code'));
                const productDescriptionField = fixture.debugElement.query(By.css('#product-description'));

                expect(component.form.getControlValue('product').code).toBe(product.code);
                expect(productCodeField.nativeElement.disabled).toBeTruthy();
                expect(component.form.getControlValue('product').description).toBe(product.description);
                expect(productDescriptionField.nativeElement.disabled).toBeTruthy();
                // product search should be disabled after adding a product
                expect(fixture.debugElement.query(By.css('#product-search')).nativeElement.disabled).toBeTruthy();
            }));

            it('should allow a product to be removed and a new one added', fakeAsync(() => {
                jest.spyOn(component.featureFlagFacade, 'isEnabled').mockReturnValueOnce(of(true));
                jest.spyOn(component, 'addProductFromSearch');
                jest.spyOn(productFacade, 'findByCode').mockReturnValueOnce(of(product));
                initialize(accessMode);

                component.productSelectionControl.patchValue([product]);
                fixture.detectChanges();
                const dialog = fixture.debugElement.query(By.css('#search-add-product'));
                dialog.query(By.css('#add-product-button')).nativeElement.click();
                tick(600);
                fixture.detectChanges();

                const removeButton = fixture.debugElement.query(By.css('#remove-button'))
                    .componentInstance as MockAddRemoveButtonComponent;
                // should allow removal of product
                expect(removeButton.removeButtonDisplayed).toBeTruthy();

                // should allow a product to be removed and a new one added
                jest.spyOn(component, 'removeProduct');
                removeButton.removeItem.emit();
                fixture.detectChanges();
                tick(600); // clear timers in queue

                expect(component.removeProduct).toHaveBeenCalled();
                expect(component.form.getControlValue('product')).toBeNull();
                expect(component.productCodeControl.value).toBeNull();
                expect(component.productCodeControl.enabled).toBeTruthy();
                expect(fixture.debugElement.query(By.css('#product-search')).nativeElement.disabled).toBeFalsy();
            }));

            it('should display an error if a product requested cannot be added', fakeAsync(() => {
                jest.spyOn(component.featureFlagFacade, 'isEnabled').mockReturnValueOnce(of(true));
                jest.spyOn(productFacade, 'findByCode').mockReturnValue(throwError(new Error('status:404')));
                initialize(accessMode);

                const productGoButton = fixture.debugElement.query(By.css('#product-go'));
                component.productCodeControl.patchValue(product.code);
                fixture.detectChanges();
                productGoButton.nativeElement.click();
                tick(600);
                fixture.detectChanges();
                tick(600); // clear timers in queue
                // expect an error message
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'error',
                    message: 'Product ' + product.code + ' not found',
                });
            }));

            describe.each`
                isEnabled
                ${true}
                ${false}
            `(`add/edit a product to a technical alert feature flag`, ({ isEnabled }) => {
                it(`product details section should ${isEnabled ? 'not ' : ''}be hidden if the feature is ${
                    isEnabled ? 'enabled' : 'disabled'
                }`, fakeAsync(() => {
                    jest.spyOn(component.featureFlagFacade, 'isEnabled').mockReturnValueOnce(of(isEnabled));
                    initialize(accessMode);

                    const productDetails = fixture.debugElement.query(By.css('#alert-product-details'));
                    if (isEnabled) {
                        expect(productDetails).toBeTruthy();
                    } else {
                        expect(productDetails).toBeFalsy();
                    }
                }));
            });
        });

        it('should populate product on load if product is not null and disable the control', fakeAsync(() => {
            initialize('edit', {
                ...testTechnicalAlert,
                product: {
                    code: product.code,
                    description: product.description,
                },
            });
            expect(component.productCodeControl.disabled).toBeTruthy();
            expect(component.isProductSelected).toBeTruthy();
            expect(component.form.getControlValue('product').code).toBe(product.code);
            expect(component.form.getControlValue('product').description).toBe(product.description);
        }));
    });
});
