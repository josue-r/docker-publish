import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators, SimpleDropdownColumn } from '@vioc-angular/shared/util-column';
import * as moment from 'moment';
import { SearchChip } from './search-chip';

describe('SearchChip', () => {
    const basicColumn = Column.of({
        name: 'testColumn',
        apiFieldPath: 'testColumn',
        type: 'string',
    });
    const dropdownColumn: SimpleDropdownColumn<{ id: any; value: any }> = SimpleDropdownColumn.of({
        name: 'testDropdownColumn',
        type: { entityType: 'testEntity' },
        apiFieldPath: 'testDropdown',
        mapToKey: (entity) => entity.id,
        mapToFilterDisplay: (entity) => entity.value,
        values: [{ id: 'testid', value: 'testvalue' }],
        hint: 'test column',
        apiSortPath: 'testDropdown',
    });

    it('should provide a default converter', () => {
        const searchLine: SearchLine = new SearchLine(basicColumn, Comparators.startsWith, ['testValue']);
        const searchChip: SearchChip = new SearchChip(searchLine);
        expect(searchChip.value).toEqual(
            `${searchLine.column.name} ${searchLine.comparator.displayValue} ${searchLine.value[0].toString()}`
        );
    });

    it('should use a provided converter', () => {
        const dropdownSearchLine: SearchLine = new SearchLine(dropdownColumn, Comparators.equalTo, [
            dropdownColumn.values[0],
        ]);
        const searchChip: SearchChip = new SearchChip(dropdownSearchLine, dropdownSearchLine.column.mapToFilterDisplay);
        const field = dropdownSearchLine.column.name;
        const comparator = dropdownSearchLine.comparator.displayValue;
        expect(searchChip.value).toEqual(
            `${field} ${comparator} ${dropdownColumn.mapToFilterDisplay(dropdownSearchLine.value[0])}`
        );
    });

    describe.each`
        columnType    | comparator             | value                                           | expected
        ${'date'}     | ${Comparators.equalTo} | ${['2019-11-01']}                               | ${'Nov 1, 2019'}
        ${'date'}     | ${Comparators.equalTo} | ${[moment('2019-11-01')]}                       | ${'Nov 1, 2019'}
        ${'date'}     | ${Comparators.between} | ${['2019-11-01', '2019-11-03']}                 | ${'[Nov 1, 2019, Nov 3, 2019]'}
        ${'date'}     | ${Comparators.between} | ${[moment('2019-11-01'), moment('2019-11-03')]} | ${'[Nov 1, 2019, Nov 3, 2019]'}
        ${'dateTime'} | ${Comparators.equalTo} | ${['2019-11-01']}                               | ${'Nov 1, 2019'}
        ${'dateTime'} | ${Comparators.equalTo} | ${[moment('2019-11-01')]}                       | ${'Nov 1, 2019'}
        ${'dateTime'} | ${Comparators.between} | ${['2019-11-01', '2019-11-03']}                 | ${'[Nov 1, 2019, Nov 3, 2019]'}
        ${'dateTime'} | ${Comparators.between} | ${[moment('2019-11-01'), moment('2019-11-03')]} | ${'[Nov 1, 2019, Nov 3, 2019]'}
    `('dates', ({ columnType, comparator, value, expected }) => {
        it(`should get formatted`, () => {
            const column = Column.of({ ...basicColumn, type: columnType });
            const searchLine: SearchLine = new SearchLine(column, comparator, value);

            expect(new SearchChip(searchLine).value).toEqual(
                `${searchLine.column.name} ${searchLine.comparator.displayValue} ${expected}`
            );
        });
    });

    it('should support comparators without values (like is blank)', () => {
        const column = Column.of({ ...basicColumn, type: 'date' });
        const searchLine: SearchLine = new SearchLine(column, Comparators.blank, ['value should not be displayed']);

        const searchChipUS: SearchChip = new SearchChip(searchLine);
        expect(searchChipUS.value).toEqual(`${searchLine.column.name} ${searchLine.comparator.displayValue} `);
    });

    it('should support multiple values', () => {
        const searchLine: SearchLine = new SearchLine(basicColumn, Comparators.in, ['testValue1', 'testValue2']);
        const searchChip: SearchChip = new SearchChip(searchLine);
        expect(searchChip.value).toEqual(
            `${searchLine.column.name} ${searchLine.comparator.displayValue} [testValue1,testValue2]`
        );
    });
});
