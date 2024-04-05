import { instanceOfColumnGroup } from '@vioc-angular/shared/util-column';
import { simpleStringDropdown } from '../mocks/column.mocks';
import { Column } from './column';
import { ColumnConfig } from './column-config';
import { ColumnGroup, Columns, instanceOfColumns } from './columns';

const columns: Columns = {
    code: {
        apiFieldPath: 'code',
        name: 'Code',
        type: 'string',
    },
    description: {
        apiFieldPath: 'description',
        name: 'Description',
        type: 'string',
    },
};

const groupedColumns: Columns = {
    ...columns,
    groupedColumns: {
        name: 'Grouped Columns',
        columns: {
            endDate: {
                apiFieldPath: 'endDate',
                name: 'End Date',
                type: 'string',
            },
            startDate: {
                apiFieldPath: 'startDate',
                name: 'Start Date',
                type: 'string',
            },
        },
    },
};

describe('Columns', () => {
    describe('toColumnArray', () => {
        it(`should create an array of columns`, () => {
            const columnArray = Columns.toColumnArray(columns);

            // TODO: must do a stringify to check the object equality due to "Received: serializes to the same string" issue:
            // https://github.com/facebook/jest/issues/8475#issue-446046819
            expect(JSON.stringify(columnArray)).toEqual(
                JSON.stringify([
                    Column.of(columns.code as ColumnConfig),
                    Column.of(columns.description as ColumnConfig),
                ])
            );
        });

        it(`should create an array of columns from a group`, () => {
            const columnArray = Columns.toColumnArray(groupedColumns);

            // TODO: must do a stringify to check the object equality due to "Received: serializes to the same string" issue:
            // https://github.com/facebook/jest/issues/8475#issue-446046819
            expect(JSON.stringify(columnArray)).toEqual(
                JSON.stringify([
                    Column.of(groupedColumns.code as ColumnConfig),
                    Column.of(groupedColumns.description as ColumnConfig),
                    Column.of((groupedColumns.groupedColumns as ColumnGroup).columns.endDate as ColumnConfig),
                    Column.of((groupedColumns.groupedColumns as ColumnGroup).columns.startDate as ColumnConfig),
                ])
            );
        });
    });

    describe('toColumn', () => {
        it(`should execute a column function if one is passed`, () => {
            const columnFunction = () => simpleStringDropdown;

            expect(Columns.toColumn(columnFunction)).toEqual(simpleStringDropdown);
        });

        it(`should return a column if a column is passed`, () => {
            const expectedColumn: Column = Column.of(columns.code as ColumnConfig);

            expect(Columns.toColumn(expectedColumn)).toEqual(expectedColumn);
        });

        it(`should create a column from a column config`, () => {
            const expectedColumn: Column = Column.of(columns.code as ColumnConfig);

            // TODO: must do a stringify to check the object equality due to "Received: serializes to the same string" issue:
            // https://github.com/facebook/jest/issues/8475#issue-446046819
            expect(JSON.stringify(Columns.toColumn(columns.code as ColumnConfig))).toEqual(
                JSON.stringify(expectedColumn)
            );
        });
    });

    describe('instanceOfColumns', () => {
        it(`should fail if the object is null`, () => {
            expect(instanceOfColumns(null)).toBeFalsy();
        });

        it(`should fail if the object is undefined`, () => {
            expect(instanceOfColumns(undefined)).toBeFalsy();
        });

        it(`should fail if the object has a name field`, () => {
            expect(instanceOfColumns({ name: null })).toBeFalsy();
        });

        it(`should fail if the object has an apiFieldPath field`, () => {
            expect(instanceOfColumns({ apiFieldPath: null })).toBeFalsy();
        });

        it(`should fail if passed and empty object`, () => {
            expect(instanceOfColumns({})).toBeFalsy();
        });

        it(`should pass if the object has a column property`, () => {
            expect(instanceOfColumns({ code: Column.of(columns.code as ColumnConfig) })).toBeTruthy();
        });

        it(`should pass if the object has a columnConfig property`, () => {
            expect(instanceOfColumns({ code: columns.code })).toBeTruthy();
        });

        it(`should pass if the object has a column function property`, () => {
            const columnFunction = () => simpleStringDropdown;
            expect(instanceOfColumns({ code: columnFunction })).toBeTruthy();
        });
    });

    describe.each`
        object                                                        | expectedResult
        ${null}                                                       | ${false}
        ${undefined}                                                  | ${false}
        ${{ name: undefined, columns }}                               | ${false}
        ${{ name: null, columns }}                                    | ${false}
        ${{ ...groupedColumns.groupedColumns, apiFieldPath: 'test' }} | ${false}
        ${{ name: 'Test', columns: {} }}                              | ${false}
        ${{ name: 'Test', columns }}                                  | ${true}
    `('instanceOfColumnGroup', ({ object, expectedResult }) => {
        it(`should return ${expectedResult} when given ${JSON.stringify(object)}`, () => {
            expect(instanceOfColumnGroup(object)).toEqual(expectedResult);
        });
    });
});
