import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

/** Used to restrict the valueChange event to a debounceTime, distinct value, and only when the user enters 4 digits for the `YearStart` and `YearEnd` fields. */
export function yearInputFilter(): MonoTypeOperatorFunction<any> {
    const integerRegex = /^\d{4}$/;
    return function filterOperatorFunction(source: Observable<number>): Observable<number> {
        return source.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            // pass null on because it's often a valid value
            filter((v) => isNullOrUndefined(v) || integerRegex.test(v.toString()))
        );
    };
}
