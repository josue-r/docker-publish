import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
// TODO: 05/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { DropdownColumnFacade } from '@vioc-angular/shared/data-access-dropdown-column';
// TODO: 05/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
    Column,
    ColumnGroup,
    Columns,
    DynamicDropdownColumn,
    instanceOfColumnGroup,
    SimpleDropdownColumn,
} from '@vioc-angular/shared/util-column';
import { ReplaySubject } from 'rxjs';

type UpdatableColumn = Column | ColumnGroup;

/**
 * This component is used to handle selecting fields for mass updating. If a nested field is required
 * a template can be passed to this form with a nested instance of this component to mass update fields
 * on a nested entity. If a nested instance is done then the nested input should be set to true on the
 * component in the template. An example may look like
 *
 *      `
 *          <vioc-angular-mass-update [updatableFieldForm]="form" [columns]="columns" [templateMap]="templateMap">
                <ng-template #nested>
                    <vioc-angular-mass-update [updatableFieldForm]="form.get('nested')"
                        [columns]="nestedColumns" [nested]="true"></vioc-angular-mass-update>
                </ng-template>
            </vioc-angular-mass-update>
 *      `
 */
@Component({
    selector: 'vioc-angular-mass-update',
    templateUrl: './mass-update.component.html',
    styleUrls: ['./mass-update.component.scss'],
    providers: [DropdownColumnFacade],
})
export class MassUpdateComponent implements OnInit, OnDestroy {
    private readonly _componentDestroyed = new ReplaySubject();

    updatableColumns: UpdatableColumn[];

    updatableFields: { columnControl: FormControl; fieldControl: AbstractControl[]; inputType: string }[];

    /**
     * The columns to be displayed in the dropdown for mass updating.
     */
    @Input() set columns(columns: Columns) {
        this._columns = columns;
        this.updatableColumns = Object.values(this._columns).map((column) => {
            if (instanceOfColumnGroup(column)) {
                return column;
            } else if ('values' in column) {
                // simple dropdown
                // remap SimpleDropdown into DynamicDropdown since it is handled the same way
                return SimpleDropdownColumn.of(column as SimpleDropdownColumn<any>).convertToDynamicDropdownColumn();
            } else if ('fetchData' in column) {
                // dynamic dropdown
                // apply defaults to DynamicDropdown
                return DynamicDropdownColumn.of(column as DynamicDropdownColumn<any>);
            } else {
                return Columns.toColumn(column);
            }
        });
        // if grouped, given order is important, otherwise sort columns alphabetically
        if (!this.grouped) {
            this.updatableColumns.sort((c1, c2) => c1.name.localeCompare(c2.name));
        }
        // reset the updatableFields on column value change
        this.configureUpdatableFields();
    }
    get columns() {
        return this._columns;
    }
    private _columns: Columns;

    /**
     * A map of the column api field path to the template that should be used for mass updating that column.
     * This will typically be used for nested entities that will require an additional mass update component
     * to be used.
     */
    @Input() templateMap: Map<string, TemplateRef<any>>;

    /**
     * The form instance to back the mass update. This form will have the apiFieldPath of all of the columns
     * as controls. The values will either be the value that field is being updated to, or null/undefined
     * if that value is not set or is being cleared. Any values being set or nulled/cleared will be marked
     * as dirty.
     */
    @Input() updatableFieldForm: FormGroup;

    /**
     * Indicates that the component is nested. Controls where the add-remove buttons are displayed.
     */
    @Input() nested = false;

    /**
     * Indicates that the fields are grouped and should all be added for update together.
     */
    @Input() grouped = false;

