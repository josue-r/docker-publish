import { DynamicDropdownColumn, dynamicStringDropdown, errorThrowingDropdown } from '@vioc-angular/shared/util-column';
import { DropdownColumnState } from './dropdown-column.state';

describe('DropdownColumnState', () => {
    let state: DropdownColumnState;
    const columnD1 = DynamicDropdownColumn.of({
        ...dynamicStringDropdown,
        minCharactersForSearch: 2,
        maxCharactersForSearch: 3,
        dataCacheKey: 'd1',
    });
    const columnD2 = DynamicDropdownColumn.of({
        ...errorThrowingDropdown,
        minCharactersForSearch: 2,
        maxCharactersForSearch: 3,
        dataCacheKey: 'd2',
    });
    const columnUncached = DynamicDropdownColumn.of({
        ...dynamicStringDropdown,
        minCharactersForSearch: 2,
        maxCharactersForSearch: 3,
    });

    beforeEach(() => {
        state = new DropdownColumnState();
    });

    describe.each`
        col               | search    | expected
        ${columnD1}       | ${'TEST'} | ${['TEST1', 'TEST2']}
        ${columnD1}       | ${'ABC'}  | ${['ABC']}
        ${columnD2}       | ${'TEST'} | ${undefined}
        ${columnD2}       | ${'ABC'}  | ${['UVW', 'XYZ']}
        ${columnUncached} | ${'TEST'} | ${undefined}
        ${columnUncached} | ${'ABC'}  | ${undefined}
    `('cached value for', ({ col, search, expected }) => {
        beforeEach(() => {
            state.cache(columnD1, 'TEST', ['TEST1', 'TEST2']);
            state.cache(columnD1, 'ABC', ['ABC']);
            state.cache(columnD2, 'ABC', ['UVW', 'XYZ']);
            state.cache(columnUncached, 'TEST', ['TEST1', 'TEST2']);
        });
        it(`col.cacheKey=${col.dataCacheKey} with searchText=${search} should return ${expected}`, () => {
            expect(state.getCache(col, search)).toEqual(expected);
        });
    });

    describe('error handling', () => {
        it('should throw an error if attempting to cache without a column', () => {
            expect(() => state.cache(undefined, '', [])).toThrowError(
                'Must provide a column in order to cache results'
            );
        });
        it('should throw an error if attempting to cache without any results', () => {
            const testColumn1 = DynamicDropdownColumn.of({ ...dynamicStringDropdown });
            expect(() => state.cache(testColumn1, '', undefined)).toThrowError(
                'Must provide a results array to cache results'
            );
        });
    });
});
