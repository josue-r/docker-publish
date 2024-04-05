import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { AcesData, AcesFacade } from '@vioc-angular/central-ui/technical/data-access-aces';
import { Attribute, YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { combineLatest, EMPTY, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import { yearInputFilter } from '../../operators/year-input-filter.operator';

@Component({
    selector: 'vioc-angular-technical-vehicle-attribute-selection',
    templateUrl: './technical-vehicle-attribute-selection.component.html',
    styleUrls: ['./technical-vehicle-attribute-selection.component.scss'],
    providers: [CommonCodeFacade],
})
export class TechnicalVehicleAttributeSelectionComponent implements OnInit {
    /** `YearMakeModelEngine` formControl that will be used to validate and control the `Attributes` added by this component. */
    @Input() vehicleDetail: TypedFormGroup<YearMakeModelEngine>;

    @Input() editable = true;

    // Lists required to load values into dropdowns
    acesAttributeTypes$: Observable<Described[]>;
    engineDesignations$: Observable<AcesData[]>;
    fuelDeliverySubTypes$: Observable<AcesData[]>;
    fuelType$: Observable<AcesData[]>;
    subModels$: Observable<AcesData[]>;
    transmissionControlTypes$: Observable<AcesData[]>;
    transmissionTypes$: Observable<AcesData[]>;
    vehicleClasses$: Observable<AcesData[]>;

    readonly idMapper = Described.idMapper;
    readonly descriptionMapper = Described.descriptionMapper;
    readonly idEquals = Described.idEquals;

    private readonly _destroyed$ = new ReplaySubject(1);

    constructor(
        private readonly formFactory: FormFactory,
        private readonly acesFacade: AcesFacade,
        private readonly commonCodeFacade: CommonCodeFacade
    ) {}

    ngOnInit(): void {
        this.acesAttributeTypes$ = this.commonCodeFacade.findByType('ACES_ATTRIBUTE_TYPE', true);
        this.fuelDeliverySubTypes$ = this.acesFacade.findAllFuelDeliverySubTypes();
        this.fuelType$ = this.acesFacade.findAllFuelTypes();
        this.transmissionControlTypes$ = this.acesFacade.findAllTransmissionControlTypes();
        this.transmissionTypes$ = this.acesFacade.findAllTransmissionTypes();
        this.vehicleClasses$ = this.acesFacade.findAllVehicleClasses();
        if (this.editable) {
            this.configureVehicleAttributeLoading();
        } else {
            this.loadDataForView();
        }
    }

    /** Configures the Loading of `EngineDesignations` and `SubModels` when `YearStart`, `YearEnd`, `MakeId` or `ModelId` values change. */
    configureVehicleAttributeLoading(): void {
        if (this.vehicleDetail) {
            const makeControl = this.vehicleDetail.getControl('makeId');
            const modelControl = this.vehicleDetail.getControl('modelId');
            const yearStartControl = this.vehicleDetail.getControl('yearStart');
            const yearEndControl = this.vehicleDetail.getControl('yearEnd');
            this.loadEngineDesignations(makeControl.value, yearStartControl.value, yearEndControl.value);
            this.loadSubModels(makeControl.value, modelControl.value, yearStartControl.value, yearEndControl.value);

            // configured observable calls for engineDesignations and subModels to reduce the number of API calls on value changes
            const makePipe = makeControl.valueChanges.pipe(startWith(makeControl.value), distinctUntilChanged());
            const modelPipe = modelControl.valueChanges.pipe(startWith(modelControl.value), distinctUntilChanged());
            const yearStartPipe = yearStartControl.valueChanges.pipe(
                startWith(yearStartControl.value),
                yearInputFilter()
            );
            const yearEndPipe = yearEndControl.valueChanges.pipe(startWith(yearEndControl.value), yearInputFilter());
            combineLatest([makePipe, yearStartPipe, yearEndPipe])
                .pipe(takeUntil(this._destroyed$))
                .subscribe(([makeId, yearStart, yearEnd]) => {
                    if (yearStartControl.valid && yearEndControl.valid) {
                        this.loadEngineDesignations(makeId, yearStart, yearEnd);
                    }
                });
            combineLatest([makePipe, modelPipe, yearStartPipe, yearEndPipe])
                .pipe(takeUntil(this._destroyed$))
                .subscribe(([makeId, modelId, yearStart, yearEnd]) => {
                    if (yearStartControl.valid && yearEndControl.valid) {
                        this.loadSubModels(makeId, modelId, yearStart, yearEnd);
                    }
                });
        }
    }

    /** Conditionally load submodels or engine designations if they are selected. */
    loadDataForView(): void {
        if (
            this.vehicleAttributes.controls.some((control: TypedFormGroup<Attribute>) => {
                return control.getControlValue('type')?.code === 'SUB_MODEL' && control.getControlValue('key');
            })
        ) {
            // Load sub models so the view can see the selected key's value
            this.loadSubModels(
                this.vehicleDetail.getControlValue('makeId'),
                this.vehicleDetail.getControlValue('modelId'),
                this.vehicleDetail.getControlValue('yearStart'),
                this.vehicleDetail.getControlValue('yearEnd')
            );
        }
        if (
            this.vehicleAttributes.controls.some((control: TypedFormGroup<Attribute>) => {
                return control.getControlValue('type')?.code === 'ENGINE_DESIGNATION' && control.getControlValue('key');
            })
        ) {
            // Load engine designations so the view can see the selected key's value
            this.loadEngineDesignations(
                this.vehicleDetail.getControlValue('makeId'),
                this.vehicleDetail.getControlValue('yearStart'),
                this.vehicleDetail.getControlValue('yearEnd')
            );
        }
    }

    /** Loads the engine designation based on the make and year start/end. If the Make is null, then EMPTY is returned. */
    loadEngineDesignations(makeId: number, yearStart: number, yearEnd: number): void {
        if (!isNullOrUndefined(makeId)) {
            this.engineDesignations$ = this.acesFacade.findEngineDesignationsByMakeId(makeId, {
                yearStart,
                yearEnd,
            });
        } else {
            this.engineDesignations$ = EMPTY;
        }
    }

    /** Loads the engine designation based on the make, model and year start/end. If the Make or model is null, then EMPTY is returned. */
    loadSubModels(makeId: number, modelId: number, yearStart: number, yearEnd: number): void {
        if (!isNullOrUndefined(makeId) && !isNullOrUndefined(modelId)) {
            this.subModels$ = this.acesFacade.findSubModelsByMakeIdAndModelId(makeId, modelId, {
                yearStart,
                yearEnd,
            });
        } else {
            this.subModels$ = EMPTY;
        }
    }

    /** Adds a new `Arttribute` to the control list of `YearMakeModelEngine.attributes`. */
    addAttribute(): void {
        this.vehicleAttributes.push(this.formFactory.group('Attribute', { type: null, key: null }, this._destroyed$));
    }

    /** Removes an `Arttribute` from the control list of `YearMakeModelEngine.attributes` at the given index. */
    removeAttribute(index: number): void {
        this.vehicleAttributes.removeAt(index);
        this.vehicleAttributes.markAsDirty();
    }

    /** Loads a list of `AcesData` based on the `Attribute.type.code` at the given index. */
    loadAttributeDropdown(index: number): Observable<AcesData[]> {
        const type = this.vehicleAttributes.at(index).get('type').value.code;
        switch (type) {
            case 'FUEL_DELIVERY_SUB_TYPE':
                return this.fuelDeliverySubTypes$;
            case 'FUEL_TYPE':
                return this.fuelType$;
            case 'TRANSMISSION_CONTROL_TYPE':
                return this.transmissionControlTypes$;
            case 'TRANSMISSION_TYPE':
                return this.transmissionTypes$;
            case 'VEHICLE_CLASS':
                return this.vehicleClasses$;
            default:
                throw new Error(`Unsupported aces attribute type ${type}`);
        }
    }

    /** Controls whether the add button is displayed on the `Attribute` input line. */
    isAttributeAddDisplayed(index: number): boolean {
        return this.vehicleAttributes.length - 1 === index && this.vehicleAttributes.at(index).value && this.editable;
    }

    get isEngineDesignationHintDisplayed(): boolean {
        return isNullOrUndefined(this.vehicleDetail.getControlValue('makeId')) && this.editable;
    }

    get isSubModelHintDisplayed(): boolean {
        return (
            (isNullOrUndefined(this.vehicleDetail.getControlValue('makeId')) ||
                isNullOrUndefined(this.vehicleDetail.getControlValue('modelId'))) &&
            this.editable
        );
    }

    get vehicleAttributes(): FormArray {
        return this.vehicleDetail?.getArray('attributes');
    }
}
