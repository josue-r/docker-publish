import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrUndefined } from '../../functions/is-null-or-undefined';

/**
 * Check if a collection object has any values.
 */
@Pipe({ name: 'hasData' })
export class HasDataPipe implements PipeTransform {
    transform(value: any): boolean {
        if (isNullOrUndefined(value)) {
            return false;
        } else if (Array.isArray(value)) {
            return value.length > 0;
        } else if (value instanceof Set || value instanceof Map) {
            return value.size > 0;
        } else {
            throw new Error('Unhandled value type passed to HasDataPipe');
        }
    }
}
