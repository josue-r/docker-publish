import { Pipe, PipeTransform } from '@angular/core';
import { DynamicDropdownColumn } from '../../models/dropdown-column';

/**
 * Map a dropdown value to its proper display value. The format is expected
 * to already be configured in a passed DynamicDropdownColumn argument.
 */
@Pipe({ name: 'dropdownDisplay' })
export class DropdownDisplayPipe implements PipeTransform {
    transform(value: any, dropdownColumn: DynamicDropdownColumn<any>): string {
        // dropdownColumn gets passed as a string instead of dropdown if you type an invalid field into the auto-complete, meaning the
        //  dropdown is not present.  I'm not sure why this is the case or if it should be considered a bug
        return dropdownColumn.mapToDropdownDisplay && dropdownColumn.mapToDropdownDisplay(value);
    }
}
