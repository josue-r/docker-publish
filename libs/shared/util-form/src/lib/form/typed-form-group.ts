import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isEmptyInputValue } from '@vioc-angular/shared/common-functionality';
import { combineLatest, concat, Observable, of, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, skip, startWith, takeUntil } from 'rxjs/operators';
import { UpdateOptions } from './update-options';

/**
 * Extends FormGroup with type safe methods.  This assumes that a form group will be backed by a model.
 * See this link for how the type safety works: https://blog.mariusschulz.com/2017/01/06/typescript-2-1-keyof-and-lookup-types.
 *
 * If for some reason the form types don't match what is in the model, the standard FormGroup methods can still be used.
 */
export class TypedFormGroup<T> extends FormGroup {
    /**
     * Keep track of group fields to prevent multiple groupings.
     */
    private readonly _groupedFields = [];
    /**
     * Tracks whether or not each field in the named fieldGroup has a value
     */
    private readonly _fieldGroupsValueState: {
        [fieldGroupName: string]: { [fieldName: string]: Observable<boolean> };
    } = {};

    constructor(delegate: FormGroup, private readonly _componentDestroyed?: ReplaySubject<any>) {
        super(delegate.controls, delegate.validator, delegate.asyncValidator);
    }

    private get componentDestroyed() {
        if (!this._componentDestroyed) {
            throw new Error(
                'The "componentDestroyed" callback was not passed when creating the form group. ' +
                    'Asynchronous event handling will not be supported'
            );
        }
        return this._componentDestroyed;
    }

    /**
     * Wraps the passed formGroup to in an instance of TypedFormGroup.  If it's aready a TypedFormGroup, it's
     * just casted to one and returned.
     */
    static create<T>(formGroup: FormGroup, componentDestroyed?: ReplaySubject<any>): TypedFormGroup<T> {
        return formGroup instanceof TypedFormGroup
            ? (formGroup as TypedFormGroup<T>)
            : new TypedFormGroup<T>(formGroup, componentDestroyed);
    }
    /** Delegates to FormGroup.get with type safety on control name parameter. */
    getControl<K extends keyof T>(name: K): AbstractControl {
        return super.get(name as string);
    }
    /** Gets the typed value of the control specified by the pass name. */
    getControlValue<K extends keyof T>(name: K): T[K] {
        return this.getControl(name).value;
    }
    /** Sets the typed value of the control specified by the pass name. */
    setControlValue<K extends keyof T>(name: K, value: T[K], options?: UpdateOptions) {
        this.getControl(name).setValue(value, options);
    }
    /** Sets the value of the specified control and dirties it (setValue on its own will not dirty the form). */
    setControlValueDirtying<K extends keyof T>(name: K, value: T[K], options?: UpdateOptions) {
        const c = this.getControl(name);
        c.setValue(value, options);
        c.markAsDirty();
    }
    /** Patches the typed value of the control specified by the pass name. */
    patchControlValue<K extends keyof T>(name: K, value: T[K], options?: UpdateOptions) {
        this.getControl(name).patchValue(value, options);
    }
    /**
     * Delegates to FormGroup.get and casts result to a FormArray with type safety on control name parameter.
     * The property control name that is passed should refer to an array value in the model but this can't be enforced.
     */
    getArray(name: keyof T): FormArray {
        return super.get(name as string) as FormArray;
    }
    /**
     * Gets the value of the FormArray specified by the control name parameter.
     * The property control name that is passed should refer to an array value in the model but this can't be enforced.
     */
    getArrayValue<K extends keyof T>(name: K): T[K] {
        return this.getArray(name).value;
    }
    /**
     * Sets the value of the FormArray specified by the control name parameter.
     * The property control name that is passed should refer to an array value in the model but this can't be enforced.
     */
    setArrayValue<K extends keyof T>(name: K, value: T[K], options?: UpdateOptions) {
        return this.getArray(name).setValue(value as any, options);
    }
    /**
     * Gets the value of the FormArray specified by the control name parameter.
     * The property control name that is passed should refer to an array value in the model but this can't be enforced.
     */
    patchArrayValue<K extends keyof T>(name: K, value: T[K], options?: UpdateOptions) {
        return this.getArray(name).patchValue(value as any, options);
    }

