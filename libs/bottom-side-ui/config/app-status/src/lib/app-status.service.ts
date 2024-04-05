import { BehaviorSubject, Observable } from 'rxjs';
import { BaseStoreEvent } from '@vioc-angular/shared/common-event-models';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AppStatusService {
    private storeEventSubject$: BehaviorSubject<BaseStoreEvent> = new BehaviorSubject(null);

    getStoreEvent(): Observable<BaseStoreEvent> {
        return this.storeEventSubject$.asObservable().pipe(filter((evt) => evt instanceof BaseStoreEvent));
    }

    setStoreEvent(storeEvent: BaseStoreEvent) {
        this.storeEventSubject$.next(storeEvent);
    }
}
