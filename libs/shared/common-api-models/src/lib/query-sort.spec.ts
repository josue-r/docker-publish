import { Column } from '@vioc-angular/shared/util-column';
import { QuerySort } from './query-sort';

describe('QuerySort', () => {
    const col = (config: { apiFieldPath: string; apiSortPath?: string }) => {
        return Column.of({ ...config, name: 'test', type: 'string' });
    };

    describe('sortParameter', () => {
        it.each`
            column                                              | direction    | expected
            ${col({ apiFieldPath: 'foo' })}                     | ${'asc'}     | ${'foo,asc'}
            ${col({ apiFieldPath: 'foo' })}                     | ${'desc'}    | ${'foo,desc'}
            ${col({ apiFieldPath: 'foo' })}                     | ${undefined} | ${'foo,asc'}
            ${col({ apiFieldPath: 'foo', apiSortPath: 'bar' })} | ${'asc'}     | ${'bar,asc'}
            ${col({ apiFieldPath: 'foo', apiSortPath: 'bar' })} | ${'desc'}    | ${'bar,desc'}
            ${col({ apiFieldPath: 'foo', apiSortPath: 'bar' })} | ${undefined} | ${'bar,asc'}
        `(`should be built from column and direction`, ({ column, direction, expected }) => {
            expect(new QuerySort(column, direction).sortParameter).toEqual(expected);
        });
    });
});
