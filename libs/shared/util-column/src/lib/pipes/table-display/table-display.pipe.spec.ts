import { EMPTY } from 'rxjs';
import { Column } from '../../models/column';
import { DynamicDropdownColumn } from '../../models/dropdown-column';
import { TableDisplayPipe } from './table-display.pipe';

describe('TableDisplayPipe', () => {
    let pipe: TableDisplayPipe;

    beforeEach(() => {
        pipe = new TableDisplayPipe('en-US');
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    describe.each`
        type                     | path       | row                                  | expected
        ${'string'}              | ${'f1'}    | ${{ f1: 'foo' }}                     | ${'foo'}
        ${'string'}              | ${'f1.f2'} | ${{ f1: { f2: 'foo' } }}             | ${'foo'}
        ${'integer'}             | ${'f1'}    | ${{ f1: 1 }}                         | ${1}
        ${'boolean'}             | ${'f1'}    | ${{ f1: true }}                      | ${'Y'}
        ${'boolean'}             | ${'f1'}    | ${{ f1: false }}                     | ${'N'}
        ${'decimal'}             | ${'f1'}    | ${{ f1: 5 }}                         | ${'5.000'}
        ${'decimal'}             | ${'f1'}    | ${{ f1: 5.0001 }}                    | ${'5.000'}
        ${'decimal'}             | ${'f1'}    | ${{ f1: 5.9999 }}                    | ${'6.000'}
        ${'currency'}            | ${'f1'}    | ${{ f1: 5 }}                         | ${'$5.00'}
        ${'date'}                | ${'f1'}    | ${{ f1: '2019-11-01' }}              | ${'Nov 1, 2019'}
        ${'dateTime'}            | ${'f1'}    | ${{ f1: '2019-11-01T08:13:00.000' }} | ${'Nov 1, 2019 8:13 AM'}
        ${{ entityType: 'Foo' }} | ${'d'}     | ${{ d: { code: 'foo' } }}            | ${'bar'}
    `('$type', ({ type, path, row, expected }) => {
        it(`${JSON.stringify(row)} should be converted to ${expected}`, () => {
            const column: Column = Column.of({
                name: `${type} Column`,
                type,
                mapToTableDisplay: () => 'bar',
                apiFieldPath: path,
                decimalPlaces: 3,
            });

            expect(pipe.transform(row, column)).toEqual(expected);
        });
    });

    describe('Dereferencing', () => {
        describe('for simple field', () => {
            const column: Column = Column.of({ name: 'col', type: 'string', apiFieldPath: 'field.level1.level2' });
            it('should handle defined/non-null', () => {
                const row = { field: { level1: { level2: 'nestedValue' } } };

                expect(pipe.transform(row, column)).toEqual('nestedValue');
            });
            it('should handle null/undefined at root level', () => {
                const rowWithNull = { field: null };
                const rowWithUndefined = { field: undefined };

                expect(pipe.transform(rowWithNull, column)).toEqual(null);
                expect(pipe.transform(rowWithUndefined, column)).toEqual(undefined);
            });
            it('should handle null/undefined at mid level', () => {
                const rowWithNull = { field: { level1: null } };
                const rowWithUndefined = { field: { level1: undefined } };

                expect(pipe.transform(rowWithNull, column)).toEqual(null);
                expect(pipe.transform(rowWithUndefined, column)).toEqual(undefined);
            });
            it('should handle null/undefined at child level', () => {
                const rowWithNull = { field: { level1: { level2: null } } };
                const rowWithUndefined = { field: { level1: { level2: undefined } } };

                expect(pipe.transform(rowWithNull, column)).toEqual(null);
                expect(pipe.transform(rowWithUndefined, column)).toEqual(undefined);
            });
        });

        describe('for dropdown', () => {
            const column: DynamicDropdownColumn<{ code: string; description: string }> = DynamicDropdownColumn.of({
                name: 'col',
                type: { entityType: 'described' },
                apiFieldPath: 'field.level1.level2',
                fetchData: () => EMPTY,
                mapToTableDisplay: (d) => `${d.code} - ${d.description}`,
            });
            it('should handle defined/non-null', () => {
                const row = {
                    field: { level1: { level2: { code: 'code1', description: 'description1' } } },
                };

                expect(pipe.transform(row, column)).toEqual('code1 - description1');
            });
            it('should handle null/undefined at root level', () => {
                const rowWithNull = { field: null };
                const rowWithUndefined = { field: undefined };

                expect(pipe.transform(rowWithNull, column)).toEqual(null);
                expect(pipe.transform(rowWithUndefined, column)).toEqual(undefined);
            });
            it('should handle null/undefined at mid level', () => {
                const rowWithNull = { field: { level1: null } };
                const rowWithUndefined = { field: { level1: undefined } };

                expect(pipe.transform(rowWithNull, column)).toEqual(null);
                expect(pipe.transform(rowWithUndefined, column)).toEqual(undefined);
            });
            it('should handle null/undefined at child level', () => {
                const rowWithNull = { field: { level1: { level2: null } } };
                const rowWithUndefined = { field: { level1: { level2: undefined } } };

                expect(pipe.transform(rowWithNull, column)).toEqual(null);
                expect(pipe.transform(rowWithUndefined, column)).toEqual(undefined);
            });
        });
    });

    it('should handle dropdown dereferencing', () => {
        const row = {
            field: {
                level1: {
                    level2: {
                        code: 'code1',
                        description: 'description1',
                    },
                },
            },
        };
        const column: DynamicDropdownColumn<{ code: string; description: string }> = DynamicDropdownColumn.of({
            name: 'col',
            type: { entityType: 'described' },
            apiFieldPath: 'field.level1.level2',
            fetchData: () => EMPTY,
            mapToTableDisplay: (d) => `${d.code} - ${d.description}`,
        });
        expect(pipe.transform(row, column)).toEqual('code1 - description1');
    });
});
