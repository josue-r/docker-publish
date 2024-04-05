import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouterHistoryState {
    private readonly _routerHistory$ = new BehaviorSubject<string[]>([]);
    private _cachedRouterHistory: string[] = [];

    get routerHistory(): Observable<string[]> {
        return this._routerHistory$.asObservable();
    }

    get cachedRouterHistory(): string[] {
        return this._cachedRouterHistory;
    }

    constructor() {
        this._routerHistory$.subscribe((history) => (this._cachedRouterHistory = history));
    }

    updateRouterHistory(routerHistory: string[] = []): void {
        this._routerHistory$.next(routerHistory);
    }
}
