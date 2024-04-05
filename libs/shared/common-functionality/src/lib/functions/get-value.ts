import { isNullOrUndefined } from './is-null-or-undefined';

/**
 * Determine the value of the column by derefrencing the object passed on the provided property path(delimited by '.')
 *
 * Examples:
 * `getValue({store: {area: {code:'areaCode'}}}, 'store.area.code')` returns 'areaCode'
 * `getValue({store: {area: null}}, 'store.area.code')` returns null
 * `getValue({store: {area: undefined}}, 'store.area.code')` returns undefined
 *
 * @param object
 * @param propertyPath
 */
export function getValue(object: any, propertyPath: string): any {
    let value = object;
    propertyPath.split('.').forEach((p) => {
        if (!isNullOrUndefined(value)) {
            value = value[p];
        }
    });
    return value;
}
