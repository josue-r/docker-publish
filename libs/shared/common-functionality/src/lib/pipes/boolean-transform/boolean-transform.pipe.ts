import { Pipe, PipeTransform } from '@angular/core';

/**
 * Maps boolean values to string values yes `Y` and no `N`.
 * ````
 * true='Y'
 * false='N'
 * ````
 */
@Pipe({
    name: 'booleanTransform',
})
export class BooleanTransformPipe implements PipeTransform {
    transform(value: boolean): string {
        return value === true ? 'Y' : value === false ? 'N' : value;
    }
}
