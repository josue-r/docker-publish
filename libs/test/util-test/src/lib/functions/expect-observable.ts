import { flush } from '@angular/core/testing';
import { Observable } from 'rxjs';

/**
 * Trigger an expectation around an observable value.  This requires the fakeAsyncZone.
 *
 * This method executes a "flush" so there is a potential side effect of flushing more than expected.
 *
 * @export
 * @template T
 * @param {Observable<T>} observable
 * @returns {jest.Matchers<T>}
 */
export function expectObservable<T>(observable: Observable<T>) {
    let value: T;
    const subscription = observable.subscribe((r) => (value = r));
    flush();
    subscription.unsubscribe();
    return expect(value);
}
