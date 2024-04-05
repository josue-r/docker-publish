// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Column, Columns, instanceOfColumns, SimpleDropdownColumn } from '@vioc-angular/shared/util-column';
import { ManagedColumn } from './managed-column';
import { ManagedColumns } from './managed-columns';

describe('ManagedColumns', () => {
    let managedColumns: ManagedColumns;

    const displayedByDefaultColumn = Column.of({
        name: 'column1',
        type: 'string',
        apiFieldPath: 'column1',
        displayedByDefault: true,
    });
    const defaultColumn = Column.of({
        name: 'column2',
        type: 'string',
        apiFieldPath: 'column2',
        displayedByDefault: false,
    });
    const nonDisplayableColumn = Column.of({
        name: 'column4',
        type: 'string',
        apiFieldPath: 'column4',
        displayedByDefault: false,
        displayable: false,
    });
    const dropdownColumn: SimpleDropdownColumn<{ id: any; value: any }> = SimpleDropdownColumn.of({
        name: 'dropdown',
        type: { entityType: 'testEntity' },
        apiFieldPath: 'testDropdown1',
        mapToKey: (entity) => entity.id,
        mapToFilterDisplay: (entity) => entity.value,
        values: [{ id: 'testid', value: 'testvalue' }],
        hint: 'test dropdown 1',
        apiSortPath: 'testDropdown1',
        displayedByDefault: true,
    });

    const groupedColumnName = 'groupedColumns';
    const groupedColumns: Columns = {
        endDate: {
            name: 'End Date',
            apiFieldPath: 'endDate',
            type: 'date',
            displayedByDefault: false,
        },
        startDate: {
            name: 'Start Date',
            apiFieldPath: 'startDate',
            type: 'date',
            displayedByDefault: false,
        },
    };

    const columns: Columns = {
        displayedByDefaultColumn,
        nonDisplayableColumn,
        defaultColumn,
        dropdownColumn,
        groupedColumns: {
            name: groupedColumnName,
            columns: groupedColumns,
        },
    };

    describe('new managedColumns', () => {
        it('should configure the displayed and hidden columns', () => {
            const managedCols = new ManagedColumns(columns, null);
            const groupedManagedColumns: ManagedColumn[] = [
                {
                    name: groupedColumns.endDate.name,
                    displayedByDefault: false,
                    selected: false,
                } as ManagedColumn,
                {
                    name: groupedColumns.startDate.name,
                    displayedByDefault: false,
                    selected: false,
                } as ManagedColumn,
            ];
            // expect displayedByDefaultColumn and dropdownColumn to be displayed since they are displayedByDefault
            [displayedByDefaultColumn, dropdownColumn].forEach((c) => {
                expect(managedCols.displayed).toContainEqual({
                    name: c.name,
                    displayedByDefault: true,
                    selected: false,
                } as ManagedColumn);
            });
            // expect defaultColumn and groupColumns to be hidden since they are not displayedByDefault
            [defaultColumn, groupedColumns].forEach((c) => {
                expect(managedCols.hidden).toContainEqual({
                    name: instanceOfColumns(c) ? groupedColumnName : c.name,
                    displayedByDefault: false,
                    selected: false,
                    groupedColumns: instanceOfColumns(c) ? groupedManagedColumns : undefined,
                } as ManagedColumn);
            });
        });

        it('should configure the displayed columns with the passed displayed column list', () => {
            const managedCols = new ManagedColumns(columns, [
                displayedByDefaultColumn.name,
                defaultColumn.name,
                'End Date',
                'Start Date',
            ]);
            const groupedManagedColumns: ManagedColumn[] = [
                {
                    name: groupedColumns.endDate.name,
                    displayedByDefault: false,
                    selected: false,
                } as ManagedColumn,
                {
                    name: groupedColumns.startDate.name,
                    displayedByDefault: false,
                    selected: false,
                } as ManagedColumn,
            ];
            // expect displayedByDefaultColumn, defaultColumn and groupColumns to be displayed since they are in the displayedColumns list
            [displayedByDefaultColumn, defaultColumn, groupedColumns].forEach((c) => {
                expect(managedCols.displayed).toContainEqual({
                    name: instanceOfColumns(c) ? groupedColumnName : c.name,
                    displayedByDefault: true,
                    selected: false,
                    groupedColumns: instanceOfColumns(c) ? groupedManagedColumns : undefined,
                } as ManagedColumn);
            });
            // expect dropdownColumn to be hidden since it are in not in the displayedColumns list
            expect(managedCols.hidden).toContainEqual({
                name: dropdownColumn.name,
                displayedByDefault: false,
                selected: false,
            } as ManagedColumn);
        });
    });

    beforeEach(() => {
        managedColumns = new ManagedColumns(columns, null);
    });

    it('should not show the columns that have displayable set to false', () => {
        expect(managedColumns.displayed.map((c) => c.name)).not.toContain(nonDisplayableColumn.name);
        expect(managedColumns.hidden.map((c) => c.name)).not.toContain(nonDisplayableColumn.name);
    });

    describe('hideSelected', () => {
        it('should move the selected column from displayed to hidden', () => {
            const selectedColumn = managedColumns.displayed[0];
            selectedColumn.selected = true;
            managedColumns.hideSelected();
            expect(managedColumns.displayed).not.toContain(selectedColumn);
            expect(managedColumns.hidden).toContain(selectedColumn);
        });
    });

    describe('displaySelected', () => {
        it('should move the selected column from hidden to displayed', () => {
            const selectedColumn = managedColumns.hidden[0];
            selectedColumn.selected = true;
            managedColumns.displaySelected();
            expect(managedColumns.hidden).not.toContain(selectedColumn);
            expect(managedColumns.displayed).toContain(selectedColumn);
        });
    });

    describe('hideAll', () => {
        it('should hide all columns', () => {
            [displayedByDefaultColumn.name, dropdownColumn.name].forEach((c) =>
                expect(managedColumns.displayed.map((dc) => dc.name)).toContain(c)
            );
            [defaultColumn.name, groupedColumnName].forEach((c) =>
                expect(managedColumns.hidden.map((hc) => hc.name)).toContain(c)
            );
            managedColumns.hideAll();
            expect(managedColumns.displayed.length).toEqual(0);
            [displayedByDefaultColumn.name, dropdownColumn.name, defaultColumn.name, groupedColumnName].forEach((c) =>
                expect(managedColumns.hidden.map((hc) => hc.name)).toContain(c)
            );
        });
    });

    describe('displayAll', () => {
        it('should display all columns', () => {
            [displayedByDefaultColumn.name, dropdownColumn.name].forEach((c) =>
                expect(managedColumns.displayed.map((dc) => dc.name)).toContain(c)
            );
            [defaultColumn.name, groupedColumnName].forEach((c) =>
                expect(managedColumns.hidden.map((hc) => hc.name)).toContain(c)
            );
            managedColumns.displayAll();
            [displayedByDefaultColumn.name, dropdownColumn.name, defaultColumn.name, groupedColumnName].forEach((c) =>
                expect(managedColumns.displayed.map((dc) => dc.name)).toContain(c)
            );
            expect(managedColumns.hidden.length).toEqual(0);
        });
    });

    it('should move a column from the displayed list to the hidden list', () => {
        const column = managedColumns.displayed[1];
        managedColumns.hide(column);
        expect(managedColumns.displayed).not.toContain(column);
        expect(managedColumns.hidden).toContain(column);
    });

    it('should move a column from the hidden list to the displayed list', () => {
        const column = managedColumns.hidden[1];
        managedColumns.display(column);
        expect(managedColumns.displayed).toContain(column);
        expect(managedColumns.hidden).not.toContain(column);
    });

    it('should move a column from the hidden list to the displayed list at a specific index', () => {
        const column = managedColumns.hidden[1];
        managedColumns.display(column, 0);
        expect(managedColumns.displayed[0]).toEqual(column);
        expect(managedColumns.hidden).not.toContain(column);
    });

    describe('reset', () => {
        it('should reset column lists to their defaults', () => {
            managedColumns.hideAll();
            expect(managedColumns.displayed.length).toEqual(0);
            [displayedByDefaultColumn.name, dropdownColumn.name, defaultColumn.name, groupedColumnName].forEach((c) =>
                expect(managedColumns.hidden.map((hc) => hc.name)).toContain(c)
            );
            managedColumns.reset();
            [displayedByDefaultColumn.name, dropdownColumn.name].forEach((c) =>
                expect(managedColumns.displayed.map((dc) => dc.name)).toContain(c)
            );
            [defaultColumn.name, groupedColumnName].forEach((c) =>
                expect(managedColumns.hidden.map((hc) => hc.name)).toContain(c)
            );
        });
    });

    it('should return a list of all managedColumns with all property', () => {
        expect(managedColumns.all).toEqual([...managedColumns.displayed, ...managedColumns.hidden]);
    });

    describe('displayedColumnNames', () => {
        it('should display all column names', () => {
            const columnNames = [defaultColumn.name];
            const managedCols = new ManagedColumns(columns, [defaultColumn.name]);
            expect(managedCols.displayedColumnNames).toEqual(columnNames);
        });

        it('should display all grouped column names', () => {
            const groupedColumnNames = Object.values(groupedColumns).map((c) => c.name);
            const managedCols = new ManagedColumns(columns, groupedColumnNames);
            expect(managedCols.displayedColumnNames).toEqual(groupedColumnNames);
        });
    });
});
