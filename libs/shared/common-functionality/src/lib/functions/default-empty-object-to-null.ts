import { isNullOrUndefined } from './is-null-or-undefined';

/**
 * Iterates through an Object to checks its nested fields for null values.
 *
 * If all of the fields in the Object are null, then update the field of the Object to null.
 * If one or more of the fields are not null, then the field of the Object is not updated.
 */
export function defaultEmptyObjectToNull<T, K extends keyof T>(object: T, fields: K[]): void {
    const nestedValues = fields.map((field) => {
        const nestedField = object[field];
        const isObject = nestedField instanceof Object;
        // if the passed field is an object, check to see if it has nested objects
        if (isObject) {
            // default nested object fields
            defaultEmptyObjectToNull(nestedField, Object.keys(nestedField) as (keyof T[K])[]);
        }
        // Check if the nestedField is a string
        const isString = typeof nestedField === 'string';
        let isNull: boolean;
        if (isString) {
            // check if the field or nested fields are all empty strings
            isNull = !nestedField;
        } else {
            // check if the field or the nested fields are all null or undefined
            isNull =
                isNullOrUndefined(nestedField) ||
                (isObject && Object.keys(nestedField).every((key) => isNullOrUndefined(nestedField[key])));
        }
        return {
            field,
            value: isNull ? null : nestedField,
        };
    });
    // if all of the fields are null or undefined (and consist of all the fields in the object) set the object to null
    fields.forEach((field) => {
        const nestedField = nestedValues.find((f) => f.field === field);
        object[field] = nestedField.value;
    });
}
