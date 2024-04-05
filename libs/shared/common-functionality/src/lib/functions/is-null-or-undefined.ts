/**
 * Replacement for deprecated util/isNullOrUndefined.
 *
 * Returns `true` if the passed object is null or undefined.
 */
export function isNullOrUndefined(obj: any): boolean {
    return typeof obj === 'undefined' || obj === null;
}
