import * as moment from 'moment';
import { Moment } from 'moment';

/** Function to format date strings and Moment objects. Used by the MomentPipe. */
export function formatMoment(value: string | Moment, dateOnly = false): string {
    if (!value) {
        return null;
    } else if (dateOnly) {
        // Ex: "Sep 4, 1986". This should match `MAT_MOMENT_DATE_FORMATS.display.dateInput` to be consistent with date pickers
        return moment(value).format('ll');
    } else {
        // Ex: "Sep 4, 1986 8:30 PM". See https://momentjs.com/docs/#/displaying/format/
        return moment(value).format('lll');
    }
}
