import { isNullOrUndefined } from './is-null-or-undefined';

/** Updates specified property of the passed object with the passed value if the current value is null or undefined. */
export function defaultIfNullOrUndefined<T, K extends keyof T>(object: T, property: K, value: T[K]): void {
    if (isNullOrUndefined(object[property])) {
        object[property] = value;
    }
}
