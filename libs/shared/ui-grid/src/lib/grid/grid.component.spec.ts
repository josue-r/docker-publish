import { SelectionModel } from '@angular/cdk/collections';
import { Component, DebugElement, EventEmitter, Input, Output, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Column, dateColumn, integerColumn, stringColumn } from '@vioc-angular/shared/util-column';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { TypedFormGroup } from '@vioc-angular/shared/util-form';
import { ArrowKeyEvent } from '../arrow-key-event';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;
    const testData: { id: number; name: string; date: string }[] = [
        { id: 1, name: 'test', date: '2020-03-04' },
        { id: 2, name: 'test2', date: '2020-01-01' },
        { id: 3, name: 'test3', date: '2020-12-25' },
    ];
    // Component vars
    let columns: Column[];
    let displayedColumns: string[];
    let selection: SelectionModel<any>;
    let sort: QuerySort;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatCheckboxModule, MatSortModule, MatTableModule, NoopAnimationsModule, ReactiveFormsModule],
            declarations: [GridComponent, MockGridCellComponent],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        // Reset vars
        columns = [integerColumn, stringColumn, dateColumn];
        displayedColumns = [integerColumn.name, stringColumn.name];
        selection = new SelectionModel<any>(true);
        sort = new QuerySort(integerColumn);
    });

    const buildForm = (data: any[]): FormGroup => {
        const fb = TestBed.inject(FormBuilder);
        const dataArray = fb.array(data.map((td) => new TypedFormGroup<any>(fb.group(td))));
        return fb.group({
            data: dataArray,
        });
    };
    const initializeComponent = (
        options: {
            form?: FormGroup;
            columns?: Column[];
            displayedColumns?: string[];
            selection?: SelectionModel<any>;
            sort?: QuerySort;
        } = {}
    ): void => {
        options = { columns, displayedColumns, selection, sort, ...options };
        Object.keys(options).forEach((o) => (component[o] = options[o]));
        if (!component.form) {
            // Note: setting the form last will ensure that the selection is always cleared on init
            component.form = buildForm(testData);
        }
        fixture.detectChanges();
    };
    const invalidateRow = (rowIndex: number): void => {
        const nameControl = component.dataFormArray.controls[rowIndex].get('name');
        nameControl.setValidators(() => ({ valid: false }));
        nameControl.patchValue('bad name');
        nameControl.updateValueAndValidity({ onlySelf: false });
        flush(); // updateValueAndValidity seems to require async work to affect component states
        fixture.detectChanges();
    };
    const findByCss = (css: string): DebugElement => fixture.debugElement.query(By.css(css));

    it('should create', () => {
        initializeComponent();
        expect(component).toBeTruthy();
    });

    describe('input change', () => {
        it('should clear selection and update data length on form change', () => {
            initializeComponent();
            expect(component.dataLength).toBe(testData.length);
            const selectionClearSpy = jest.spyOn(component.selection, 'clear');
            const newForm = buildForm(testData.concat({ id: 99, name: 'late addition', date: '2020-03-05' }));
            component.form = newForm;
            expect(component.form).toEqual(newForm);
            expect(component.dataLength).toEqual(testData.length + 1);
            expect(selectionClearSpy).toHaveBeenCalled();
        });

        it('should add a "select" column when the displayed columns change', () => {
            initializeComponent();
            expect(component.displayedColumnsWithSelect).toEqual(['Select', integerColumn.name, stringColumn.name]);
            component.displayedColumns = [integerColumn.name, stringColumn.name, dateColumn.name];
            expect(component.displayedColumnsWithSelect).toEqual([
                'Select',
                integerColumn.name,
                stringColumn.name,
                dateColumn.name,
            ]);
        });
    });

    describe('sorting', () => {
        it('should emit sort information when the table is sorted', () => {
            initializeComponent();
            const sortSpy = jest.spyOn(component.sortChange, 'emit');
            const direction = 'desc';
            findByCss('mat-table').triggerEventHandler('matSortChange', {
                active: stringColumn.name,
                direction,
            } as Sort);
            fixture.detectChanges();
            expect(sortSpy).toHaveBeenCalledWith(new QuerySort(stringColumn, direction));
        });
    });

    it('should build grid-cells out of the provided form data', () => {
        initializeComponent();
        expect(component.gridCellArray[0][0].column).toEqual(integerColumn);
        expect(component.gridCellArray[0][0].row.value).toEqual(testData[0]);
        expect(component.gridCellArray[0][1].column).toEqual(stringColumn);
        expect(component.gridCellArray[0][1].row.value).toEqual(testData[0]);
        // 3rd column shouldn't render because it is not in displayed column list
        expect(component.gridCellArray[0][2]).toBeUndefined();

        expect(component.gridCellArray[1][0].column).toEqual(integerColumn);
        expect(component.gridCellArray[1][0].row.value).toEqual(testData[1]);
        expect(component.gridCellArray[1][1].column).toEqual(stringColumn);
        expect(component.gridCellArray[1][1].row.value).toEqual(testData[1]);
        // 3rd column shouldn't render because it is not in displayed column list
        expect(component.gridCellArray[1][2]).toBeUndefined();

        expect(component.gridCellArray[2][0].column).toEqual(integerColumn);
        expect(component.gridCellArray[2][0].row.value).toEqual(testData[2]);
        expect(component.gridCellArray[2][1].column).toEqual(stringColumn);
        expect(component.gridCellArray[2][1].row.value).toEqual(testData[2]);
        // 3rd column shouldn't render because it is not in displayed column list
        expect(component.gridCellArray[2][2]).toBeUndefined();
    });

    it('should detect changes when a grid cell updates validity', () => {
        initializeComponent();
        const changeDetectionSpy = jest.spyOn(component['_cdr'], 'detectChanges');

        const gridCell = fixture.debugElement.query(By.directive(MockGridCellComponent))
            .componentInstance as MockGridCellComponent;
        gridCell.updateValidity.emit();

        expect(changeDetectionSpy).toHaveBeenCalled();
    });

    describe('row selection', () => {
        beforeEach(() => initializeComponent());
        const getRowSelect = (rowIndex: number): DebugElement => findByCss(`#row-select-${rowIndex}`);
        const getMasterSelect = (): DebugElement => findByCss('#master-select');
        const asMatCheckbox = (checkbox: DebugElement): MatCheckbox =>
            checkbox.injector.get<MatCheckbox>(MatCheckbox as Type<MatCheckbox>);
        const toggleCheckbox = (checkbox: DebugElement): void => checkbox.triggerEventHandler('change', {});
        it('should not be able to select an invalid row', fakeAsync(() => {
            invalidateRow(0);
            expect(asMatCheckbox(getRowSelect(0)).disabled).toBeTruthy();
        }));
        it('should be able to select a valid row', () => {
            expect(component.selection.isEmpty()).toBeTruthy();
            const rowSelect = getRowSelect(0);
            expect(asMatCheckbox(rowSelect).disabled).toBeFalsy();
            toggleCheckbox(rowSelect);
            expect(component.selection.isSelected(0)).toBeTruthy();
        });
        describe('header checkbox', () => {
            const rowIndexes = [0, 1, 2];
            it('false state: should select each row if none are selected', () => {
                toggleCheckbox(getMasterSelect());
                expect(component.selection.selected).toEqual(rowIndexes);
            });
            it('indeterminate state: should select all unselected rows if some are selected', () => {
                toggleCheckbox(getRowSelect(0));
                fixture.detectChanges();
                const masterSelect = getMasterSelect();
                expect(asMatCheckbox(masterSelect).indeterminate).toBeTruthy();
                expect(component.selection.selected).toEqual([0]);
                toggleCheckbox(masterSelect);
                expect(component.selection.selected).toEqual(rowIndexes);
            });
            it('true state: should deselect each row when all are selected', () => {
                rowIndexes.forEach((r) => toggleCheckbox(getRowSelect(r)));
                fixture.detectChanges();
                const masterSelect = getMasterSelect();
                expect(asMatCheckbox(masterSelect).checked).toBeTruthy();
                expect(component.selection.selected).toEqual(rowIndexes);
                toggleCheckbox(masterSelect);
                expect(component.selection.selected).toEqual([]);
            });
            it('should be disabled if the form is invalid', fakeAsync(() => {
                invalidateRow(0);
                expect(asMatCheckbox(getMasterSelect()).disabled).toBeTruthy();
            }));
        });
        it('should trigger change detection on selection change', () => {
            expect(component.selection.isEmpty()).toBeTruthy();
            const changeDetectionSpy = jest.spyOn(component['_cdr'], 'detectChanges');

            component.selection.select(0);

            expect(changeDetectionSpy).toHaveBeenCalled();
        });
    });

    describe('arrow key navigation', () => {
        beforeEach(() => {
            // Displaying 3 columns for the following tests
            initializeComponent({ displayedColumns: [integerColumn.name, stringColumn.name, dateColumn.name] });
        });
        const verifyArrowPressed = (spy: jest.SpyInstance, event: ArrowKeyEvent) => {
            component.arrowPressed(event);
            expect(spy).toHaveBeenCalled();
        };
        it('should call arrowPressed on gridCell arrowPressed output', () => {
            const arrowPressedSpy = jest.spyOn(component, 'arrowPressed');
            const event: ArrowKeyEvent = { columnIndex: 0, rowIndex: 0, direction: 'UP' };
            fixture.detectChanges();
            component.gridCellArray[0][0].arrowPressed.emit(event);
            expect(arrowPressedSpy).toHaveBeenCalledWith(event);
        });
        it('should move up on arrow up', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 1, direction: 'UP' });
        });
        it('should move to last row if arrow up on top row', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[2][0], 'select');
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 0, direction: 'UP' });
        });
        it('should skip disabled cells on arrow up', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');
            component.gridCellArray[1][0].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 2, direction: 'UP' });
        });
        it('should move to last row if top row is disabled on arrow up', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[2][0], 'select');
            component.gridCellArray[0][0].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 1, direction: 'UP' });
        });
        it('should move down on arrow down', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[1][0], 'select');
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 0, direction: 'DOWN' });
        });
        it('should move to first row if arrow down on bottom row', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 2, direction: 'DOWN' });
        });
        it('should skip disabled cells on arrow down', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[2][0], 'select');
            component.gridCellArray[1][0].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 0, direction: 'DOWN' });
        });
        it('should move to first row if last row is disabled on arrow down', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');
            component.gridCellArray[2][0].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 1, direction: 'DOWN' });
        });
        it('should move left on arrow left', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');

            verifyArrowPressed(gridCellSpy, { columnIndex: 1, rowIndex: 0, direction: 'LEFT' });
        });
        it('should move to last column if arrow left on first column', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][2], 'select');
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 0, direction: 'LEFT' });
        });
        it('should skip disabled cells on arrow left', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');
            component.gridCellArray[0][1].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 2, rowIndex: 0, direction: 'LEFT' });
        });
        it('should move to last column if first column is disabled on arrow left', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][2], 'select');
            component.gridCellArray[0][0].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 1, rowIndex: 0, direction: 'LEFT' });
        });
        it('should move right on arrow right', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][1], 'select');
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 0, direction: 'RIGHT' });
        });
        it('should move to first column if arrow right on last column', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');
            verifyArrowPressed(gridCellSpy, { columnIndex: 2, rowIndex: 0, direction: 'RIGHT' });
        });
        it('should skip disabled cells on arrow right', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][2], 'select');
            component.gridCellArray[0][1].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 0, rowIndex: 0, direction: 'RIGHT' });
        });
        it('should move to first column if last column is disabled on arrow right', () => {
            const gridCellSpy = jest.spyOn(component.gridCellArray[0][0], 'select');
            component.gridCellArray[0][2].editable = false;
            verifyArrowPressed(gridCellSpy, { columnIndex: 1, rowIndex: 0, direction: 'RIGHT' });
        });
    });

    describe('refreshSortValues', () => {
        it('should update the sort component with the current values', () => {
            initializeComponent();
            const sortColumn = stringColumn;
            const sortDirection = 'desc';
            component.sort = new QuerySort(sortColumn, sortDirection);
            component.refreshSortValues();
            expect(component.gridSort.active).toEqual(sortColumn.name);
            expect(component.gridSort.direction).toEqual(sortDirection);
        });
    });

    @Component({
        selector: 'vioc-angular-grid-cell',
        template: '',
    })
    class MockGridCellComponent {
        editable = true;
        @Input() row;
        @Input() column;
        @Input() rowIndex;
        @Input() columnIndex;
        @Output() arrowPressed = new EventEmitter<ArrowKeyEvent>();
        @Output() updateValidity = new EventEmitter();
        select() {}
    }
});
