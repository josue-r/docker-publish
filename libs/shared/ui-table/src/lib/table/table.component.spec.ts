import { SelectionModel } from '@angular/cdk/collections';
import { CdkTableModule } from '@angular/cdk/table';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSortHeaderHarness } from '@angular/material/sort/testing';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Column, UtilColumnModule } from '@vioc-angular/shared/util-column';
import { TableComponent } from './table.component';

describe('TableComponent', () => {
    let component: TableComponent;
    let fixture: ComponentFixture<TableComponent>;
    let loader: HarnessLoader;

    const tableData = [
        {
            code: 'P1',
            description: 'Product 1',
            active: true,
            quantity: 5.05,
            price: 10.01,
            stockDate: '2020-02-01',
            lastUpdatedDate: '2020-02-01T10:00:55.000',
            version: 0,
            notSortable: 1,
        },
        {
            code: 'P2',
            description: 'Product 2',
            active: false,
            quantity: 2.51,
            price: 12.22,
            stockDate: '2020-01-21',
            lastUpdatedDate: '2020-01-21T19:51:52.000',
            version: 11,
            notSortable: 1,
        },
    ];

    const code = Column.of({ name: 'code', apiFieldPath: 'code', type: 'string' });
    const description = Column.of({ name: 'description', apiFieldPath: 'description', type: 'string' });
    const active = Column.of({ name: 'active', apiFieldPath: 'active', type: 'boolean' });
    const quantity = Column.of({ name: 'quantity', apiFieldPath: 'quantity', type: 'decimal', decimalPlaces: 2 });
    const price = Column.of({ name: 'price', apiFieldPath: 'price', type: 'currency' });
    const stockDate = Column.of({ name: 'stockDate ', apiFieldPath: 'stockDate', type: 'date' });
    const lastUpdatedDate = Column.of({ name: 'lastUpdatedDate', apiFieldPath: 'lastUpdatedDate', type: 'dateTime' });
    const version = Column.of({ name: 'version', apiFieldPath: 'version', type: 'integer' });
    const notSortable = Column.of({
        name: 'notSortable',
        apiFieldPath: 'notSortable',
        type: 'integer',
        sortable: false,
    });

    const displayedColumns = [code.name, description.name, price.name, active.name, notSortable.name];
    const columns = [code, description, active, quantity, price, stockDate, lastUpdatedDate, version, notSortable];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                CdkTableModule,
                MatTableModule,
                MatSortModule,
                MatCheckboxModule,
                CommonFunctionalityModule,
                UtilColumnModule,
                NoopAnimationsModule,
            ],
            declarations: [TableComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TableComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        component.data = [];
        component.displayedColumns = [];
        component.selection = new SelectionModel<any>(true, []);
        component.sort = new QuerySort(code, 'desc');
        component.columns = columns;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return true for isAllSelected when data and selection have same length', () => {
        component.selection.selected.length = 1;
        component.data.length = 1;
        const result: boolean = component.isAllSelected();
        expect(result).not.toBeNull();
        expect(result).toBe(true);
    });

    it('should return false for isAllSelected when data and selection have different length', () => {
        component.selection.selected.length = 1;
        component.data.length = 2;
        const result: boolean = component.isAllSelected();
        expect(result).not.toBeNull();
        expect(result).toBe(false);
    });

    it('should clear the selection if all data options are selected when performing masterToggle', () => {
        component.selection = new SelectionModel(true, tableData, true);
        jest.spyOn(component, 'isAllSelected').mockReturnValue(true);
        component.masterToggle();
        expect(component.isAllSelected).toHaveBeenCalledTimes(1);
        // removes all data options from the selection when isAllSelected returns true
        expect(component.selection.selected.length).toEqual(0);
    });

    it('should select all data options if nothing is selected when performing masterToggle', () => {
        component.data = [tableData[0]];
        jest.spyOn(component, 'isAllSelected').mockReturnValue(false);
        component.masterToggle();
        expect(component.isAllSelected).toHaveBeenCalledTimes(1);
        // adds all data options to the selection when isAllSelected returns false
        expect(component.selection.selected.length).toEqual(1);
    });

    it('should emit a sortChange event when sorting data', () => {
        const sortObject = { active: description.name, direction: 'asc' } as Sort;
        jest.spyOn(component.sortChange, 'emit');
        component.sortData(sortObject);

        expect(component.sortChange.emit).toHaveBeenCalledWith(new QuerySort(description, 'asc'));
    });

    it('should log an error if the column cannot be found when sorting data', () => {
        const sortObject = { active: 'test', direction: 'asc' } as Sort;
        jest.spyOn(component['logger'], 'error');
        jest.spyOn(component.sortChange, 'emit');
        component.sortData(sortObject);

        expect(component.sortChange.emit).not.toHaveBeenCalled();
        expect(component['logger'].error).toHaveBeenCalledWith('Could not find sort column for', '"test"');
    });

    it('should append Select when getting displayedColumns if anything is selected', () => {
        expect(component.selection).toBeDefined();
        component.displayedColumns = displayedColumns;

        expect(component.displayedColumnsWithSelect).toEqual(['Select'].concat(displayedColumns));
    });

    it('should not append Select when getting displayedColumns if nothing is selected', () => {
        component.selection = undefined;
        component.displayedColumns = displayedColumns;

        expect(component.displayedColumnsWithSelect).toEqual(displayedColumns);
    });

    describe('table display', () => {
        beforeEach(() => {
            component.data = tableData;
            component.columns = columns;
            component.displayedColumns = displayedColumns;
            component.locale = 'en-us';
            fixture.detectChanges();
        });

        it('should emit a rowSelect event when a row is clicked', () => {
            jest.spyOn(component.rowSelect, 'emit');
            const row = fixture.nativeElement.querySelector('.mat-mdc-row');

            row.click();
            fixture.detectChanges();

            // clicking the row should trigger a row selection change event
            expect(component.rowSelect.emit).toHaveBeenCalledWith(tableData[0]);
        });

        it('should display a checked checkbox next to the selected record', () => {
            // non of the checkboxes should be checked
            fixture.nativeElement.querySelectorAll('mat-checkbox').forEach((element) => {
                expect(element.classList).not.toContain('mat-mdc-checkbox-checked');
            });

            // select the first record in the table
            component.selection = new SelectionModel(true, [tableData[0]], true);
            fixture.detectChanges();

            // the first checkbox should be checked
            expect(fixture.nativeElement.querySelector('.mat-mdc-checkbox-checked')).toBeTruthy();
        });

        it('should display only one checked checkbox next to the selected record', () => {
            jest.spyOn(component, 'singleSelectedRow');
            jest.spyOn(component.rowSelect, 'emit');
            // non of the checkboxes should be checked
            fixture.nativeElement.querySelectorAll('mat-checkbox').forEach((element) => {
                expect(element.classList).not.toContain('mat-mdc-checkbox-checked');
            });
            component.selection = new SelectionModel(true, tableData, true);
            component.singleSelection = true;
            fixture.detectChanges();

            const rows = fixture.nativeElement.querySelectorAll('.mat-mdc-row');
            // select the first record in the table
            rows[0].click();
            fixture.detectChanges();
            expect(component.selected.code).toBe('P1');

            rows[1].click();
            fixture.detectChanges();
            expect(component.selected.code).toBe('P2');

            expect(component.singleSelectedRow).toHaveBeenCalled();
            expect(component.rowSelect.emit).toHaveBeenCalled();
        });

        it('should only select a single row when multiple is false', () => {
            jest.spyOn(component.selection, 'toggle');
            jest.spyOn(component.rowSelect, 'emit');

            // non of the checkboxes should be checked
            fixture.nativeElement.querySelectorAll('mat-checkbox').forEach((element) => {
                expect(element.classList).not.toContain('mat-mdc-checkbox-checked');
            });

            // select the first record in the table
            const rows = fixture.nativeElement.querySelectorAll('.mat-mdc-row');
            rows[0].click();
            fixture.detectChanges();

            // the first checkbox should be checked
            expect(component.selection.toggle).not.toHaveBeenCalled();
            expect(component.rowSelect.emit).toHaveBeenCalled();
        });

        it('should display an indeterminate checkbox on the master toggle if something is selected', () => {
            // non of the checkboxes should be checked
            fixture.nativeElement.querySelectorAll('mat-checkbox').forEach((element) => {
                expect(element.classList).not.toContain('mat-mdc-checkbox-checked');
            });

            // select the first record in the table
            component.selection = new SelectionModel(true, [tableData[0]], true);
            fixture.detectChanges();
            // the master toggle should show the indeterminate checkbox
            expect(
                fixture.nativeElement.querySelector('th.mat-mdc-header-cell > mat-checkbox[ng-reflect-indeterminate]')
            ).toBeTruthy();
        });

        it('should not display an indeterminate checkbox on the master toggle if something is selected but multiple is false', () => {
            component.multiple = false;
            // non of the checkboxes should be checked
            fixture.nativeElement.querySelectorAll('mat-checkbox').forEach((element) => {
                expect(element.classList).not.toContain('mat-checkbox-checked');
            });

            // select the first record in the table
            component.selection = new SelectionModel(true, [tableData[0]], true);
            fixture.detectChanges();

            // the master toggle should show the indeterminate checkbox
            expect(
                fixture.nativeElement.querySelector('th.mat-header-cell > mat-checkbox.mat-checkbox-indeterminate')
            ).toBeFalsy();
        });

        it('should display a checked checkbox on the master toggle if all are selected', () => {
            // non of the checkboxes should be checked
            fixture.nativeElement.querySelectorAll('mat-mdc-checkbox').forEach((element) => {
                expect(element.classList).not.toContain('mat--mdc-checkbox-checked');
            });

            // select all records in the table
            component.selection = new SelectionModel(true, tableData, true);
            fixture.detectChanges();

            // the master toggle should be checked
            expect(
                fixture.nativeElement.querySelector('th.mat-mdc-header-cell > mat-checkbox.mat-mdc-checkbox-checked')
            ).toBeTruthy();

            // all row checkboxes should be checked
            fixture.nativeElement.querySelectorAll('td.mat-mdc-cell > mat-checkbox').forEach((element) => {
                expect(element.classList).toContain('mat-mdc-checkbox-checked');
            });
        });

        it('should display the column names of the displayed columns in the header', () => {
            // each display column should be a header
            fixture.nativeElement.querySelectorAll('.mat-sort-header-content').forEach((header) => {
                expect(displayedColumns).toContain(header.innerHTML);
            });

            // add another column to the display columns
            component.displayedColumns.push(version.name);
            fixture.detectChanges();

            // check that the new display column is now a header
            const displayedHeader = fixture.nativeElement.querySelectorAll('.mat-sort-header-content');
            expect(displayedHeader.item(displayedHeader.length - 1).innerHTML).toEqual(version.name);
        });

        it('should display the sort direction of the sort column', () => {
            // check that the table is sorted by code in descending order
            let sortedCodeColumn: Element;
            fixture.nativeElement.querySelectorAll('#vui-table-column').forEach((element) => {
                if (element.textContent === code.name) {
                    sortedCodeColumn = element.children[0];
                }
            });

            expect(sortedCodeColumn.classList).toContain('mat-sort-header-sorted');
            expect(sortedCodeColumn.parentElement.getAttribute('aria-sort')).toEqual('descending');

            // update the sort to description ascending
            component.sort = new QuerySort(description, 'asc');
            fixture.detectChanges();

            // check that the table is sorted by description in descending order
            let sortedDescriptionColumn: Element;
            fixture.nativeElement.querySelectorAll('#vui-table-column').forEach((element) => {
                if (element.textContent === description.name) {
                    sortedDescriptionColumn = element.children[0];
                }
            });

            expect(sortedDescriptionColumn.classList).toContain('mat-sort-header-sorted');
            expect(sortedDescriptionColumn.parentElement.getAttribute('aria-sort')).toEqual('ascending');
        });

        it('should not sort columns that are not sortable', async () => {
            const sortHeaders = await loader.getAllHarnesses(MatSortHeaderHarness);
            const notSortableIndex = displayedColumns.indexOf(notSortable.name, 0);
            const sortableColumns = [...displayedColumns];
            sortableColumns.splice(notSortableIndex, 1);

            expect(await Promise.all(sortHeaders.map((sh) => sh.getLabel()))).toEqual(sortableColumns);
        });

        describe('table row', () => {
            const getRowValue = (rowIndex: number, column: Column): string => {
                const row = fixture.nativeElement.querySelectorAll('#vui-table-row').item(rowIndex);
                return row.children[columns.indexOf(column) + 1].innerHTML.trim();
            };

            beforeEach(() => {
                // add all columns to the display list
                component.displayedColumns = columns.map((column) => column.name);
                fixture.detectChanges();
            });

            it('should display string values correctly', () => {
                expect(getRowValue(0, code)).toEqual(tableData[0].code);
                expect(getRowValue(1, code)).toEqual(tableData[1].code);
            });

            it('should display boolean values correctly', () => {
                expect(getRowValue(0, active)).toEqual(tableData[0].active ? 'Y' : 'N');
                expect(getRowValue(1, active)).toEqual(tableData[1].active ? 'Y' : 'N');
            });

            it('should display decimal values correctly', () => {
                expect(getRowValue(0, quantity)).toEqual(tableData[0].quantity.toString());
                expect(getRowValue(1, quantity)).toEqual(tableData[1].quantity.toString());
            });

            it('should display currency values correctly', () => {
                expect(getRowValue(0, price)).toEqual(`$${tableData[0].price}`);
                expect(getRowValue(1, price)).toEqual(`$${tableData[1].price}`);
            });

            it('should display date values correctly', () => {
                expect(getRowValue(0, stockDate)).toEqual('Feb 1, 2020');
                expect(getRowValue(1, stockDate)).toEqual('Jan 21, 2020');
            });

            it('should display dateTime values correctly', () => {
                expect(getRowValue(0, lastUpdatedDate)).toEqual('Feb 1, 2020 10:00 AM');
                expect(getRowValue(1, lastUpdatedDate)).toEqual('Jan 21, 2020 7:51 PM');
            });

            it('should display integer values correctly', () => {
                expect(getRowValue(0, version)).toEqual(tableData[0].version.toString());
                expect(getRowValue(1, version)).toEqual(tableData[1].version.toString());
            });
        });
    });
});
