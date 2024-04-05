import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { AcesData, AcesFacade } from '@vioc-angular/central-ui/technical/data-access-aces';
import { YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { Described, isEmptyInputValue, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FormErrorMapping, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { distinct, distinctUntilChanged, pairwise, startWith, takeUntil, tap } from 'rxjs/operators';
import { yearInputFilter } from '../../operators/year-input-filter.operator';

@Component({
    selector: 'vioc-angular-technical-vehicle-detail-selection',
    templateUrl: './technical-vehicle-detail-selection.component.html',
    styleUrls: ['./technical-vehicle-detail-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalVehicleDetailSelectionComponent implements OnInit {
    @Input() vehicleDetails: FormArray;

    @Input() editable = true;

    /** Enables make/model filtering functionality */
    @Input() filter = false;

    vehicleMakes$: Observable<AcesData[]>;
    vehicleModelMap: Array<AcesData[]> = [];
    vehicleEngineConfigMap: Array<AcesData[]> = [];

    /** An array of vehicleDetail indexes that match the current filter values */
    filteredIndexes: number[];
    /** Controls filtering the vehicleDetail array by make */
    makeFilter = new FormControl(null);
    /** Controls filtering the vehicleDetail array by model */
    modelFilter = new FormControl(null);
    /** A dropdown option to enable filtering to vehicles where no make/model is selected */
    private readonly notSpecified = { id: -1, description: '<Not Specified>' } as AcesData;
    /** Models available to filter by, this then gets filtered down to only selected models */
    private availableModels: AcesData[] = [];

    readonly idMapper = Described.idMapper;
    readonly descriptionMapper = Described.descriptionMapper;

    /** Custome error mapping for validating `YearStart` and `YearEnd`. */
    readonly customErrorMapping: FormErrorMapping = {
        invalidYear: () => `Value should contain 4 digits`,
        invalidStartYear: () => `Year Start should be before Year End`,
    };

    private readonly _destroyed$ = new ReplaySubject(1);

    constructor(
        private readonly formFactory: FormFactory,
        private readonly acesFacade: AcesFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        if (!this.vehicleDetails) {
            throw new Error('TechnicalVehicleDetailSelectionComponent requires a FormArray to set data into.');
        }
        this.vehicleMakes$ = this.acesFacade.findAllMakes();
        this.configureFiltering();
        if (this.editable) {
            this.filteredIndexes.forEach((index) => this.configureVehicleDetailLoading(index));
        } else {
            this.loadDataForView();
        }
    }

    private configureFiltering(): void {
        if (this.filter) {
            this.filteredIndexes = [];
            // configure make filter value change listener
            combineLatest([
                this.makeFilter.valueChanges.pipe(
                    takeUntil(this._destroyed$),
                    tap(() => this.modelFilter.setValue(null)),
                    startWith(null as any)
                ),
                this.modelFilter.valueChanges.pipe(takeUntil(this._destroyed$), startWith(null as any)),
            ])
                .pipe(takeUntil(this._destroyed$), pairwise())
                .subscribe(([previousFilter, newFilter]) => this.onFilterChange(previousFilter, newFilter));
            // configure detail loading to happen as a new make is selected (distinct to not load more than once)
            this.makeFilter.valueChanges.pipe(takeUntil(this._destroyed$), distinct()).subscribe(() =>
                this.filteredIndexes.forEach((index) => {
                    if (this.editable) {
                        this.configureVehicleDetailLoading(index);
                    } else {
                        this.loadDataForView();
                    }
                })
            );
            // will default to first make
            const firstMake = (this.vehicleDetails.controls.find(
                (c: TypedFormGroup<YearMakeModelEngine>) => !isEmptyInputValue(c.getControlValue('makeId'))
            ) as TypedFormGroup<YearMakeModelEngine>)?.getControlValue('makeId');
            this.makeFilter.setValue(firstMake);
        } else {
            // not filtering, so include all indexes
            this.filteredIndexes = Array.from(this.vehicleDetails.controls.keys());
        }
    }

    /** Listener for when the make or model filter changes value. */
    private onFilterChange([previousMake, previousModel], [newMake, newModel]): void {
        this.filteredIndexes = [];
        this.vehicleDetails.controls.forEach((c: TypedFormGroup<YearMakeModelEngine>, index: number) => {
            const makeId = c.getControlValue('makeId');
            const modelId = c.getControlValue('modelId');
            const makeMatches = makeId === newMake || this.isNotSpecified(makeId, newMake);
            const modelMatches =
                isEmptyInputValue(newModel) || modelId === newModel || this.isNotSpecified(modelId, newModel);
            if (makeMatches && modelMatches) {
                this.filteredIndexes.push(index);
            }
        });
        // update available models list when the make changes
        if (previousMake !== newMake && this.modelFilterEditable) {
            this.availableModels = [];
            if (this.modelFilterEditable) {
                this.acesFacade
                    .findModelsByMakeId(newMake)
                    .pipe(takeUntil(this.makeFilter.valueChanges))
                    .subscribe((models) => (this.availableModels = models));
            }
        }
    }

    /** Determines if the given values match a not specified filter. */
    private isNotSpecified(value: number, filterValue: number): boolean {
        return isEmptyInputValue(value) && filterValue === this.notSpecified.id;
    }

    /** Populates the makeFilter options. */
    getMakeSelections(availableMakes: AcesData[]): AcesData[] {
        const makeIds = new Set<number>();
        this.vehicleDetails.controls.forEach((c: TypedFormGroup<YearMakeModelEngine>) =>
            makeIds.add(c.getControlValue('makeId'))
        );
        const selectedMakes = availableMakes.filter((make) => makeIds.has(make.id));
        return makeIds.has(null) ? [this.notSpecified].concat(selectedMakes) : selectedMakes;
    }

    /** Populates the modelFilter options. */
    getModelSelections(): AcesData[] {
        if (this.modelFilterEditable) {
            const modelIds = new Set<number>();
            this.vehicleDetails.controls.forEach((c: TypedFormGroup<YearMakeModelEngine>) => {
                if (c.getControlValue('makeId') === this.makeFilter.value) {
                    modelIds.add(c.getControlValue('modelId'));
                }
            });
            const selectedModels = this.availableModels.filter((model) => modelIds.has(model.id));
            return modelIds.has(null) ? [this.notSpecified].concat(selectedModels) : selectedModels;
        } else {
            return [];
        }
    }

    /** Conditionally load model and engine data if they are set. */
    loadDataForView(): void {
        this.filteredIndexes.forEach((index) => {
            const control = this.vehicleDetailAt(index);
            if (control.getControlValue('modelId')) {
                this.acesFacade
                    .findModelsByMakeId(control.getControlValue('makeId'), {
                        yearStart: control.getControlValue('yearStart'),
                        yearEnd: control.getControlValue('yearEnd'),
                    })
                    .subscribe((models) => {
                        this.vehicleModelMap[index] = models;
                        this.changeDetector.detectChanges(); // onPush is requiring change detection after options update
                    });
            }
            if (control.getControlValue('engineConfigId')) {
                this.acesFacade
                    .findEnginesByMakeIdAndModelId(
                        control.getControlValue('makeId'),
                        control.getControlValue('modelId'),
                        {
                            yearStart: control.getControlValue('yearStart'),
                            yearEnd: control.getControlValue('yearEnd'),
                        }
                    )
                    .subscribe((engines) => {
                        this.vehicleEngineConfigMap[index] = engines;
                        this.changeDetector.detectChanges(); // onPush is requiring change detection after options update
                    });
            }
        });
    }

    /** Adds a new `YearMakeModelEngine` to the control list of YMMEs. */
    addVehicleDetail(): void {
        this.vehicleDetails.push(
            this.formFactory.group('YearMakeModelEngine', new YearMakeModelEngine(), this._destroyed$)
        );
        const index = this.vehicleDetails.length - 1;
        this.configureVehicleDetailLoading(index);
        this.filteredIndexes.push(index); // add the new vehicle detail to the currently displayed details
    }

    /** Removes a `YearMakeModelEngine` from the control list of YMMEs at the given index. */
    removeVehicleDetail(index: number): void {
        // remove model/engine mappings
        this.vehicleModelMap.splice(index, 1);
        this.vehicleEngineConfigMap.splice(index, 1);
        // remove from form
        this.vehicleDetails.removeAt(index);
        this.vehicleDetails.markAsDirty();
        // remove from filtered indexes
        const removedIndex = this.filteredIndexes.indexOf(index);
        this.filteredIndexes.splice(removedIndex, 1);
        // decrement each filtered index after the removed index
        for (let i = removedIndex; i < this.filteredIndexes.length; i++) {
            this.filteredIndexes[i]--;
        }
    }

    /** Configures the Loading of `Models` and `EngineConfigs` when `YearStart`, `YearEnd`, or`MakeId` values change. */
    configureVehicleDetailLoading(index: number): void {
        const control = this.vehicleDetailAt(index);
        const makeControl = control.getControl('makeId');
        const modelControl = control.getControl('modelId');
        const yearStartControl = control.getControl('yearStart');
        const yearEndControl = control.getControl('yearEnd');

        const makePipe = makeControl.valueChanges.pipe(startWith(makeControl.value), distinctUntilChanged());
        const modelPipe = modelControl.valueChanges.pipe(startWith(modelControl.value), distinctUntilChanged());
        const yearStartPipe = yearStartControl.valueChanges.pipe(startWith(yearStartControl.value), yearInputFilter());
        const yearEndPipe = yearEndControl.valueChanges.pipe(startWith(yearEndControl.value), yearInputFilter());
        combineLatest([makePipe, yearStartPipe, yearEndPipe])
            .pipe(takeUntil(this._destroyed$))
            .subscribe(([makeId, yearStart, yearEnd]) => {
                // verifiy that the control is valid before making the API call
                if (!isNullOrUndefined(makeId) && yearStartControl.valid && yearEndControl.valid) {
                    this.acesFacade
                        .findModelsByMakeId(makeId, {
                            yearStart,
                            yearEnd,
                        })
                        .subscribe((models) => {
                            this.vehicleModelMap[index] = models;
                            this.changeDetector.detectChanges(); // onPush is requiring change detection after options update
                        });
                }
            });
        combineLatest([modelPipe, yearStartPipe, yearEndPipe])
            .pipe(takeUntil(this._destroyed$))
            .subscribe(([modelId, yearStart, yearEnd]) => {
                // verifiy that the control is valid before making the API call
                if (this.isVehicleEngineEditable(index) && yearStartControl.valid && yearEndControl.valid) {
                    this.acesFacade
                        .findEnginesByMakeIdAndModelId(makeControl.value, modelId, {
                            yearStart,
                            yearEnd,
                        })
                        .subscribe((engines) => {
                            this.vehicleEngineConfigMap[index] = engines;
                            this.changeDetector.detectChanges(); // onPush is requiring change detection after options update
                        });
                }
            });
    }

    vehicleDetailAt(index: number): TypedFormGroup<YearMakeModelEngine> {
        return this.vehicleDetails.at(index) as TypedFormGroup<YearMakeModelEngine>;
    }

    /** Controls whether the remove button is displayed on the `YearMakeModelEngine` input line. */
    isVehicleDetailRemoveDisplayed(): boolean {
        return this.vehicleDetails.length > 1 && this.editable;
    }

    /** Controls whether the add button is displayed on the `YearMakeModelEngine` input line. */
    isVehicleDetailAddDisplayed(index: number): boolean {
        const lastIndex = this.filteredIndexes[this.filteredIndexes.length - 1];
        return lastIndex === index && this.editable;
    }

    /** Controls whether the `Model` field is editable by checking if the `Make` field has a value. */
    isVehicleModelEditable(index: number): boolean {
        return !isNullOrUndefined(this.vehicleDetails.at(index).get('makeId').value) && this.editable;
    }

    /** Controls whether the `Engine` field is editable by checking if the `YearStart`, `YearEnd`, `Make` and `Model` fields have a value. */
    isVehicleEngineEditable(index: number): boolean {
        const control = this.vehicleDetailAt(index);
        return (
            !isNullOrUndefined(control.getControlValue('makeId')) &&
            !isNullOrUndefined(control.getControlValue('modelId')) &&
            this.editable
        );
    }

    /** Determines if the model filter is enabled */
    get modelFilterEditable(): boolean {
        return !isEmptyInputValue(this.makeFilter.value) && this.makeFilter.value !== this.notSpecified.id;
    }
}