    /**
     * Merge the passed validators with the whatever current validator is for the control specificed by the name parameter.
     *
     * This is different from `setValidators` in that `setValidators` replaces the current validators with the passed list where this
     * adds to the end of the validator list.
     *
     * @param controlName
     * @param validators
     */
    addFormControlValidators<K extends keyof T>(controlName: K, ...validators: ValidatorFn[]): this {
        const control = this.getControl(controlName);
        if (control.validator) {
            control.setValidators([control.validator, ...validators]);
        } else {
            control.setValidators(validators);
        }
        return this;
    }

    /** If the value changes on any of the passed fields, the other fields need to be revalidated */
    public addFormValidationGroup<K extends keyof T>(...fieldsToGroup: K[]): this {
        fieldsToGroup = [...fieldsToGroup].sort();
        if (fieldsToGroup.length <= 1) {
            throw new Error(`More than one field must be passed to group: ${this}  fields:${fieldsToGroup}`);
        }
        fieldsToGroup.sort();
        if (this._groupedFields.includes(fieldsToGroup)) {
            throw new Error(
                `Fields are already grouped: ${fieldsToGroup}. Methods such as addRequiredFieldGrouping will ` +
                    'do this grouping automatically.'
            );
        }
        this._groupedFields.push(fieldsToGroup);

        fieldsToGroup.forEach((field) => {
            this.getControl(field)
                .valueChanges.pipe(
                    // distinct to prevent infinite loops and for performance
                    distinctUntilChanged(),
                    takeUntil(this.componentDestroyed)
                )
                .subscribe(() => {
                    // re-trigger validation on the related fields
                    const relatedFields = fieldsToGroup.filter((f) => f !== field);
                    relatedFields.forEach((relatedField) => {
                        const relatedControl = this.getControl(relatedField);
                        relatedControl.markAsTouched();
                        relatedControl.updateValueAndValidity();
                    });
                });
        });
        return this;
    }

    /**
     * Groups validation such that if any of the passed fields are required, the others are also required.
     * Creates a validation group for the passed fields if addFormValidationGroup is true.
     *
     * For example:
     * If passed `'a','b'`
     * - a validator is added to `'b'` that makes it required if `'a'` has a value
     * - a validator is added to `'a'` that makes it required if `'b'` has a value
     *
     * The requiredFieldGroupName can be used with `isRequiredFieldGroupDisplayed(requiredFieldGroupName)`.  If not passed, one will be
     * generated based on the field names.
     */
    public addRequiredFieldGrouping<K extends keyof T>(
        fields: K[],
        requiredFieldGroupName: string = [...fields].sort().join('_'),
        options = {
            /** Automatically trigger TypedFormGroup.addFormValidationGroup for the passed fields.  There may be cases where you may want
             * to do this manually. In most cases, the default will suffice*/
            addFormValidationGroup: true,
        }
    ): this {
        if (fields.length <= 1) {
            throw new Error(`More than one field must be passed to require: ${this}  fields:${fields}`);
        }
        if (this._fieldGroupsValueState[requiredFieldGroupName]) {
            throw new Error(
                `Field group "${requiredFieldGroupName}" already exists in ${Object.keys(this._fieldGroupsValueState)}`
            );
        }

        // Track whether or not each field has a value
        const valueState: { [fieldName: string]: Observable<boolean> } = {};
        this._fieldGroupsValueState[requiredFieldGroupName] = valueState;

        fields.forEach((field) => {
            const otherFields = fields.filter((f) => f !== field);
            this.addFormControlValidators(field, this.requireIfAnyFieldSetValidator(otherFields));

            const control = this.getControl(field);
            const startingValue = of(control.value); // control.valueChanges does not emit the initial value, since it hasn't changed
            const futureValues = control.valueChanges;
            valueState[field as string] = concat(startingValue, futureValues) // Combine initial value with all future values
                .pipe(
                    // true if set and not false (checkboxes are false when unchecked)
                    map((value) => !isEmptyInputValue(value) && value !== false),
                    // for some reason multiple subscriptions seem to happen with the async pipe. This may be due to how angular runs
                    //  multiple passes of change detection in dev mode.  Since `isRequiredFieldGroupDisplayed` uses `combineLatest`,
                    //  there should be no performance impact here.
                    shareReplay()
                );
        });
        if (options.addFormValidationGroup) {
            this.addFormValidationGroup(...fields);
        }
        return this;
    }

