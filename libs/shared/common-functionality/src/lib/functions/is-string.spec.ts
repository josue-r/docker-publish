import { isString } from './is-string';

describe.each`
    value                | result
    ${'string'}          | ${true}
    ${''}                | ${true}
    ${null}              | ${false}
    ${undefined}         | ${false}
    ${4}                 | ${false}
    ${0}                 | ${false}
    ${true}              | ${false}
    ${{ string: 'abc' }} | ${false}
`('isString', ({ value, result }) => {
    it(`should return ${result} if given value ${value}`, () => {
        expect(isString(value)).toEqual(result);
    });
});
