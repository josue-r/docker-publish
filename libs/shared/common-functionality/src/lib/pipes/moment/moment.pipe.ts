import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';
import { formatMoment } from '../../functions/format-moment';

/**
 * Providing a pipe to format Moments. Meant to be similar to the "DatePipe" angular provides.
 */
@Pipe({ name: 'moment' })
export class MomentPipe implements PipeTransform {
    transform(value: Moment | string, dateOnly = false): string {
        return formatMoment(value, dateOnly);
    }
}
