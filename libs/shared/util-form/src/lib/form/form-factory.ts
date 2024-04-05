import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FormCreator } from './form-creator';
import { FormFactoryOptions } from './form-factory-options';
import { modelTypeKey } from './model-type-key';
import { TypedFormGroup } from './typed-form-group';

/**
 * Builds `TypedFormGroup`s to provide a type safety and common validations to standard forms.
 *
 * @export
 */
// This should be a per-module import to reduce chances of collisions and make modules atomic.  It will automatically work like that for
// lazily loaded modules
@Injectable()
export class FormFactory {
    private readonly providers: Map<string, FormCreator<any>> = new Map();

    constructor(private readonly _fb: FormBuilder) {}

    public register<T>(type: string, provider: FormCreator<T>): void {
        if (this.providers.has(type)) {
            throw new Error(`Duplicate type registration ${type}`);
        }
        this.providers.set(type, provider);
    }

    /**
     * Create a `TypedFormGroup` for the passed arguments.
     *
     * @param  type the model type
     * @param model the acutal model itself
     * @param  componentDestroyed a callback for handling unsubscribes
     * @param opts Any form specific options for more complex cases
     * @memberof FormFactory
     */
    public group<T>(
        type: string,
        model: T,
        componentDestroyed: ReplaySubject<any>,
        opts: FormFactoryOptions = {}
    ): TypedFormGroup<T> {
        // capture type to help debugging
        opts[modelTypeKey] = type;
        const formCreator = this.providers.get(type);
        if (!formCreator) {
            const knownTypes: string[] = [];
            this.providers.forEach((value, key) => knownTypes.push(key));
            throw new Error(`No FormCreater registered for ${type}. Registred types: [${knownTypes}]`);
        }
        const standardFormGroup = formCreator(model, componentDestroyed, opts);
        return TypedFormGroup.create<T>(standardFormGroup, componentDestroyed);
    }

    /**
     * Creates a `TypedFormGroup` from a root field `fieldName` of the `group` argument.
     *
     * @example
     * _destroyed = new ReplaySubject(1);
     * formGroup {
     *      id: 1;
     *      costAccount: { id: 10; code: 'EX', description: 'example'; version: 0 };
     * }
     *
     * formFactory.extendGroup('costAccount', formGroup, _destroyed);
     * =>
     * constAccountGroup {
     *      id: 10;
     *      code: 'EX';
     *      description: 'example';
     *      version: 0;
     * }
     *
     * ---- (with defaultValue)
     *
     * formFactory.extendGroup('costAccount', formGroup, _destroyed, new Described());
     * =>
     * constAccountGroup {
     *      id: null;
     *      code: null;
     *      description: null;
     *      version: null;
     * }
     *
     * @param fieldName root field that a new `TypedFormGroup` will be created from.
     * @param group existing `TypedFormGroup` that will have an additional `TypedFormGroup` added.
     * @param  componentDestroyed a callback for handling unsubscribes.
     * @param defaultValue optional default value to be supplied. Required if null value is possible for the `fieldName` control in order to created the formGroup.
     * @memberof FormFactory
     */
    public extendGroup<T, K extends keyof T>(
        group: TypedFormGroup<T>,
        fieldName: K,
        componentDestroyed: ReplaySubject<any>,
        defaultValue?: any
    ): TypedFormGroup<T> {
        const value = group.getControlValue(fieldName) ? group.getControlValue(fieldName) : defaultValue;
        type fieldType = typeof value;
        group.setControl(fieldName as string, new TypedFormGroup<fieldType>(this._fb.group(value), componentDestroyed));
        return group;
    }

    /**
     * Create a `FormArray` of `TypedFormGroup`s for the passed arguments.
     *
     * @param type the model type
     * @param model the acutal model itself
     * @param componentDestroyed a callback for handling unsubscribes
     * @param scope an optional argument to do different things based on scope.  For example, different behavior for GRID view.
     * @param opts Any form specific options for more complex cases
     * @memberof FormFactory
     */
    public array<T>(
        type: string,
        models: T[],
        componentDestroyed: ReplaySubject<any>,
        opts: FormFactoryOptions = {}
    ): FormArray {
        const forms = models.map((model) => this.group(type, model, componentDestroyed, opts));
        return new FormArray(forms);
    }

    /**
     * Create a `FormGroup` meant to be used in a grid. It will contain a `FormArray` containing `TypedFormGroup`s of the passed arguments.
     *
     * @param type the model type
     * @param models the data displayed in the grid
     * @param destroyed a callback for handling unsubscribes
     * @param opts Custom form options. The grid form requires at least 'changeDetector' and 'selectionModel' options.
     * @memberof FormFactory
     */
    public grid<T>(type: string, models: T[], destroyed: ReplaySubject<any>, opts: FormFactoryOptions): FormGroup {
        FormFactoryOptions.validateRequiredOptions(opts, 'changeDetector', 'selectionModel');
        const rowFormArray = this._fb.array(
            models.map((d, index) => {
                const formOptions: FormFactoryOptions = { scope: 'GRID', ...opts };
                const row = this.group(type, d, destroyed, formOptions);
                // Mark each control as touched to allow validation errors to show up on initial change
                Object.keys(row.controls).forEach((key) => {
                    row.get(key).markAsTouched();
                });
                // Setup row value change listener to manage auto selection and deselection of rows on data change
                row.valueChanges.pipe(debounceTime(200), takeUntil(destroyed)).subscribe((v) => {
                    row.valid ? opts.selectionModel.select(index) : opts.selectionModel.deselect(index);
                });
                return row;
            })
        );
        return this._fb.group({
            data: rowFormArray,
        });
    }

    /**
     * Create a `TypedFormGroup` meant to be used in a search filter. It will contain a `FormArray` containing `TypedFormGroup`s
     * of the passed in lines or of a blank one if none are provided.
     *
     * @param lines filter lines of a search filter
     * @memberof FormFactory
     */
    public searchFilter(lines: SearchLine[]): TypedFormGroup<{ lines: SearchLine[] }> {
        if (lines.length === 0) {
            // Add a blank line if empty
            lines.push(new SearchLine());
        }
        const lineForms = lines.map((line) => this.searchFilterLine(line));
        return new TypedFormGroup(this._fb.group({ lines: this._fb.array(lineForms) }));
    }

    /**
     * Create a `TypedFormGroup` of a SearchLine disabling the removable field.
     *
     * @param line an individual line of a search filter
     * @memberof FormFactory
     */
    public searchFilterLine(line: SearchLine): TypedFormGroup<SearchLine> {
        const lineForm = new TypedFormGroup<SearchLine>(
            // multi-value check is necessary for the 'value' control to initialize with an array
            line.comparator && line.comparator.multiValue
                ? this._fb.group({
                      ...line,
                      value: this._fb.control(line.value),
                  })
                : this._fb.group(line)
        );
        lineForm.get('removable').disable();
        return lineForm;
    }
}
