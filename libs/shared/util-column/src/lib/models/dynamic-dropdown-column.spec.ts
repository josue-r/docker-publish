import { EMPTY } from 'rxjs';
import { DynamicDropdownColumn } from '../..';
import { DynamicDropdownConfig } from './dynamic-dropdown-config';

describe('DynamicDropdownColumn', () => {
    describe('defaults', () => {
        const name = 'Foo';
        describe.each`
            field                       | defaultValue           | overrideValue  | isFunction
            ${'minCharactersForSearch'} | ${0}                   | ${2}           | ${false}
            ${'maxCharactersForSearch'} | ${4}                   | ${6}           | ${false}
            ${'throttleMilliseconds'}   | ${0}                   | ${400}         | ${false}
            ${'hint'}                   | ${name}                | ${'Foo Code'}  | ${false}
            ${'mapToKey'}               | ${(o) => o.toString()} | ${() => 'Bar'} | ${true}
            ${'mapToDropdownDisplay'}   | ${(o) => o.toString()} | ${() => 'Bar'} | ${true}
        `('$field', ({ field, defaultValue, overrideValue, isFunction }) => {
            it(`should default to ${defaultValue} if not set`, () => {
                const column = DynamicDropdownColumn.of({
                    name,
                    apiFieldPath: 'foo',
                    type: 'string',
                    fetchData: () => EMPTY,
                });

                if (isFunction) {
                    expect(column[field]('foo')).toEqual(defaultValue('foo'));
                } else {
                    expect(column[field]).toEqual(defaultValue);
                }
            });

            it(`should not default if set to ${overrideValue}`, () => {
                const config: DynamicDropdownConfig<string> = {
                    name,
                    apiFieldPath: 'foo',
                    type: 'string',
                    fetchData: () => EMPTY,
                };
                config[field] = overrideValue;

                const column = DynamicDropdownColumn.of(config);

                if (isFunction) {
                    expect(column[field]('foo')).toEqual(overrideValue('foo'));
                } else {
                    expect(column[field]).toEqual(overrideValue);
                }
            });
        });
    });
});