    /**
     * Emits true whenever fields values of the 'requiredFieldGroupName' (see `addRequiredFieldGrouping`) change in such a way that any of
     * the grouped fields have a value.  Emits false when they change such that they don't have a value.
     *
     * @param {string} requiredFieldGroupName
     * @returns {Observable<boolean>}
     * @memberof TypedFormGroup
     */
    isRequiredFieldGroupDisplayed(requiredFieldGroupName: string): Observable<boolean> {
        const group = this._fieldGroupsValueState[requiredFieldGroupName];
        if (!group) {
            throw new Error(
                `Field group "${requiredFieldGroupName}" is not registered.  Make sure to call "addRequiredFieldGrouping" first and specify this group name`
            );
        }
        return combineLatest(Object.values(group)) // transform [Observable<boolean>] to [status]
            .pipe(map((hasValues) => hasValues.some((f) => f === true))); // return true if any of the fields have valid
    }

    /**
     * If passed `'a','b'`, the ValidatorFn returns `{required:true}` if:
     *  `form.getControlValue('a')` has a value or `form.getControlValue('b')` has a value.
     */
    private requireIfAnyFieldSetValidator<K extends keyof T>(otherFields: K[]): ValidatorFn {
        return (control) => {
            const myValueEntered = !isEmptyInputValue(control.value);
            if (myValueEntered) {
                // If the current control has a value, make sure the others do too.
                const allValuesEntered = otherFields.every((controlName) => {
                    return !isEmptyInputValue(this.getControlValue(controlName));
                });
                return allValuesEntered ? undefined : { requiredRelated: true };
            } else {
                // No value entered for current control.  Check to see if the others have values
                const anyValueEntered = otherFields.some((controlName) => {
                    return !isEmptyInputValue(this.getControlValue(controlName));
                });
                return anyValueEntered ? { required: true } : undefined;
            }
        };
    }

    /** `form.getControl(monitorFieldName)` is cleared out, of the formControls specified by `fieldsToClear` will also be cleared out.*/
    public addClearOnClearedListener<K extends keyof T>(monitorFieldName: K, fieldsToClear: (keyof T)[]): void {
        this.getControl(monitorFieldName)
            .valueChanges.pipe(
                startWith(this.getControlValue(monitorFieldName)), // subscription starts with the current value
                distinctUntilChanged(),
                skip(1), // not clearing on the first value because it is just the `startWith`
                takeUntil(this.componentDestroyed)
            )
            .subscribe((value) => {
                if (isEmptyInputValue(value)) {
                    fieldsToClear.forEach((field) => {
                        this.patchControlValue(field, null, { emitEvent: false });
                        this.getControl(field).updateValueAndValidity();
                    });
                }
            });
    }

    /** When `form.getControl(monitorFieldName)` changes, the formControls specified by `fieldsToClear` will be cleared out. */
    public addClearOnChangeListener<K extends keyof T>(monitorFieldName: K, fieldsToClear: (keyof T)[]): void {
        this.getControl(monitorFieldName)
            .valueChanges.pipe(
                // starting with the initial control value because otherwise the first value will always be distinct
                startWith(this.getControlValue(monitorFieldName)),
                distinctUntilChanged(),
                skip(1), // not clearing on the first value because it is just the `startWith`
                takeUntil(this.componentDestroyed)
            )
            .subscribe(() =>
                fieldsToClear.forEach((field) => {
                    this.setControlValue(field, null, { emitEvent: false });
                    this.getControl(field).updateValueAndValidity();
                })
            );
    }

    /**
     * Once `form.getControl(monitorFieldName)` has a value, update the value of `form.getControl(fieldToDefault)` to `valueToSet`.
     * This is usually used along side #addClearOnClearedListener().
     */
    public addDefaultWhenSetListener<M extends keyof T, F extends keyof T>(
        monitorFieldName: M,
        fieldToDefault: F,
        valueToSet: T[F]
    ): void {
        this.getControl(monitorFieldName)
            .valueChanges.pipe(takeUntil(this.componentDestroyed))
            .subscribe((value) => {
                if (
                    !(isEmptyInputValue(value) || value === false) && // if value is set or is a checkbox that is unchecked
                    isEmptyInputValue(this.getControlValue(fieldToDefault)) // and other value is not set
                ) {
                    this.setControlValue(fieldToDefault, valueToSet);
                    this.getControl(fieldToDefault).updateValueAndValidity();
                }
            });
    }

    get invalidControls(): { [field: string]: ValidationErrors } {
        const controlsWithErrors = {};
        Object.entries(this.controls)
            .filter((entry) => !entry[1].disabled && !entry[1].valid) // check control state
            .forEach((entry) => (controlsWithErrors[entry[0]] = entry[1].errors));
        return controlsWithErrors;
    }
}
