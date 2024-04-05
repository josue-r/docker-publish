/**
 * Replacement for deprecated util/isNumber.
 *
 * Returns `true` if the passed object is of type number.
 */
export function isNumber(value: any): boolean {
    return typeof value === 'number';
}
