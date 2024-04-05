import { isNumber } from './is-number';

describe.each`
    value            | result
    ${4}             | ${true}
    ${0}             | ${true}
    ${null}          | ${false}
    ${undefined}     | ${false}
    ${true}          | ${false}
    ${'string'}      | ${false}
    ${''}            | ${false}
    ${{ number: 4 }} | ${false}
`('isNumber', ({ value, result }) => {
    it(`should return ${result} if given value ${value}`, () => {
        expect(isNumber(value)).toEqual(result);
    });
});
