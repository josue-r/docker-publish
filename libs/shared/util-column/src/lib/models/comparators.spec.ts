import { Column } from './column';
import { Comparators } from './comparators';

describe('Comparators', () => {
    describe('for', () => {
        const dateColumn: Column = Column.of({
            name: 'dateColumn',
            apiFieldPath: 'testDate',
            type: 'date',
        });

        const dateTimeColumn: Column = Column.of({
            name: 'dateTimeColumn',
            apiFieldPath: 'testDateTime',
            type: 'dateTime',
        });

        describe.each`
            column            | exclusions                                                                              | expectation
            ${dateColumn}     | ${[]}                                                                                   | ${[Comparators.equalTo, Comparators.notEqualTo, Comparators.before, Comparators.after, Comparators.between, Comparators.notBetween]}
            ${dateColumn}     | ${[Comparators.equalTo, Comparators.notEqualTo]}                                        | ${[Comparators.before, Comparators.after, Comparators.between, Comparators.notBetween]}
            ${dateTimeColumn} | ${[]}                                                                                   | ${[Comparators.equalTo, Comparators.notEqualTo, Comparators.before, Comparators.after, Comparators.between, Comparators.notBetween]}
            ${dateTimeColumn} | ${[Comparators.before, Comparators.after, Comparators.equalTo, Comparators.notEqualTo]} | ${[Comparators.between, Comparators.notBetween]}
        `('dates', ({ column, exclusions, expectation }) => {
            it(`should determine the appropriate comparators based on the column`, () => {
                expect(Comparators.for(column, exclusions)).toEqual(expectation);
            });
        });
    });

    describe('forType', () => {
        describe.each`
            columnType    | expectation
            ${'date'}     | ${[Comparators.equalTo, Comparators.notEqualTo, Comparators.blank, Comparators.notBlank, Comparators.before, Comparators.after, Comparators.between, Comparators.notBetween]}
            ${'dateTime'} | ${[Comparators.equalTo, Comparators.notEqualTo, Comparators.before, Comparators.after, Comparators.between, Comparators.notBetween, Comparators.blank, Comparators.notBlank]}
            ${'integer'}  | ${[Comparators.equalTo, Comparators.notEqualTo, Comparators.blank, Comparators.notBlank, Comparators.greaterThanOrEqual, Comparators.lessThanOrEqual]}
            ${'decimal'}  | ${[Comparators.equalTo, Comparators.notEqualTo, Comparators.blank, Comparators.notBlank, Comparators.greaterThanOrEqual, Comparators.lessThanOrEqual]}
            ${'string'}   | ${[Comparators.startsWith, Comparators.contains, Comparators.endsWith, Comparators.equalTo, Comparators.notEqualTo, Comparators.blank, Comparators.notBlank]}
            ${'boolean'}  | ${[Comparators.true, Comparators.falseOrBlank]}
        `('columnType', ({ columnType, expectation }) => {
            it(`should determine the appropriate comparators based on the column`, () => {
                expect(Comparators.forType(columnType)).toEqual(expectation);
            });
        });
    });

    describe.each`
        comparator                        | expectation
        ${null}                           | ${false}
        ${undefined}                      | ${false}
        ${{}}                             | ${false}
        ${Comparators.equalTo}            | ${false}
        ${Comparators.notEqualTo}         | ${false}
        ${Comparators.blank}              | ${false}
        ${Comparators.notBlank}           | ${false}
        ${Comparators.startsWith}         | ${false}
        ${Comparators.contains}           | ${false}
        ${Comparators.endsWith}           | ${false}
        ${Comparators.true}               | ${false}
        ${Comparators.falseOrBlank}       | ${false}
        ${Comparators.in}                 | ${false}
        ${Comparators.notIn}              | ${false}
        ${Comparators.greaterThanOrEqual} | ${false}
        ${Comparators.lessThanOrEqual}    | ${false}
        ${Comparators.before}             | ${false}
        ${Comparators.after}              | ${false}
        ${Comparators.between}            | ${true}
        ${Comparators.notBetween}         | ${true}
    `('isDateRangeComparator', ({ comparator, expectation }) => {
        it(`should be ${expectation} if given ${comparator?.value}`, () => {
            expect(Comparators.isDateRangeComparator(comparator)).toEqual(expectation);
        });
    });
});
