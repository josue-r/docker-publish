/**
 * A null/undefined check isn't sufficient because a control value can return as a blank string.
 */
export function isEmptyInputValue(value: any): boolean {
    // we don't check for string here so it also works with arrays
    return value == null || value.length === 0;
}
