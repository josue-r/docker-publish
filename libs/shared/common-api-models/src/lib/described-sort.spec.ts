import { DescribedSort } from '@vioc-angular/shared/common-api-models';

describe('DescribedSort', () => {
    describe('constructor', () => {
        it.each([[[]], [null], [undefined]])('should error if not given a field to sort by', (fieldsArray) => {
            expect(() => new DescribedSort(fieldsArray)).toThrowError('Must supply an array of fields to sort by');
        });
    });

    describe('sortParameter', () => {
        it('should default to ascending', () => {
            const testSort = new DescribedSort(['id']);
            expect(testSort.sortParameter).toEqual('id,asc');
        });

        it('should support descending', () => {
            const testSort = new DescribedSort(['id'], 'desc');
            expect(testSort.sortParameter).toEqual('id,desc');
        });

        it('should support multiple fields', () => {
            const testSort = new DescribedSort(['description', 'id']);
            expect(testSort.sortParameter).toEqual('description,id,asc');
        });
    });
});
