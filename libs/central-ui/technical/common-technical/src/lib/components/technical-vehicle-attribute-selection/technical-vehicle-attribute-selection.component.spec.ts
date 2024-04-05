import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { AcesFacade } from '@vioc-angular/central-ui/technical/data-access-aces';
import { YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MockAddRemoveButtonComponent, UiAddRemoveButtonMockModule } from '@vioc-angular/shared/ui-add-remove-button';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { InfoButtonComponent, UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { EMPTY, of, ReplaySubject } from 'rxjs';
import { CommonTechnicalModuleForms } from '../../common-technical-module-forms';
import { TechnicalVehicleAttributeSelectionComponent } from './technical-vehicle-attribute-selection.component';

describe('TechnicalVehicleAttributeSelectionComponent', () => {
    let component: TechnicalVehicleAttributeSelectionComponent;
    let fixture: ComponentFixture<TechnicalVehicleAttributeSelectionComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let acesFacade: AcesFacade;
    let commonCodeFacade: CommonCodeFacade;
    let testVehicleDetail: TypedFormGroup<YearMakeModelEngine>;

    const setDefaultControlValues = () => {
        component.vehicleDetail.patchControlValue('makeId', 1);
        component.vehicleDetail.patchControlValue('modelId', 2);
        component.vehicleDetail.patchControlValue('yearStart', 1999);
        component.vehicleDetail.patchControlValue('yearEnd', 2000);
    };

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
                UiInfoButtonModule,
            ],
            declarations: [TechnicalVehicleAttributeSelectionComponent],
            providers: [
                FormFactory,
                {
                    provide: AcesFacade,
                    useValue: {
                        findAllFuelDeliverySubTypes: jest.fn(),
                        findAllFuelTypes: jest.fn(),
                        findAllTransmissionControlTypes: jest.fn(),
                        findAllTransmissionTypes: jest.fn(),
                        findAllVehicleClasses: jest.fn(),
                        findEngineDesignationsByMakeId: jest.fn(),
                        findSubModelsByMakeIdAndModelId: jest.fn(),
                    },
                },
                { provide: CommonCodeFacade, useValue: { findByType: jest.fn() } },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        CommonTechnicalModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(TechnicalVehicleAttributeSelectionComponent);
        formFactory = TestBed.inject(FormFactory);
        componentDestroyed = new ReplaySubject(1);
        testVehicleDetail = formFactory.group('YearMakeModelEngine', new YearMakeModelEngine(), componentDestroyed);
        component = fixture.componentInstance;
        acesFacade = component['acesFacade'];
        commonCodeFacade = component['commonCodeFacade'];
    });

    afterEach(() => componentDestroyed.next());

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('init', () => {
        it.each`
            editable
            ${true}
            ${false}
        `(
            'should load aces data lists and configure attribute loading when editable is true: editable=$editable',
            ({ editable }) => {
                component.editable = editable;
                jest.spyOn(commonCodeFacade, 'findByType');
                jest.spyOn(acesFacade, 'findAllFuelDeliverySubTypes');
                jest.spyOn(acesFacade, 'findAllFuelTypes');
                jest.spyOn(acesFacade, 'findAllTransmissionControlTypes');
                jest.spyOn(acesFacade, 'findAllTransmissionTypes');
                jest.spyOn(acesFacade, 'findAllVehicleClasses');
                jest.spyOn(component, 'configureVehicleAttributeLoading').mockImplementationOnce(() => {});
                jest.spyOn(component, 'loadDataForView').mockImplementationOnce(() => {});
                fixture.detectChanges();

                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('ACES_ATTRIBUTE_TYPE', true);
                expect(acesFacade.findAllFuelDeliverySubTypes).toHaveBeenCalled();
                expect(acesFacade.findAllFuelTypes).toHaveBeenCalled();
                expect(acesFacade.findAllTransmissionControlTypes).toHaveBeenCalled();
                expect(acesFacade.findAllTransmissionTypes).toHaveBeenCalled();
                expect(acesFacade.findAllVehicleClasses).toHaveBeenCalled();
                if (editable) {
                    expect(component.configureVehicleAttributeLoading).toHaveBeenCalled();
                    expect(component.loadDataForView).not.toHaveBeenCalled();
                } else {
                    expect(component.configureVehicleAttributeLoading).not.toHaveBeenCalled();
                    expect(component.loadDataForView).toHaveBeenCalled();
                }
            }
        );

        it.each`
            vehicleDetail
            ${null}
            ${testVehicleDetail}
        `(
            'should create on change configurations when vehicleDetail is provided: vehicleDetail=$vehicleDetail',
            fakeAsync(({ vehicleDetail }) => {
                jest.spyOn(acesFacade, 'findEngineDesignationsByMakeId');
                jest.spyOn(acesFacade, 'findSubModelsByMakeIdAndModelId');
                component.vehicleDetail = vehicleDetail;
                fixture.detectChanges();

                if (vehicleDetail) {
                    setDefaultControlValues();
                    fixture.detectChanges();

                    // wait for the debounce
                    tick(200);

                    expect(acesFacade.findEngineDesignationsByMakeId).toHaveBeenCalledWith(1, {
                        yearStart: 1999,
                        yearEnd: 2000,
                    });
                    expect(acesFacade.findSubModelsByMakeIdAndModelId).toHaveBeenCalledWith(1, 2, {
                        yearStart: 1999,
                        yearEnd: 2000,
                    });
                } else {
                    expect(acesFacade.findEngineDesignationsByMakeId).not.toHaveBeenCalled();
                    expect(acesFacade.findSubModelsByMakeIdAndModelId).not.toHaveBeenCalled();
                }
            })
        );

        describe.each`
            type                                         | key     | loadFn                      | expectLoad
            ${null}                                      | ${null} | ${'loadSubModels'}          | ${false}
            ${{ id: 3, code: 'SUB_MODEL' }}              | ${null} | ${'loadSubModels'}          | ${false}
            ${{ id: 3, code: 'SUB_MODEL' }}              | ${6}    | ${'loadSubModels'}          | ${true}
            ${{ id: 3, code: 'FUEL_DELIVERY_SUB_TYPE' }} | ${9}    | ${'loadSubModels'}          | ${false}
            ${null}                                      | ${null} | ${'loadEngineDesignations'} | ${false}
            ${{ id: 3, code: 'ENGINE_DESIGNATION' }}     | ${null} | ${'loadEngineDesignations'} | ${false}
            ${{ id: 3, code: 'ENGINE_DESIGNATION' }}     | ${6}    | ${'loadEngineDesignations'} | ${true}
            ${{ id: 3, code: 'FUEL_DELIVERY_SUB_TYPE' }} | ${9}    | ${'loadEngineDesignations'} | ${false}
        `('loadDataForView ($loadFn)', ({ type, key, loadFn, expectLoad }) => {
            it(`should conditionally load submodels or engine designations`, () => {
                const loadSpy = jest.spyOn(component, loadFn).mockImplementationOnce(() => {});
                component.editable = false;
                component.vehicleDetail = testVehicleDetail;
                component.vehicleDetail
                    .getArray('attributes')
                    .push(formFactory.group('Attribute', { type, key }, componentDestroyed));
                fixture.detectChanges();
                expect(loadSpy).toHaveBeenCalledTimes(expectLoad ? 1 : 0);
            });
        });
    });

    describe('adding and removing attributes', () => {
        const addAttributes = () => {
            component.vehicleDetail
                .getArray('attributes')
                .push(formFactory.group('Attribute', { type: null, key: null }, componentDestroyed));
            component.vehicleDetail
                .getArray('attributes')
                .push(formFactory.group('Attribute', { type: null, key: null }, componentDestroyed));
        };

        beforeEach(() => {
            component.vehicleDetail = testVehicleDetail;
        });

        it.each`
            editable | index
            ${true}  | ${0}
            ${true}  | ${1}
            ${false} | ${0}
            ${false} | ${1}
        `(
            'should display the remove button if editable is true,  editable=$editable, index=$index',
            ({ editable, index }) => {
                component.editable = editable;
                addAttributes();
                fixture.detectChanges();

                const addRemove = fixture.debugElement.query(By.css(`#attribute-add-remove-${index}`))
                    .componentInstance;
                expect(addRemove.removeButtonDisplayed).toEqual(editable);
            }
        );

        it.each`
            editable | index | isDisplayed
            ${true}  | ${0}  | ${false}
            ${true}  | ${1}  | ${true}
            ${false} | ${1}  | ${false}
        `(
            'should display the add button if editable is true and on the last index: editable=$editable, index=$index',
            ({ editable, index, isDisplayed }) => {
                component.editable = editable;
                addAttributes();
                fixture.detectChanges();

                const addRemove = fixture.debugElement.query(By.css(`#attribute-add-remove-${index}`))
                    .componentInstance;
                expect(addRemove.addButtonDisplayed).toEqual(isDisplayed);
            }
        );

        it('should trigger the removeAttribute method when clicking the remove button', () => {
            jest.spyOn(component, 'removeAttribute');
            addAttributes();
            fixture.detectChanges();

            expect(component.vehicleAttributes.length).toEqual(2);

            const addRemove = fixture.debugElement.query(By.css(`#attribute-add-remove-0`))
                .componentInstance as MockAddRemoveButtonComponent;
            addRemove.removeItem.emit();
            fixture.detectChanges();

            expect(component.removeAttribute).toHaveBeenCalledWith(0);
            // Verifying the new attribute was removed from the form value
            expect(component.vehicleAttributes.value.length).toEqual(1);
            expect(component.vehicleAttributes.dirty).toBeTruthy();
        });

        it('should trigger the addAttribute method when clicking the add button', () => {
            jest.spyOn(component, 'addAttribute');
            addAttributes();
            fixture.detectChanges();

            expect(component.vehicleAttributes.length).toEqual(2);

            const addRemove = fixture.debugElement.query(By.css(`#attribute-add-remove-0`))
                .componentInstance as MockAddRemoveButtonComponent;
            addRemove.addItem.emit();
            fixture.detectChanges();

            expect(component.addAttribute).toHaveBeenCalled();
            // Verifying the new attribute was added to the form value
            expect(component.vehicleAttributes.value.length).toEqual(3);
        });

        it('should not display add attribute button if editable is false', () => {
            fixture.detectChanges();
            expect(component.vehicleAttributes.length).toEqual(0);
            const emptyAddRemove = fixture.debugElement.query(By.css('#empty-attribute-add-remove')).componentInstance;

            expect(component.editable).toBeTruthy();
            expect(emptyAddRemove.addButtonDisplayed).toBeTruthy();

            component.editable = false;
            fixture.detectChanges();
            expect(emptyAddRemove.addButtonDisplayed).toBeFalsy();
        });

        it('should allow adding an attribute if one does not exist', () => {
            jest.spyOn(component, 'addAttribute');
            fixture.detectChanges();
            expect(component.vehicleAttributes.length).toEqual(0);
            const attributeAddRemove = fixture.debugElement.query(By.css(`#attribute-add-remove-0`));
            expect(attributeAddRemove).toBeFalsy();
            const emptyAddRemove = fixture.debugElement.query(By.css('#empty-attribute-add-remove'))
                .componentInstance as MockAddRemoveButtonComponent;

            expect(emptyAddRemove.addButtonDisplayed).toBeTruthy();
            expect(emptyAddRemove.removeButtonDisplayed).toBeFalsy();
            emptyAddRemove.addItem.emit();

            expect(component.addAttribute).toHaveBeenCalled();
            expect(component.vehicleAttributes.value.length).toEqual(1);
        });
    });

    describe('selecting an attribute type', () => {
        beforeEach(() => {
            component.vehicleDetail = testVehicleDetail;
            setDefaultControlValues();
            component.vehicleAttributes.controls[0] = formFactory.group(
                'Attribute',
                {
                    type: null,
                    key: null,
                },
                componentDestroyed
            );
            fixture.detectChanges();
        });

        it.each`
            editable
            ${true}
            ${false}
        `('should be enabled if editable is true: editable=$editable', ({ editable }) => {
            component.editable = editable;
            fixture.detectChanges();

            const attributeType = fixture.debugElement.query(By.css(`#attribute-type-0`))
                .componentInstance as MockFilteredInputComponent;
            expect(attributeType.editable).toEqual(editable);
        });

        it.each`
            type
            ${'ENGINE_DESIGNATION'}
            ${'SUB_MODEL'}
            ${'FUEL_DELIVERY_SUB_TYPE'}
            ${'TRANSMISSION_CONTROL_TYPE'}
            ${'TRANSMISSION_TYPE'}
            ${'VEHICLE_CLASS'}
        `('should load the $type type input', ({ type }) => {
            component.vehicleAttributes.controls[0] = formFactory.group(
                'Attribute',
                {
                    type: { ...new Described(), code: type },
                    key: null,
                },
                componentDestroyed
            );
            fixture.detectChanges();

            const attributeKey = fixture.debugElement.query(By.css(`#${type}-0`))
                .componentInstance as MockFilteredInputComponent;
            expect(attributeKey).toBeTruthy();
        });

        it('should throw an error when the attribute type is not supported', () => {
            expect(() => {
                component.vehicleAttributes.controls[0] = formFactory.group(
                    'Attribute',
                    {
                        type: { ...new Described(), code: 'UNKNOWN' },
                        key: null,
                    },
                    componentDestroyed
                );
                fixture.detectChanges();
            }).toThrowError('Unsupported aces attribute type UNKNOWN');
        });
    });

    describe('attribute of', () => {
        describe('engine designation', () => {
            beforeEach(
                waitForAsync(() => {
                    component.vehicleDetail = testVehicleDetail;
                    jest.spyOn(component, 'loadEngineDesignations');
                    jest.spyOn(acesFacade, 'findEngineDesignationsByMakeId').mockImplementation();

                    setDefaultControlValues(); // makeId:1, yearStart:1999, yearEnd:2000
                    fixture.detectChanges();
                })
            );

            describe.each`
                field          | value   | parameters                                    | isApiCall | useCase
                ${'yearStart'} | ${1990} | ${[1, { yearStart: 1990, yearEnd: 2000 }]}    | ${true}   | ${'passing a new yearStart is valid'}
                ${'yearStart'} | ${null} | ${[1, { yearStart: null, yearEnd: 2000 }]}    | ${true}   | ${'passing null as yearStart is valid'}
                ${'yearStart'} | ${2000} | ${[1, { yearStart: 2000, yearEnd: 2000 }]}    | ${true}   | ${'passing the same yearStart as yearEnd is valid'}
                ${'yearStart'} | ${2020} | ${[1, { yearStart: 2020, yearEnd: 2000 }]}    | ${false}  | ${'passing a yearStart thats after yearEnd is invalid'}
                ${'yearEnd'}   | ${2021} | ${[1, { yearStart: 1999, yearEnd: 2021 }]}    | ${true}   | ${'passing a new yearEnd is valid'}
                ${'yearEnd'}   | ${null} | ${[1, { yearStart: 1999, yearEnd: null }]}    | ${true}   | ${'passing null as yearEnd is valid'}
                ${'yearEnd'}   | ${1999} | ${[1, { yearStart: 1999, yearEnd: 1999 }]}    | ${true}   | ${'passing the same yearEnd as yearStart is valid'}
                ${'yearEnd'}   | ${1998} | ${[1, { yearStart: 1999, yearEnd: 1998 }]}    | ${false}  | ${'passing a yearEnd that is before the yearStart is invalid'}
                ${'makeId'}    | ${3}    | ${[3, { yearStart: 1999, yearEnd: 2000 }]}    | ${true}   | ${'passing a new makeId is valid'}
                ${'makeId'}    | ${null} | ${[null, { yearStart: 1999, yearEnd: 2000 }]} | ${false}  | ${'passing null as makeId is invalid'}
            `('loading engine designations', ({ field, value, parameters, isApiCall }) => {
                it(`should ${isApiCall ? 'reload' : 'not reload'} after updating ${field}`, fakeAsync(() => {
                    component.vehicleDetail.setControlValue(field, value);
                    tick(200); // wait for the yearInputFilter debounce time

                    if (isApiCall) {
                        expect(acesFacade.findEngineDesignationsByMakeId).toHaveBeenCalledWith(...parameters);
                    } else {
                        expect(acesFacade.findEngineDesignationsByMakeId).not.toHaveBeenCalledWith(...parameters);
                    }
                }));
            });

            it('should be cleared if make is cleared', fakeAsync(() => {
                component.vehicleDetail.setControlValue('makeId', null);
                flush();

                expect(component.engineDesignations$).toBe(EMPTY);
            }));
        });

        describe('sub model', () => {
            beforeEach(
                waitForAsync(() => {
                    component.vehicleDetail = testVehicleDetail;
                    jest.spyOn(component, 'loadSubModels');
                    const m = jest.spyOn(acesFacade, 'findSubModelsByMakeIdAndModelId').mockImplementation();

                    setDefaultControlValues(); // makeId:1, modelId:2, yearStart:1999, yearEnd:2000
                    fixture.detectChanges();
                })
            );

            describe.each`
                field          | value   | parameters                                          | isApiCall | useCase
                ${'yearStart'} | ${1990} | ${[1, 2, { yearStart: 1990, yearEnd: 2000 }]}       | ${true}   | ${'passing a new yearStart is valid'}
                ${'yearStart'} | ${null} | ${[1, 2, { yearStart: null, yearEnd: 2000 }]}       | ${true}   | ${'passing null as yearStart is valid'}
                ${'yearStart'} | ${2000} | ${[1, 2, { yearStart: 2000, yearEnd: 2000 }]}       | ${true}   | ${'passing the same yearStart as yearEnd is valid'}
                ${'yearStart'} | ${2020} | ${[1, 2, { yearStart: 2020, yearEnd: 2000 }]}       | ${false}  | ${'passing a yearStart thats after yearEnd is invalid'}
                ${'yearEnd'}   | ${2021} | ${[1, 2, { yearStart: 1999, yearEnd: 2021 }]}       | ${true}   | ${'passing a new yearEnd is valid'}
                ${'yearEnd'}   | ${null} | ${[1, 2, { yearStart: 1999, yearEnd: null }]}       | ${true}   | ${'passing null as yearEnd is valid'}
                ${'yearEnd'}   | ${1999} | ${[1, 2, { yearStart: 1999, yearEnd: 1999 }]}       | ${true}   | ${'passing the same yearEnd as yearStart is valid'}
                ${'yearEnd'}   | ${1998} | ${[1, 2, { yearStart: 1999, yearEnd: 1998 }]}       | ${false}  | ${'passing a yearEnd that is before the yearStart is invalid'}
                ${'makeId'}    | ${null} | ${[null, null, { yearStart: 1999, yearEnd: 2000 }]} | ${false}  | ${'passing null as makeId is invalid because it will reset the model'}
                ${'modelId'}   | ${6}    | ${[1, 6, { yearStart: 1999, yearEnd: 2000 }]}       | ${true}   | ${'passing a new modelId is valid'}
                ${'modelId'}   | ${null} | ${[1, null, { yearStart: 1999, yearEnd: 2000 }]}    | ${false}  | ${'passing null as modelId is invalid'}
            `('loading sub models', ({ field, value, parameters, isApiCall }) => {
                it(`should ${isApiCall ? 'reload' : 'not reload'} after updating ${field}`, fakeAsync(() => {
                    component.vehicleDetail.setControlValue(field, value);
                    tick(400); // wait for the yearInputFilter debounce time

                    if (isApiCall) {
                        expect(acesFacade.findSubModelsByMakeIdAndModelId).toHaveBeenCalledWith(...parameters);
                    } else {
                        expect(acesFacade.findSubModelsByMakeIdAndModelId).not.toHaveBeenCalledWith(...parameters);
                    }
                }));
            });

            it.each`
                field
                ${'makeId'}
                ${'modelId'}
            `(
                'should be cleared if $field is cleared',
                fakeAsync(({ field }) => {
                    component.vehicleDetail.setControlValue(field, null);
                    flush();

                    expect(component.subModels$).toBe(EMPTY);
                })
            );
        });
    });

    describe('selecting an attribute key', () => {
        const initWithType = (type: string) => {
            component.vehicleDetail = testVehicleDetail;
            component.vehicleAttributes.controls[0] = formFactory.group(
                'Attribute',
                {
                    type: { ...new Described(), code: type },
                    key: null,
                },
                componentDestroyed
            );
            setDefaultControlValues();
            fixture.detectChanges();
        };

        it.each`
            editable
            ${true}
            ${false}
        `('should be enabled if editable is true: editable=$editable', ({ editable }) => {
            initWithType('ENGINE_DESIGNATION');
            component.editable = editable;
            fixture.detectChanges();

            const attributeKey = fixture.debugElement.query(By.css('#ENGINE_DESIGNATION-0'))
                .componentInstance as MockFilteredInputComponent;
            expect(attributeKey.editable).toEqual(editable);
        });

        it('should display an info button with the engine designation field without make', () => {
            initWithType('ENGINE_DESIGNATION');
            component.vehicleDetail.setControlValue('makeId', null);
            fixture.detectChanges();
            const getInfoButton = () => fixture.debugElement.query(By.css('#engine-designation-info-0'));

            const infoButton = getInfoButton().componentInstance as InfoButtonComponent;
            expect(infoButton.info).toEqual('Make is required to view Engine Designations');

            component.vehicleDetail.setControlValue('makeId', 1);
            fixture.detectChanges();

            expect(getInfoButton()).toBeFalsy();
        });

        it('should display an info button with the sub model field without make and model', () => {
            initWithType('SUB_MODEL');
            component.vehicleDetail.setControlValue('makeId', null);
            component.vehicleDetail.setControlValue('modelId', null);
            fixture.detectChanges();
            const getInfoButton = () => fixture.debugElement.query(By.css('#sub-model-info-0'));

            const infoButton = getInfoButton().componentInstance as InfoButtonComponent;
            expect(infoButton.info).toEqual('Make and Model are required to view Sub Models');

            component.vehicleDetail.setControlValue('makeId', 1);
            component.vehicleDetail.setControlValue('modelId', 2);
            fixture.detectChanges();

            expect(getInfoButton()).toBeFalsy();
        });
    });
});
