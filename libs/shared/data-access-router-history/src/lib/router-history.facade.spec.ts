import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { RouterHistoryFacade } from './router-history.facade';
import { RouterHistoryState } from './router-history.state';

describe('RouterHistoryFacade', () => {
    const currentPage = '/current-page';
    const nextPage = '/next-page';
    let mockRouter: Router;
    let mockRouterEvents: Subject<any>;
    let mockRouterHistoryState: RouterHistoryState;
    let routerHistoryFacade: RouterHistoryFacade;

    beforeEach(() => {
        mockRouterEvents = new Subject<any>();
        mockRouter = ({
            url: currentPage,
            events: mockRouterEvents,
        } as unknown) as Router;
        mockRouterHistoryState = ({
            routerHistory: new BehaviorSubject<string[]>([]),
            cachedRouterHistory: [],
            updateRouterHistory: jest.fn(),
        } as unknown) as RouterHistoryState;
        routerHistoryFacade = new RouterHistoryFacade(mockRouterHistoryState, mockRouter);
    });

    it('should add the current url to the history', () => {
        expect(mockRouterHistoryState.updateRouterHistory).toHaveBeenCalledWith([currentPage]);
    });
    it('should listen for new routes to add to the history', () => {
        mockRouterHistoryState.cachedRouterHistory.push(currentPage);
        mockRouterEvents.next(new NavigationEnd(null, nextPage, null));
        expect(mockRouterHistoryState.updateRouterHistory).toHaveBeenCalledWith([currentPage, nextPage]);
    });

    describe('after constructed', () => {
        // Reseting mocks after constructor may have called them
        beforeEach(() => jest.clearAllMocks());

        it('should only listen for routes from a NavigationEnd event', () => {
            mockRouterHistoryState.cachedRouterHistory.push(currentPage);
            mockRouterEvents.next(new NavigationStart(null, nextPage));
            expect(mockRouterHistoryState.updateRouterHistory).not.toHaveBeenCalled();
        });
        it('should provide the router history state', () => {
            expect(routerHistoryFacade.getRouterHistory()).toEqual(mockRouterHistoryState.routerHistory);
        });
        describe('revertRouterHistory', () => {
            const addHistory = (...routes: string[]) =>
                routes.forEach((r) => mockRouterHistoryState.cachedRouterHistory.push(r));
            it('should revert history', () => {
                addHistory(currentPage, nextPage, 'test-page');
                routerHistoryFacade.revertRouterHistory(1);
                expect(mockRouterHistoryState.updateRouterHistory).toHaveBeenCalledWith([currentPage, nextPage]);
            });
            it('should default to 2', () => {
                addHistory(currentPage, nextPage, 'test-page');
                routerHistoryFacade.revertRouterHistory();
                expect(mockRouterHistoryState.updateRouterHistory).toHaveBeenCalledWith([currentPage]);
            });
            it('should not error if reverting and no history available', () => {
                routerHistoryFacade.revertRouterHistory(3);
                expect(mockRouterHistoryState.updateRouterHistory).toHaveBeenCalledWith([]);
            });
            it('should not error if attempting to revert more history than what is available', () => {
                addHistory(currentPage);
                routerHistoryFacade.revertRouterHistory(3);
                expect(mockRouterHistoryState.updateRouterHistory).toHaveBeenCalledWith([]);
            });
        });
        describe('getPreviousRoute', () => {
            it('should return a previous route if available', () => {
                mockRouterHistoryState.cachedRouterHistory.push(currentPage);
                mockRouterHistoryState.cachedRouterHistory.push(nextPage);
                expect(routerHistoryFacade.getPreviousRoute()).toEqual(currentPage);
            });
            it('should not return a previous route if not available', () => {
                expect(routerHistoryFacade.getPreviousRoute()).toBeUndefined();
                mockRouterHistoryState.cachedRouterHistory.push(currentPage);
                expect(routerHistoryFacade.getPreviousRoute()).toBeUndefined();
            });
        });
    });
});
