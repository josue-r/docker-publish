import {
    booleanColumn,
    Column,
    Comparators,
    notSearchableColumn,
    searchDefaultedColumn,
    SimpleDropdownColumn,
    stringColumn,
} from '@vioc-angular/shared/util-column';
import { SearchLine } from './search-line';

describe('SearchLine', () => {
    const basicColumn: Column = Column.of({
        name: 'testColumn',
        apiFieldPath: 'test',
        type: 'string',
    });

    const requiredColumn: Column = Column.of({
        name: 'requiredColumn',
        apiFieldPath: 'testRequired',
        type: 'string',
        searchable: {
            defaultSearch: true,
            required: true,
        },
    });

    const dateTimeColumn: Column = Column.of({
        name: 'dateTimeColumn',
        apiFieldPath: 'testDateTime',
        type: 'dateTime',
    });

    const columnsToString = (columns: Column[]) => `[${columns.map((column: Column) => column.name).join(',')}]`;
    const searchLineToString = (line: SearchLine) =>
        `{column=${line.column.name}, comparator=${line.comparator.displayValue}, value=${line.value}}`;
    const searchLinesToString = (expectedResult: SearchLine[]) =>
        `[${expectedResult.map((line: SearchLine) => searchLineToString(line)).join(', ')}]`;

    describe('toQueryRestriction', () => {
        it('should build query restriction for standard column', () => {
            const searchLine = new SearchLine(basicColumn, Comparators.equalTo, ['testValue']);

            const queryRestriction = searchLine.toQueryRestriction();

            expect(queryRestriction.fieldPath).toEqual(searchLine.column.apiFieldPath);
            expect(queryRestriction.dataType).toEqual(searchLine.column.type as string);
            expect(queryRestriction.operator).toEqual(searchLine.comparator.value);
            expect(queryRestriction.values).toEqual(searchLine.value);
        });

        it('should build query restriction for entity column', () => {
            const entityType = 'testEntity';
            const entityId = 'testId';
            const dropdownColumn: SimpleDropdownColumn<{ id: any }> = SimpleDropdownColumn.of({
                ...basicColumn,
                mapToKey: (o) => o.id,
                values: [],
                hint: 'testHint',
                apiSortPath: 'test',
                type: { entityType },
            });
            const searchLine = new SearchLine(dropdownColumn, Comparators.equalTo, [{ id: entityId }]);

            const queryRestriction = searchLine.toQueryRestriction();

            expect(queryRestriction.fieldPath).toEqual(searchLine.column.apiFieldPath);
            expect(queryRestriction.dataType).toEqual(entityType);
            expect(queryRestriction.operator).toEqual(searchLine.comparator.value);
            expect(queryRestriction.values).toEqual([entityId]);
        });

        it('should build query restriction for enum column', () => {
            const enumType = 'testEnum';
            enum TestEnum {
                VALUE1 = 'VALUE1',
                VALUE2 = 'VALUE2',
            }
            const dropdownColumn: SimpleDropdownColumn<TestEnum> = SimpleDropdownColumn.of({
                ...basicColumn,
                type: { enum: enumType },
                values: [TestEnum.VALUE1, TestEnum.VALUE2],
            });
            const searchLine = new SearchLine(dropdownColumn, Comparators.equalTo, [TestEnum.VALUE1]);

            const queryRestriction = searchLine.toQueryRestriction();

            expect(queryRestriction.fieldPath).toEqual(searchLine.column.apiFieldPath);
            expect(queryRestriction.dataType).toEqual(enumType);
            expect(queryRestriction.operator).toEqual(searchLine.comparator.value);
            expect(queryRestriction.values).toEqual([TestEnum.VALUE1]);
        });

        it('should build query restriction for custom type column', () => {
            const customType = 'testCustomType';
            const inputType = 'integer';
            const customTYpeValue = 2021;
            const dropdownColumn: SimpleDropdownColumn<{ value: any }> = SimpleDropdownColumn.of({
                ...basicColumn,
                mapToKey: (o) => o.value,
                values: [],
                hint: 'testHint',
                apiSortPath: 'test',
                type: { customType, inputType },
            });
            const searchLine = new SearchLine(dropdownColumn, Comparators.equalTo, [{ value: 2021 }]);

            const queryRestriction = searchLine.toQueryRestriction();

            expect(queryRestriction.fieldPath).toEqual(searchLine.column.apiFieldPath);
            expect(queryRestriction.dataType).toEqual(customType);
            expect(queryRestriction.operator).toEqual(searchLine.comparator.value);
            expect(queryRestriction.values).toEqual([customTYpeValue]);
        });
    });

    describe.each`
        column            | comparator                | value                               | expectedResult
        ${undefined}      | ${Comparators.equalTo}    | ${['testValue']}                    | ${false}
        ${basicColumn}    | ${undefined}              | ${['testValue']}                    | ${false}
        ${basicColumn}    | ${Comparators.equalTo}    | ${undefined}                        | ${false}
        ${basicColumn}    | ${Comparators.equalTo}    | ${[]}                               | ${false}
        ${basicColumn}    | ${Comparators.equalTo}    | ${['']}                             | ${false}
        ${basicColumn}    | ${Comparators.startsWith} | ${['     ']}                        | ${false}
        ${basicColumn}    | ${Comparators.equalTo}    | ${['     ']}                        | ${false}
        ${basicColumn}    | ${Comparators.endsWith}   | ${['     ']}                        | ${false}
        ${basicColumn}    | ${Comparators.equalTo}    | ${['  testValue ']}                 | ${true}
        ${basicColumn}    | ${Comparators.equalTo}    | ${['testValue']}                    | ${true}
        ${basicColumn}    | ${Comparators.equalTo}    | ${[0]}                              | ${true}
        ${basicColumn}    | ${Comparators.equalTo}    | ${[true]}                           | ${true}
        ${basicColumn}    | ${Comparators.equalTo}    | ${['2020-01-01']}                   | ${true}
        ${basicColumn}    | ${Comparators.equalTo}    | ${[{ code: 'Test', active: true }]} | ${true}
        ${basicColumn}    | ${Comparators.blank}      | ${undefined}                        | ${true}
        ${dateTimeColumn} | ${Comparators.between}    | ${undefined}                        | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${null}                             | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${[]}                               | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${['2020-01-01']}                   | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${['2020-01-01', null]}             | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${['2020-01-01', '']}               | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${[null, '2020-01-01']}             | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${['', '2020-01-01']}               | ${false}
        ${dateTimeColumn} | ${Comparators.between}    | ${['2020-01-01', '2020-02-01']}     | ${true}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${undefined}                        | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${null}                             | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${[]}                               | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${['2020-01-01']}                   | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${['2020-01-01', null]}             | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${['2020-01-01', '']}               | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${[null, '2020-01-01']}             | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${['', '2020-01-01']}               | ${false}
        ${dateTimeColumn} | ${Comparators.notBetween} | ${['2020-01-01', '2020-02-01']}     | ${true}
    `('populated', ({ column, comparator, value, expectedResult }) => {
        it(`should ${expectedResult ? '' : 'not '}be considered populated with column=${
            column ? column.name : 'empty'
        } comparator=${comparator ? comparator.displayValue : 'empty'}, and value=${value}`, () => {
            const searchLine = new SearchLine(column, comparator, value);
            expect(Boolean(searchLine.populated)).toEqual(expectedResult);
        });
    });

    describe.each`
        columns                                                               | expectedResult
        ${[stringColumn]}                                                     | ${[new SearchLine(stringColumn, Comparators.startsWith)]}
        ${[searchDefaultedColumn]}                                            | ${[new SearchLine(searchDefaultedColumn, Comparators.equalTo, 'test')]}
        ${[stringColumn, booleanColumn]}                                      | ${[new SearchLine(stringColumn, Comparators.startsWith), new SearchLine(booleanColumn, Comparators.true)]}
        ${[stringColumn, booleanColumn, notSearchableColumn]}                 | ${[new SearchLine(stringColumn, Comparators.startsWith), new SearchLine(booleanColumn, Comparators.true)]}
        ${[stringColumn, booleanColumn, notSearchableColumn, requiredColumn]} | ${[new SearchLine(stringColumn, Comparators.startsWith), new SearchLine(booleanColumn, Comparators.true), new SearchLine(requiredColumn, Comparators.startsWith)]}
        ${[notSearchableColumn]}                                              | ${[]}
        ${[]}                                                                 | ${[]}
    `('defaults', ({ columns, expectedResult }) => {
        it(`should convert ${columnsToString(columns)} Columns to ${searchLinesToString(
            expectedResult
        )} SearchLines`, () => {
            expect(SearchLine.defaults(columns)).toEqual(expectedResult);
        });
    });

    describe.each`
        columns                                                 | expectedResult
        ${[booleanColumn]}                                      | ${[]}
        ${[searchDefaultedColumn]}                              | ${[]}
        ${[booleanColumn]}                                      | ${[]}
        ${[booleanColumn, notSearchableColumn, requiredColumn]} | ${[new SearchLine(requiredColumn, Comparators.startsWith)]}
        ${[notSearchableColumn]}                                | ${[]}
        ${[]}                                                   | ${[]}
    `('requiredLines', ({ columns, expectedResult }) => {
        it(`should convert ${columnsToString(columns)} Columns to ${searchLinesToString(
            expectedResult
        )} SearchLines`, () => {
            expect(SearchLine.requiredLines(columns)).toEqual(expectedResult);
        });
    });

    describe('required Column', () => {
        it('should not be able to remove a required column', () => {
            const searchLine = new SearchLine(requiredColumn, Comparators.equalTo, ['test']);
            expect(searchLine.column.apiFieldPath).toEqual(requiredColumn.apiFieldPath);
            expect(searchLine.column.type).toEqual(requiredColumn.type);
            expect(searchLine.comparator).toEqual(Comparators.equalTo);
            expect(searchLine.value).toEqual(['test']);
            expect(searchLine.column.isRequired).toBeTruthy();
            expect(searchLine.removable).toBeFalsy();
        });
        it('should be able to remove a non required column', () => {
            const searchLine = new SearchLine(basicColumn, Comparators.equalTo, ['test']);
            expect(searchLine.column.apiFieldPath).toEqual(basicColumn.apiFieldPath);
            expect(searchLine.column.type).toEqual(basicColumn.type);
            expect(searchLine.comparator).toEqual(Comparators.equalTo);
            expect(searchLine.value).toEqual(['test']);
            expect(searchLine.column.isRequired).toBeFalsy();
            expect(searchLine.removable).toBeTruthy();
        });
    });
});
