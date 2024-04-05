import { Column } from './column';
import { ColumnConfig } from './column-config';
import { EnumType, ObjectType } from './column-type';

describe('Column', () => {
    describe('defaults', () => {
        describe.each`
            field                   | defaultValue           | overrideValue  | isFunction | apiFieldPath
            ${'displayable'}        | ${true}                | ${false}       | ${false}   | ${'foo'}
            ${'displayedByDefault'} | ${true}                | ${false}       | ${false}   | ${'foo'}
            ${'apiSortPath'}        | ${'foo'}               | ${'foo'}       | ${false}   | ${'foo'}
            ${'mapToTableDisplay'}  | ${(o) => o.toString()} | ${() => 'bar'} | ${true}    | ${'foo'}
            ${'searchable'}         | ${true}                | ${false}       | ${false}   | ${'foo'}
            ${'gridUpdatable'}      | ${true}                | ${false}       | ${false}   | ${'foo'}
            ${'gridUpdatable'}      | ${false}               | ${true}        | ${false}   | ${'foo.bar'}
            ${'nullable'}           | ${false}               | ${true}        | ${false}   | ${'foo'}
            ${'decimalPlaces'}      | ${2}                   | ${4}           | ${false}   | ${'foo'}
            ${'sortable'}           | ${true}                | ${false}       | ${false}   | ${'foo'}
            ${'columnStyleClass'}   | ${''}                  | ${false}       | ${false}   | ${'foo'}
        `('$field', ({ field, defaultValue, overrideValue, isFunction, apiFieldPath }) => {
            it(`should default to ${defaultValue} if not set, with apiFieldPath ${apiFieldPath}`, () => {
                const column = Column.of({ name: 'foo', apiFieldPath, type: 'string' });

                if (isFunction) {
                    expect(column[field]('foo')).toEqual(defaultValue('foo'));
                } else {
                    expect(column[field]).toEqual(defaultValue);
                }
            });

            it(`should not default if set to ${overrideValue}`, () => {
                const config: ColumnConfig = { name: 'foo', apiFieldPath, type: 'string' };
                config[field] = overrideValue;

                const column = Column.of(config);

                if (isFunction) {
                    expect(column[field]('foo')).toEqual(overrideValue('foo'));
                } else {
                    expect(column[field]).toEqual(overrideValue);
                }
            });
        });
    });

    describe.each`
        type                                   | expected
        ${'string'}                            | ${'string'}
        ${'date'}                              | ${'date'}
        ${'decimal'}                           | ${'decimal'}
        ${'integer'}                           | ${'integer'}
        ${'boolean'}                           | ${'boolean'}
        ${'currency'}                          | ${'decimal'}
        ${'dateTime'}                          | ${'dateTime'}
        ${{ entityType: 'foo' } as ObjectType} | ${{ entityType: 'foo' }}
        ${{ enum: 'bar' } as EnumType}         | ${{ enum: 'bar' }}
    `('getTopLevelType', ({ type, expected }) => {
        it(`should return ${expected} when type=${type}`, () => {
            const col = Column.of({ name: 'foo', apiFieldPath: 'foo', type });
            expect(col.getTopLevelType()).toEqual(expected);
        });
    });

    describe('isSearchedByDefault', () => {
        const config: ColumnConfig = { name: 'foo', apiFieldPath: 'foo', type: 'string' };

        // unset/default
        expect(Column.of(config).isSearchedByDefault).toBe(false);
        // not searchable
        expect(Column.of({ ...config, searchable: false }).isSearchedByDefault).toBe(false);
        // explicitly not searched by default
        expect(Column.of({ ...config, searchable: {} }).isSearchedByDefault).toBe(false);
        expect(Column.of({ ...config, searchable: { defaultSearch: undefined } }).isSearchedByDefault).toBe(false);
        expect(Column.of({ ...config, searchable: { defaultSearch: null } }).isSearchedByDefault).toBe(false);
        // searched by default
        expect(
            Column.of({ ...config, searchable: { defaultSearch: { comparator: {} as any } } }).isSearchedByDefault
        ).toBe(true);
    });

    describe('isRequired', () => {
        const config: ColumnConfig = { name: 'foo', apiFieldPath: 'foo', type: 'string' };

        // unset/default
        expect(Column.of(config).isRequired).toBe(false);
        // not searchable
        expect(Column.of({ ...config, searchable: false }).isRequired).toBe(false);
        // implicitly not required
        expect(Column.of({ ...config, searchable: { required: null } }).isRequired).toBe(false);
        expect(Column.of({ ...config, searchable: { required: undefined } }).isRequired).toBe(false);
        expect(Column.of({ ...config, searchable: {} }).isRequired).toBe(false);
        // explicitly not required
        expect(Column.of({ ...config, searchable: { required: false } }).isRequired).toBe(false);
        // searched by default
        expect(Column.of({ ...config, searchable: { defaultSearch: { comparator: {} as any } } }).isRequired).toBe(
            false
        );
    });
});
