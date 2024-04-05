import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AcesFacade } from '@vioc-angular/central-ui/technical/data-access-aces';
import { YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { MockAddRemoveButtonComponent, UiAddRemoveButtonMockModule } from '@vioc-angular/shared/ui-add-remove-button';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { findAllByCss, findByCss } from '@vioc-angular/test/util-test';
import { EMPTY, of, ReplaySubject } from 'rxjs';
import { CommonTechnicalModuleForms } from '../../common-technical-module-forms';
import { MockTechnicalVehicleAttributeSelectionComponent } from '../../mocks/technical-vehicle-attribute-selection.component.mock';
import { TechnicalVehicleDetailSelectionComponent } from './technical-vehicle-detail-selection.component';

describe('TechnicalVehicleDetailSelectionComponent', () => {
    let component: TechnicalVehicleDetailSelectionComponent;
    let fixture: ComponentFixture<TechnicalVehicleDetailSelectionComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let acesFacade: AcesFacade;
    let testVehicleDetails: FormArray;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                UtilFormMockModule,
                UiAddRemoveButtonMockModule,
                UiFilteredInputMockModule,
                UiLoadingMockModule,
                MatIconModule,
            ],
            declarations: [TechnicalVehicleDetailSelectionComponent, MockTechnicalVehicleAttributeSelectionComponent],
            providers: [
                FormFactory,
                {
                    provide: AcesFacade,
                    useValue: {
                        findAllMakes: jest.fn(),
                        findModelsByMakeId: jest.fn(),
                        findEnginesByMakeIdAndModelId: jest.fn(),
                    },
                },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: ChangeDetectorRef, useValue: { detectChanges: jest.fn() } },
            ],
        })
            .overrideComponent(TechnicalVehicleDetailSelectionComponent, {
                set: { changeDetection: ChangeDetectionStrategy.Default },
            })
            .compileComponents();
    });

    beforeEach(() => {
        CommonTechnicalModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(TechnicalVehicleDetailSelectionComponent);
        formFactory = TestBed.inject(FormFactory);
        componentDestroyed = new ReplaySubject(1);
        component = fixture.componentInstance;
        component.vehicleDetails = formFactory.array('YearMakeModelEngine', [], componentDestroyed);
        testVehicleDetails = formFactory.array(
            'YearMakeModelEngine',
            [{ ...new YearMakeModelEngine(), makeId: 1 }],
            componentDestroyed
        );
        acesFacade = component['acesFacade'];
        jest.spyOn(acesFacade, 'findAllMakes').mockReturnValue(
            of([
                { id: 1, description: 'Make 1' },
                { id: 2, description: 'Make 2' },
                { id: 3, description: 'Make 3' },
            ])
        );
        jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValue(of([]));
        jest.spyOn(acesFacade, 'findEnginesByMakeIdAndModelId').mockReturnValue(of([]));
    });

    const initialize = () => {
        fixture.detectChanges();
        flush();
        tick(200); // wait for debounce on the yearStart/End fields
    };

    afterEach(() => componentDestroyed.next());

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('init', () => {
        it('should load an empty add section with no vehicleDetails', fakeAsync(() => {
            initialize();

            const addRemoveInit = fixture.debugElement.query(By.css('#vehicle-details-add-remove-initial'));
            const addRemove = fixture.debugElement.query(By.css('#vehicle-details-add-remove-0'));
            expect(addRemoveInit).toBeTruthy();
            expect(addRemove).toBeFalsy();
        }));

        it.each`
            editable
            ${true}
            ${false}
        `(
            'should configure the vehicle details and load the makes when editable is true: editable=$editable',
            ({ editable }) => {
                jest.spyOn(component, 'configureVehicleDetailLoading');
                component.vehicleDetails = testVehicleDetails;
                component.editable = editable;
                fixture.detectChanges();

                expect(acesFacade.findAllMakes).toHaveBeenCalled();
                if (editable) {
                    expect(component.configureVehicleDetailLoading).toHaveBeenCalledWith(0);
                } else {
                    expect(component.configureVehicleDetailLoading).not.toHaveBeenCalled();
                }
            }
        );

        it('should handle a form for vehicleDetails that has existing data', fakeAsync(() => {
            component.vehicleDetails = testVehicleDetails;
            initialize();
            expect(component.vehicleDetails).toBeTruthy();
            expect(component.vehicleDetails.at(0)).toBeTruthy();
            expect(component.vehicleDetails.at(0).get('makeId').value).toEqual(1);
        }));

        it('should wire up vehicle detail listeners', fakeAsync(() => {
            const changeDetectorSpy = jest.spyOn(component['changeDetector'], 'detectChanges');
            component.vehicleDetails = testVehicleDetails;
            const models = [
                { id: 8, description: 'M 8' },
                { id: 9, description: 'M 9' },
            ];
            const year = { yearStart: null, yearEnd: null };
            jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValueOnce(of(models));
            initialize();
            // should load the initial models
            const vehicleControl = component.vehicleDetails.at(0) as TypedFormGroup<YearMakeModelEngine>;
            expect(acesFacade.findModelsByMakeId).toHaveBeenCalledWith(vehicleControl.getControlValue('makeId'), year);
            expect(component.vehicleModelMap[0]).toEqual(models);
            expect(changeDetectorSpy).toHaveBeenCalledTimes(1); // change detection after first time loading models
            // changing the make should clear the model and load new models
            vehicleControl.setControlValue('modelId', 14);
            flush();
            tick(200);
            expect(changeDetectorSpy).toHaveBeenCalledTimes(2); // change detection after first time loading engines
            const newModels = [
                { id: 8, description: 'M 8' },
                { id: 9, description: 'M 9' },
            ];
            jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValueOnce(of(newModels));
            vehicleControl.setControlValue('makeId', 107);
            flush();
            tick(200);
            expect(vehicleControl.getControlValue('modelId')).toEqual(null);
            expect(acesFacade.findModelsByMakeId).toHaveBeenCalledWith(107, year);
            expect(component.vehicleModelMap[0]).toEqual(newModels);
            expect(changeDetectorSpy).toHaveBeenCalledTimes(3); // change detection after loading models 2nd time
        }));

        it('should throw an error if vehicleDetails is not passed', () => {
            component.vehicleDetails = null;
            expect(() => fixture.detectChanges()).toThrowError(
                'TechnicalVehicleDetailSelectionComponent requires a FormArray to set data into.'
            );
        });

        it('should not create a new form for vehicleDetails if it is empty but not editable', () => {
            component.editable = false;
            fixture.detectChanges();
            expect(component.vehicleDetails.at(0)).toBeFalsy();
        });

        describe.each`
            modelId | engineId | expectModelLoad | expectEngineLoad
            ${null} | ${null}  | ${false}        | ${false}
            ${3}    | ${null}  | ${true}         | ${false}
            ${null} | ${6}     | ${false}        | ${true}
            ${3}    | ${6}     | ${true}         | ${true}
        `('loadDataForView', ({ modelId, engineId, expectModelLoad, expectEngineLoad }) => {
            it(`should conditionally load models and engines modelId=${modelId} engineId=${engineId}`, fakeAsync(() => {
                component.editable = false;
                const control = testVehicleDetails.at(0) as TypedFormGroup<YearMakeModelEngine>;
                control.setControlValue('modelId', modelId);
                control.setControlValue('engineConfigId', engineId);
                component.vehicleDetails = testVehicleDetails;
                initialize();
                expect(acesFacade.findModelsByMakeId).toHaveBeenCalledTimes(expectModelLoad ? 1 : 0);
                expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenCalledTimes(expectEngineLoad ? 1 : 0);
            }));
        });

        describe('configureFilter', () => {
            beforeEach(() => {
                // building an array of 7 vehicles for the component
                const vehicles = [];
                for (let i = 0; i < 7; i++) {
                    const vehicle = {
                        id: i,
                        yearStart: 2020,
                        yearEnd: 2020,
                        makeId: 10 * (i % 2), // 0 or 10
                        modelId: 10 * (i % 2) + (i % 3), // 0, 1, 2 for make 0 or 10, 11, 12 for make 10
                        engineConfigId: null,
                        attributes: [],
                        version: 0,
                    };
                    vehicles.push(vehicle);
                }
                component.vehicleDetails = formFactory.array('YearMakeModelEngine', vehicles, componentDestroyed);
            });

            describe.each`
                filter   | expectedIndexes
                ${true}  | ${[0, 2, 4, 6]}
                ${false} | ${[0, 1, 2, 3, 4, 5, 6]}
            `('filters', ({ filter, expectedIndexes }) => {
                it(`should display details at ${expectedIndexes} when filter=${filter}`, fakeAsync(() => {
                    jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValue(of([]));
                    component.filter = filter;

                    initialize();
                    expect(component.filteredIndexes).toEqual(expectedIndexes);
                    expectedIndexes.forEach((index) => {
                        expect(findByCss(fixture, `#vehicle-make-${index}`)).not.toBeNull();
                    });
                    expect(findAllByCss(fixture, '.vehicle-make').length).toEqual(expectedIndexes.length);
                    if (filter) {
                        expect(findByCss(fixture, '#make-filter')).not.toBeNull();
                        expect(findByCss(fixture, '#model-filter')).not.toBeNull();
                    } else {
                        expect(expectedIndexes.length).toEqual(component.vehicleDetails.length);
                        expect(findByCss(fixture, '#make-filter')).toBeNull();
                        expect(findByCss(fixture, '#model-filter')).toBeNull();
                    }
                }));
            });

            it('should initialize the make and model filter options', fakeAsync(() => {
                const makes = [
                    { id: 0, description: 'Make 0' },
                    { id: 10, description: 'Make 10' },
                    { id: 20, description: 'Make 20' }, // not selected
                ];
                jest.spyOn(acesFacade, 'findAllMakes').mockReturnValue(of(makes));
                const models = [
                    { id: 0, description: 'Model 0' },
                    { id: 1, description: 'Model 1' },
                    { id: 2, description: 'Model 2' },
                    { id: 10, description: 'Model 10' },
                    { id: 11, description: 'Model 11' },
                    { id: 12, description: 'Model 12' },
                ];
                jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValue(of(models));
                component.filter = true;
                initialize();

                const makeFilter = findByCss(fixture, '#make-filter').injector.get(MockFilteredInputComponent);
                // should be defaulted to first make (first vehicle make is set to 0 in the beforeEach)
                expect(makeFilter.valueControl.value).toEqual(0);
                expect(makeFilter.options).toEqual([makes[0], makes[1]]);
                const modelFilter = findByCss(fixture, '#model-filter').injector.get(MockFilteredInputComponent);
                expect(modelFilter.options).toEqual([models[0], models[1], models[2]]);
            }));

            describe('listeners', () => {
                beforeEach(() => (component.filter = true));

                describe.each`
                    editable | detailLoadFunction
                    ${true}  | ${'configureVehicleDetailLoading'}
                    ${false} | ${'loadDataForView'}
                `('on make change', ({ editable, detailLoadFunction }) => {
                    it(`should clear the model, call ${detailLoadFunction}, update the filtered indexes, and load the new models`, fakeAsync(() => {
                        component.editable = editable;
                        const loadSpy = jest.spyOn(component, detailLoadFunction).mockImplementation();
                        const modelSpy = jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValue(of([]));
                        initialize();
                        component.modelFilter.setValue(2);
                        component.makeFilter.setValue(10);
                        flush();
                        expect(component.modelFilter.value).toBeNull();
                        expect(loadSpy).toHaveBeenCalled();
                        expect(component.filteredIndexes).toEqual([1, 3, 5]);
                        expect(modelSpy).toHaveBeenCalled();
                    }));
                });

                describe.each`
                    editable
                    ${true}
                    ${false}
                `('on model change', ({ editable }) => {
                    it(`should update the filtered indexes, and should not have to load models`, fakeAsync(() => {
                        const modelSpy = jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValue(of([]));
                        component.editable = editable;
                        initialize();
                        modelSpy.mockClear(); // reset spy to verify changing the model doesn't call it
                        component.modelFilter.setValue(2);
                        flush();
                        expect(component.filteredIndexes).toEqual([2]);
                        expect(modelSpy).not.toHaveBeenCalled();
                    }));
                });
            });
        });
    });

    describe('adding and removing YMME', () => {
        const addDetails = () => {
            component.vehicleDetails.push(
                formFactory.group('YearMakeModelEngine', new YearMakeModelEngine(), componentDestroyed)
            );
            component.vehicleDetails.push(
                formFactory.group('YearMakeModelEngine', new YearMakeModelEngine(), componentDestroyed)
            );
        };

        describe('without vehicleDetails', () => {
            let addRemoveInit: MockAddRemoveButtonComponent;

            beforeEach(fakeAsync(() => {
                jest.spyOn(component, 'addVehicleDetail');
                initialize();
                addRemoveInit = fixture.debugElement.query(By.css('#vehicle-details-add-remove-initial'))
                    .componentInstance;
            }));

            it('should not show the remove button', () => {
                expect(addRemoveInit.removeButtonDisplayed).toEqual(false);
            });

            it('should show the add button', () => {
                expect(addRemoveInit.addButtonDisabled).toEqual(false);
                expect(addRemoveInit.addButtonDisplayed).toEqual(true);
            });

            it('should trigger the addVehicleDetail method on add', () => {
                addRemoveInit.addItem.emit();
                fixture.detectChanges();

                expect(component.addVehicleDetail).toHaveBeenCalled();
            });
        });

        describe('with vehicleDetails', () => {
            beforeEach(() => (component.vehicleDetails = testVehicleDetails));

            describe.each`
                editable | index | isDisplayed | addExtraDetails
                ${true}  | ${0}  | ${true}     | ${true}
                ${true}  | ${1}  | ${true}     | ${true}
                ${true}  | ${2}  | ${true}     | ${true}
                ${false} | ${0}  | ${false}    | ${true}
                ${true}  | ${0}  | ${true}     | ${false}
            `('remove button', ({ editable, index, isDisplayed, addExtraDetails }) => {
                it(`should ${
                    isDisplayed ? '' : 'not '
                }be displayed if editable=${editable} and index=${index}`, fakeAsync(() => {
                    component.editable = editable;
                    if (addExtraDetails) {
                        addDetails();
                    }
                    initialize();

                    const addRemove = fixture.debugElement.query(By.css(`#vehicle-details-add-remove-${index}`))
                        .componentInstance;
                    expect(addRemove.removeButtonDisplayed).toEqual(isDisplayed);
                }));
            });

            describe.each`
                editable | index | isDisplayed
                ${true}  | ${0}  | ${false}
                ${true}  | ${1}  | ${false}
                ${true}  | ${2}  | ${true}
                ${false} | ${1}  | ${false}
            `('add button', ({ editable, index, isDisplayed }) => {
                it(`should ${
                    isDisplayed ? '' : 'not '
                }be displayed if editable=${editable} and index=${index}`, fakeAsync(() => {
                    component.editable = editable;
                    addDetails();
                    initialize();

                    const addRemove = fixture.debugElement.query(By.css(`#vehicle-details-add-remove-${index}`))
                        .componentInstance;
                    expect(addRemove.addButtonDisplayed).toEqual(isDisplayed);
                }));
            });

            it('should trigger the removeVehicleDetail method when clicking the remove button', fakeAsync(() => {
                jest.spyOn(component, 'removeVehicleDetail');
                addDetails();
                initialize();

                expect(component.vehicleDetails.controls.length).toEqual(3);
                expect(component.filteredIndexes).toEqual([0, 1, 2]); // all indexes initially

                const addRemove = fixture.debugElement.query(By.css(`#vehicle-details-add-remove-0`))
                    .componentInstance as MockAddRemoveButtonComponent;
                addRemove.removeItem.emit();
                fixture.detectChanges();

                expect(component.removeVehicleDetail).toHaveBeenCalledWith(0);
                expect(component.vehicleDetails.controls.length).toEqual(2);
                expect(component.vehicleDetails.dirty).toBeTruthy();
                expect(component.filteredIndexes).toEqual([0, 1]); // 0 gets removed, then 1 & 2 got decremented
            }));

            it('should trigger the addVehicleDetail method when clicking the add button', fakeAsync(() => {
                jest.spyOn(component, 'addVehicleDetail');
                initialize();

                expect(component.vehicleDetails.controls.length).toEqual(1);
                expect(component.filteredIndexes.length).toEqual(1);

                const addRemove = fixture.debugElement.query(By.css(`#vehicle-details-add-remove-0`))
                    .componentInstance as MockAddRemoveButtonComponent;
                addRemove.addItem.emit();
                fixture.detectChanges();
                flush();
                tick(200); // adding does an initial configureVehicleDetailLoading call

                expect(component.addVehicleDetail).toHaveBeenCalled();
                expect(component.vehicleDetails.controls.length).toEqual(2);
                expect(component.filteredIndexes.length).toEqual(2);
            }));
        });
    });

    describe('entering YMME data', () => {
        const testYearStart = 1999;
        const testYearEnd = 2000;
        const testMakeId = 1;
        const testModelId = 2;

        beforeEach(
            () =>
                (component.vehicleDetails = formFactory.array(
                    'YearMakeModelEngine',
                    [new YearMakeModelEngine()],
                    componentDestroyed
                ))
        );

        it('should load models after the make has been selected', fakeAsync(() => {
            const testModels = [{ id: 4, description: 'Model 4' }];
            jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValueOnce(of(testModels));
            initialize();

            expect(acesFacade.findModelsByMakeId).not.toHaveBeenCalled();
            expect(component.vehicleModelMap[0]).toBeFalsy();

            component.vehicleDetails.controls[0].get('makeId').setValue(1);
            fixture.detectChanges();
            tick(200); // wait for debounce on the yearStart/End fields
            flush();

            expect(acesFacade.findModelsByMakeId).toHaveBeenCalledWith(1, { yearStart: null, yearEnd: null });
            expect(component.vehicleModelMap[0]).toEqual(testModels);
        }));

        it('should load the engine configs after the the make and model has been selected', fakeAsync(() => {
            const testEngines = [{ id: 45, description: 'Engine 45' }];
            jest.spyOn(acesFacade, 'findEnginesByMakeIdAndModelId').mockReturnValueOnce(of(testEngines));
            initialize();

            expect(acesFacade.findEnginesByMakeIdAndModelId).not.toHaveBeenCalled();
            expect(component.vehicleEngineConfigMap[0]).toBeFalsy();

            // should not load with only yearStart and yearEnd
            component.vehicleDetails.controls[0].get('yearStart').setValue(testYearStart);
            component.vehicleDetails.controls[0].get('yearEnd').setValue(testYearEnd);
            fixture.detectChanges();
            tick(200); // wait for debounce on the yearStart/End fields
            expect(acesFacade.findEnginesByMakeIdAndModelId).not.toHaveBeenCalled();
            expect(component.vehicleEngineConfigMap[0]).toBeFalsy();

            // should not load with only yearStart, yearEnd and makeId
            component.vehicleDetails.controls[0].get('makeId').setValue(1);
            fixture.detectChanges();
            expect(acesFacade.findEnginesByMakeIdAndModelId).not.toHaveBeenCalled();
            expect(component.vehicleEngineConfigMap[0]).toBeFalsy();

            // should load with yearStart, yearEnd, makeId and modelId
            component.vehicleDetails.controls[0].get('modelId').setValue(2);
            fixture.detectChanges();
            expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenCalledWith(testMakeId, testModelId, {
                yearStart: testYearStart,
                yearEnd: testYearEnd,
            });
            expect(component.vehicleEngineConfigMap[0]).toEqual(testEngines);
        }));

        describe.each`
            field          | value   | isReloadingModels | isReloadingEngines
            ${'yearStart'} | ${2000} | ${true}           | ${true}
            ${'yearStart'} | ${1999} | ${false}          | ${false}
            ${'yearStart'} | ${null} | ${false}          | ${false}
            ${'yearEnd'}   | ${2020} | ${true}           | ${true}
            ${'yearEnd'}   | ${2000} | ${false}          | ${false}
            ${'yearEnd'}   | ${null} | ${false}          | ${false}
            ${'makeId'}    | ${5}    | ${true}           | ${false}
            ${'makeId'}    | ${1}    | ${false}          | ${false}
            ${'makeId'}    | ${null} | ${false}          | ${false}
            ${'modelId'}   | ${6}    | ${false}          | ${true}
            ${'modelId'}   | ${2}    | ${false}          | ${false}
            ${'modelId'}   | ${null} | ${false}          | ${false}
        `('reloading aces dropdowns', ({ field, value, isReloadingModels, isReloadingEngines }) => {
            it(`should ${isReloadingModels ? 'reload' : 'not reload'} the models and ${
                isReloadingEngines ? 'reload' : 'not reload'
            } engine configs after updating the $field`, fakeAsync(() => {
                jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValueOnce(EMPTY);
                jest.spyOn(acesFacade, 'findEnginesByMakeIdAndModelId').mockReturnValueOnce(EMPTY);
                component.vehicleDetails = testVehicleDetails;
                component.vehicleDetails.at(0).get('yearStart').setValue(testYearStart);
                component.vehicleDetails.at(0).get('yearEnd').setValue(testYearEnd);
                component.vehicleDetails.at(0).get('makeId').setValue(1);
                component.vehicleDetails.at(0).get('modelId').setValue(2);
                initialize();

                expect(acesFacade.findModelsByMakeId).toHaveBeenCalledWith(1, {
                    yearStart: testYearStart,
                    yearEnd: testYearEnd,
                });
                expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenCalledWith(testMakeId, testModelId, {
                    yearStart: testYearStart,
                    yearEnd: testYearEnd,
                });

                component.vehicleDetails.at(0).get(field).setValue(value);
                fixture.detectChanges();
                tick(200); // wait for debounce on the yearStart/End fields

                const vehicleDetail = component.vehicleDetails.at(0).value;
                if (isReloadingModels) {
                    expect(acesFacade.findModelsByMakeId).toHaveBeenLastCalledWith(vehicleDetail.makeId, {
                        yearStart: vehicleDetail.yearStart,
                        yearEnd: vehicleDetail.yearEnd,
                    });
                } else {
                    expect(acesFacade.findModelsByMakeId).not.toHaveBeenNthCalledWith(2);
                }
                if (isReloadingEngines) {
                    expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenLastCalledWith(
                        vehicleDetail.makeId,
                        vehicleDetail.modelId,
                        {
                            yearStart: vehicleDetail.yearStart,
                            yearEnd: vehicleDetail.yearEnd,
                        }
                    );
                } else {
                    expect(acesFacade.findEnginesByMakeIdAndModelId).not.toHaveBeenNthCalledWith(2);
                }
            }));
        });

        it('should pass the latest makeId to the findEnginesByMakeIdAndModelId method', fakeAsync(() => {
            jest.spyOn(acesFacade, 'findEnginesByMakeIdAndModelId').mockReturnValueOnce(EMPTY);
            component.vehicleDetails = testVehicleDetails;
            component.vehicleDetails.at(0).get('yearStart').setValue(testYearStart);
            component.vehicleDetails.at(0).get('yearEnd').setValue(testYearEnd);
            component.vehicleDetails.at(0).get('makeId').setValue(testMakeId);
            component.vehicleDetails.at(0).get('modelId').setValue(testModelId);
            initialize();

            expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenCalledWith(testMakeId, testModelId, {
                yearStart: testYearStart,
                yearEnd: testYearEnd,
            });

            const updatedMakeId = 3;
            const updatedModelId = 6;
            component.vehicleDetails.at(0).get('makeId').setValue(updatedMakeId);
            fixture.detectChanges();
            tick(200); // wait for debounce on the yearStart/End fields

            expect(acesFacade.findEnginesByMakeIdAndModelId).not.toHaveBeenCalledTimes(2);

            component.vehicleDetails.at(0).get('modelId').setValue(updatedModelId);
            fixture.detectChanges();

            expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenCalledWith(updatedMakeId, updatedModelId, {
                yearStart: testYearStart,
                yearEnd: testYearEnd,
            });
        }));

        describe.each`
            editable | makeId  | isEditable
            ${true}  | ${1}    | ${true}
            ${true}  | ${null} | ${false}
            ${false} | ${1}    | ${false}
            ${false} | ${null} | ${false}
        `('model field', ({ editable, makeId, isEditable }) => {
            it(`should ${
                isEditable ? '' : 'not '
            }be enabled if editable=${editable} and makeId=${makeId}`, fakeAsync(() => {
                component.editable = editable;
                initialize();

                component.vehicleDetails.controls[0].get('makeId').setValue(makeId);
                fixture.detectChanges();
                const model = fixture.debugElement.query(By.css(`#vehicle-model-0`))
                    .componentInstance as MockFilteredInputComponent;
                expect(model.editable).toEqual(isEditable);
            }));
        });

        describe.each`
            editable | makeId  | modelId | isEditable
            ${true}  | ${1}    | ${2}    | ${true}
            ${true}  | ${null} | ${2}    | ${false}
            ${true}  | ${1}    | ${null} | ${false}
            ${true}  | ${null} | ${null} | ${false}
        `('engine config field', ({ editable, makeId, modelId, isEditable }) => {
            it(`should ${
                isEditable ? '' : 'not '
            }be enabled if editable=${editable}, makeId=${makeId}, and modelId=${modelId}`, fakeAsync(() => {
                component.editable = editable;
                initialize();

                component.vehicleDetails.controls[0].get('makeId').setValue(makeId);
                component.vehicleDetails.controls[0].get('modelId').setValue(modelId);
                fixture.detectChanges();
                const engineConfig = fixture.debugElement.query(By.css(`#vehicle-engine-config-0`))
                    .componentInstance as MockFilteredInputComponent;
                expect(engineConfig.editable).toEqual(isEditable);
            }));
        });

        it('should not load models until the yearStart and yearEnd are valid', fakeAsync(() => {
            const makeId = testVehicleDetails.at(0).get('makeId').value;
            jest.spyOn(acesFacade, 'findModelsByMakeId').mockReturnValueOnce(EMPTY);
            component.vehicleDetails = testVehicleDetails;
            initialize();

            // init should trigger a call
            expect(acesFacade.findModelsByMakeId).toHaveBeenCalledWith(makeId, {
                yearStart: null,
                yearEnd: null,
            }); // init should trigger a call

            component.vehicleDetails.at(0).get('yearStart').setValue(2022);
            component.vehicleDetails.at(0).get('yearEnd').setValue(2010);
            fixture.detectChanges();
            tick(200); // wait for debounce on the yearStart/End fields

            // should not have been called twice with invalid years
            expect(component.vehicleDetails.valid).toEqual(false);
            expect(acesFacade.findModelsByMakeId).not.toHaveBeenCalledWith(makeId, {
                yearStart: 2022,
                yearEnd: 2010,
            });

            component.vehicleDetails.at(0).get('yearStart').setValue(2000);
            component.vehicleDetails.at(0).get('yearEnd').setValue(2010);
            fixture.detectChanges();
            tick(200); // wait for debounce on the yearStart/End fields

            expect(component.vehicleDetails.valid).toEqual(true);
            expect(acesFacade.findModelsByMakeId).toHaveBeenCalledWith(makeId, {
                yearStart: 2000,
                yearEnd: 2010,
            });
        }));

        it('should not load engine configs until the yearStart and yearEnd are valid', fakeAsync(() => {
            const makeId = testVehicleDetails.at(0).get('makeId').value;
            const modelId = 2;
            jest.spyOn(acesFacade, 'findEnginesByMakeIdAndModelId').mockReturnValueOnce(EMPTY);
            component.vehicleDetails = testVehicleDetails;
            component.vehicleDetails.at(0).get('modelId').setValue(modelId);
            initialize();

            // init should trigger a call
            expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenCalledWith(makeId, modelId, {
                yearStart: null,
                yearEnd: null,
            });

            component.vehicleDetails.at(0).get('yearStart').setValue(2022);
            component.vehicleDetails.at(0).get('yearEnd').setValue(2010);
            fixture.detectChanges();
            tick(200); // wait for debounce on the yearStart/End fields

            // should not have been called twice with invalid years
            expect(component.vehicleDetails.valid).toEqual(false);
            expect(acesFacade.findEnginesByMakeIdAndModelId).not.toHaveBeenCalledWith(makeId, modelId, {
                yearStart: 2022,
                yearEnd: 2010,
            });

            component.vehicleDetails.at(0).get('yearStart').setValue(2000);
            component.vehicleDetails.at(0).get('yearEnd').setValue(2010);
            fixture.detectChanges();
            tick(200); // wait for debounce on the yearStart/End fields

            expect(component.vehicleDetails.valid).toEqual(true);
            expect(acesFacade.findEnginesByMakeIdAndModelId).toHaveBeenCalledWith(makeId, modelId, {
                yearStart: 2000,
                yearEnd: 2010,
            });
        }));
    });

    describe.each`
        editable
        ${true}
        ${false}
    `('attributes', ({ editable }) => {
        it(`should be editable if the vehicleDetial is editable: ${editable}`, fakeAsync(() => {
            component.vehicleDetails = testVehicleDetails;
            component.editable = editable;
            initialize();
            const attributes = fixture.debugElement.query(By.css('#vehicle-attributes-0')).componentInstance;
            expect(attributes.vehicleDetail).toEqual(testVehicleDetails.controls[0]);
            expect(attributes.editable).toEqual(editable);
        }));
    });
});
