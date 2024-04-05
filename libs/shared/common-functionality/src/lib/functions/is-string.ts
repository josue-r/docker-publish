/**
 * Replacement for deprecated util/isString.
 *
 * Returns `true` if the passed object is of type string.
 */
export function isString(value: any): boolean {
    return typeof value === 'string';
}