    // manual change detection is required to resolve an issue with value change after checked issue
    // with the forms being marked as dirty.
    constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        // initialize the updatableFields
        this.configureUpdatableFields();
    }

    ngOnDestroy(): void {
        this._componentDestroyed.next();
    }

    configureUpdatableFields(): void {
        this.updatableFields = [];
        if (this.grouped) {
            // if the fields are to be grouped, select all of the fields
            this.updatableColumns.forEach((c, i) => {
                this.addLine();
                this.updatableFields[i].columnControl.setValue(c);
                this.columnSelect(i);
            });
        } else {
            this.addLine();
        }
    }

    /**
     * Updates the selected columns. When selected, marks them as dirty and resets them when they are deselected.
     */
    columnSelect(index: number): void {
        const field = this.updatableFields[index];
        field.inputType = this.inputType(field.columnControl.value);
        if (field.fieldControl) {
            // if a previous fields was selected at the current index, reset it
            field.fieldControl.forEach((f) => f.reset());
        }
        const column = field.columnControl.value;
        if (column) {
            if (instanceOfColumnGroup(column)) {
                // mark all columns in the group as dirty
                field.fieldControl = [];
                Columns.toColumnArray(column.columns).forEach((c, i) => {
                    field.fieldControl.push(this.updatableFieldForm.get(c.apiFieldPath));
                    field.fieldControl[i].markAsDirty();
                });
            } else {
                // mark the single fields as dirty
                field.fieldControl = [this.updatableFieldForm.get(column.apiFieldPath)];
                field.fieldControl[0].markAsDirty();
            }
        }
        this.changeDetectorRef.detectChanges();
    }

    /**
     * Adds a new formControl when a field is added.
     */
    addLine(): void {
        this.updatableFields.push({ columnControl: new FormControl(), fieldControl: undefined, inputType: undefined });
    }

    /**
     * Removes the field at the provided index.
     */
    removeLine(index: number): void {
        const fields = this.updatableFields.splice(index, 1);
        fields.forEach((field) => {
            const column = field.columnControl.value;
            if (column) {
                // reset all fields from the column group
                if (instanceOfColumnGroup(column)) {
                    Columns.toColumnArray(column.columns).forEach((c) =>
                        this.updatableFieldForm.get(c.apiFieldPath).reset()
                    );
                } else {
                    // reset the form value and status when the column is removed
                    field.fieldControl.forEach((f) => f.reset());
                }
                this.changeDetectorRef.detectChanges();
            }
        });
    }

    columnComparator(c1: UpdatableColumn, c2: UpdatableColumn): boolean {
        return c1?.name === c2?.name;
    }

    /**
     * Checks if the column is selected.
     */
    isSelected(column: UpdatableColumn): boolean {
        return this.updatableFields.map((field) => field.columnControl.value).includes(column);
    }

    /**
     * Whether or not the (+) button is shown by the line.
     */
    isAddFieldButtonDisplayed(index: number): boolean {
        return (
            this.updatableFields[index].columnControl.value &&
            index === this.updatableFields.length - 1 &&
            this.updatableFields.length < this.updatableColumns.length
        );
    }

    /**
     * Returns the input type of the selected column at the given index.
     */
    private inputType(column: UpdatableColumn): string | undefined {
        if (column) {
            if (instanceOfColumnGroup(column)) {
                return 'group';
            } else if (column.isDropdown) {
                return 'single-select-dropdown';
            } else {
                const jsType = column.getTopLevelType();
                switch (jsType) {
                    case 'decimal':
                        return 'decimal';
                    case 'integer':
                        return 'integer';
                    case 'date':
                        return 'date';
                    case 'string':
                        return 'text';
                    case 'boolean':
                        return 'boolean';
                    default:
                        // if a template is supplied us it as the field input
                        if (this.templateMap && this.templateMap.get(column.apiFieldPath)) {
                            return 'template';
                        } else {
                            throw new Error(`Unsupported input type in ${JSON.stringify(column)}`);
                        }
                }
            }
        }
    }

    /**
     * Resets the selected values and the values set in the form.
     */
    reset(): void {
        this.updatableFields = [];
        this.updatableFields.push({ columnControl: new FormControl(), fieldControl: undefined, inputType: undefined });
        this.updatableFieldForm.reset();
        this.changeDetectorRef.detectChanges();
    }

    /**
     * Returns the placeholder to be used for the mass update value. Indicates to the user whether the field can be blanked
     * to set it to null or if a value is required
     */
    getPlaceholder(column: Column): string {
        return this.updatableFieldForm.get(column.apiFieldPath).getError('required')
            ? 'Please enter a value'
            : 'Leave blank to clear value';
    }
}
