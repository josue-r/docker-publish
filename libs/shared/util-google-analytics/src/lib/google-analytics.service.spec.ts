import { fakeAsync, flush } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { GoogleAnalyticsService } from './google-analytics.service';

describe('GoogleAnalyticsService', () => {
    const routerEvents = new ReplaySubject<any>();
    const router = ({
        events: routerEvents,
    } as unknown) as Router;
    let gaService: GoogleAnalyticsService;
    const gaMock = jest.fn();

    beforeEach(() => {
        window['ga'] = gaMock; // mock the global ga function
        gaService = new GoogleAnalyticsService(null, router, 'test-key');
        gaMock.mockClear(); // Must be called after gaService is constructed to prevent recording other events in replay subject
    });

    it('should throw an error if there is an existing instance', () => {
        expect(() => new GoogleAnalyticsService(gaService, router, 'test-key2')).toThrow();
    });

    it('should not configure GA if no tracking id is provided', () => {
        const appendSpy = jest.spyOn(document.head, 'appendChild');
        // tslint:disable-next-line: no-unused-expression
        new GoogleAnalyticsService(null, router, undefined);
        expect(appendSpy).not.toHaveBeenCalled();
        // Ideally we'd like to verify that the error message was logged.  There's not a good way to do this because all of
        //  this work happens during the constructor, there's no way to spy on an object that is created in this constructor
    });

    describe('on page navigation', () => {
        it('should send page hits on navigation end', fakeAsync(() => {
            const expectedUrl = 'new-test-url';
            const navigationEnd = new NavigationEnd(null, 'test-url', expectedUrl);
            routerEvents.next(navigationEnd);
            flush();
            expect(gaMock).toHaveBeenCalledWith('set', 'page', expectedUrl);
            expect(gaMock).toHaveBeenCalledWith('send', 'pageview', null);
        }));
        it('should not send page hits on navigation start', fakeAsync(() => {
            const navigationStart = new NavigationStart(null, 'test-url');
            routerEvents.next(navigationStart);
            flush();
            expect(gaMock).not.toHaveBeenCalled();
        }));
        it('should not send login page hits', fakeAsync(() => {
            const navigationEnd = new NavigationEnd(null, 'test-url', '/login?code=abc123');
            routerEvents.next(navigationEnd);
            flush();
            expect(gaMock).not.toHaveBeenCalled();
        }));
    });

    describe('sendEvent', () => {
        const testEvent = {
            eventCategory: 'test-category',
            eventLabel: 'test-label',
            eventAction: 'test-action',
            eventValue: 7,
        };

        it('should be able to send event hits', () => {
            gaService.sendEvent(testEvent);
            expect(gaMock).toHaveBeenCalledWith('send', 'event', testEvent);
        });
        it('should log an error if the ga function was not created', () => {
            window['ga'] = undefined;
            const errorLogSpy = jest.spyOn(gaService['logger'], 'error');
            gaService.sendEvent(testEvent);
            expect(errorLogSpy).toHaveBeenCalledWith(
                'Unable to send analytics - google analytics script did not append properly.'
            );
        });
    });
});
