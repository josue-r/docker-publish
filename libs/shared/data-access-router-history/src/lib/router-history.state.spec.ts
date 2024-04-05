import { fakeAsync, flush } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { RouterHistoryState } from './router-history.state';

describe('RouterHistoryState', () => {
    it('should update and cache history', fakeAsync(() => {
        const testHistory = ['/abc', '/123'];
        const state = new RouterHistoryState();
        state.updateRouterHistory(testHistory);
        state.routerHistory.pipe(take(1)).subscribe((history) => expect(history).toEqual(testHistory));
        flush();
        expect(state.cachedRouterHistory).toEqual(testHistory);
    }));
});
