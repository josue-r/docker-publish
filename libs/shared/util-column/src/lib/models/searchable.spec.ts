import { instanceOfDefaultSearch, instanceOfSearchable } from './searchable';

describe('Searchable', () => {
    describe.each`
        testObj  | expected
        ${true}  | ${false}
        ${false} | ${false}
        ${{}}    | ${true}
    `('instanceOfSearchable', ({ testObj, expected }) => {
        it(`${testObj} should ${expected ? '' : 'not '}be identified as an instance of Searchable`, () => {
            expect(instanceOfSearchable(testObj)).toBe(expected);
        });
    });

    describe.each`
        testObj  | expected
        ${true}  | ${false}
        ${false} | ${false}
        ${{}}    | ${true}
    `('instanceOfDefaultSearch', ({ testObj, expected }) => {
        it(`${testObj} should ${expected ? '' : 'not '}be identified as an instance of DefaultSearch`, () => {
            expect(instanceOfDefaultSearch(testObj)).toBe(expected);
        });
    });
});
