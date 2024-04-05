import { instanceOfApiErrorResponse } from './api-error-response';

describe('instanceOfApiErrorResponse', () => {
    const validError = { apiVersion: 'v1', error: {} };
    it.each`
        input                   | isA
        ${validError}           | ${true}
        ${{ apiVersion: 'v1' }} | ${false}
        ${{ error: {} }}        | ${false}
        ${{ foo: 'bar' }}       | ${false}
        ${{}}                   | ${false}
        ${null}                 | ${false}
        ${undefined}            | ${false}
        ${'<html></html>'}      | ${false}
        ${false}                | ${false}
        ${true}                 | ${false}
        ${1}                    | ${false}
        ${0}                    | ${false}
        ${[]}                   | ${false}
        ${[validError]}         | ${false}
        ${() => validError}     | ${false}
    `(`should return $isA for $input`, ({ input, isA }) => {
        expect(instanceOfApiErrorResponse(input)).toBe(isA);
    });
});
