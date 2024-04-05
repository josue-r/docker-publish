import { Inject, Injectable, InjectionToken, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { ReplaySubject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { GoogleAnalyticsEvent } from './models/google-analytics-event';

/** Should be provided with the forRoot module function. */
export const GA_TRACKING_ID = new InjectionToken<string>('GA_TRACKING_ID');

/** Reference to the global ga function that the script in the constructor creates. */
declare var ga: Function;

@Injectable()
export class GoogleAnalyticsService implements OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);
    private readonly logger = Loggers.get('util-google-analytics', 'GoogleAnalyticsService');

    /** Wrapper function around the global ga function. Ensures it was created properly. */
    private readonly _gaWrapperFn = (action: string, type: string, arg: any = null) => {
        if (typeof ga === 'function') {
            this.logger.debug('Sending data to google analytics:', action, type, arg);
            ga(action, type, arg);
        } else {
            this.logger.error('Unable to send analytics - google analytics script did not append properly.');
        }
    };

    /**
     * This is meant to be a singleton. Once it is created for the first time, the GA code will get inserted
     * into the page and a subscription will be added to send page hits on navigation end.
     */
    constructor(
        @Optional() @SkipSelf() existingSingleton: GoogleAnalyticsService,
        router: Router,
        @Optional() @Inject(GA_TRACKING_ID) gaTrackingId: string
    ) {
        throwIfAlreadyLoaded(existingSingleton, 'GoogleAnalyticsService');
        if (gaTrackingId) {
            try {
                this.logger.debug('Appending google analytics script.');
                const script = document.createElement('script');
                script.innerHTML = `
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                    ga('create', '${gaTrackingId}', 'auto');
                `;
                document.head.appendChild(script);
            } catch (ex) {
                this.logger.error('Error appending google analytics script:', ex);
            }
            // Track page navigation
            router.events
                .pipe(
                    takeUntil(this._destroyed),
                    // Filtering non-NavigationEnd events and login urls. The login urls are important to be filtered
                    // because they can contain login information from ForgeRock that shouldn't be sent to Google.
                    filter((event) => event instanceof NavigationEnd && !event.urlAfterRedirects.startsWith('/login'))
                )
                .subscribe((event: NavigationEnd) => {
                    this._gaWrapperFn('set', 'page', event.urlAfterRedirects);
                    this._gaWrapperFn('send', 'pageview');
                });
        } else {
            this.logger.error('Not configuring Google Analytics. No Tracking ID provided.');
        }
    }

    /** Send an event hit to GA. These are special hit types that will require custom GA reports. */
    sendEvent(event: GoogleAnalyticsEvent): void {
        this._gaWrapperFn('send', 'event', event);
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
