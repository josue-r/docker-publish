import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector, NgZone, Type } from '@angular/core';
import { getErrorMessage } from '@vioc-angular/central-ui/util-message';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { MessageFacade, UserMessage } from '@vioc-angular/shared/data-access-message';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { FORBIDDEN, NOT_FOUND, UNAUTHORIZED } from 'http-status-codes';
import { PotentialErrorLoopError } from './potential-error-loop.error';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly logger = Loggers.get('central-ui', 'GlobalErrorHandler');
    readonly repeatedErrorCount = 4; // fail on 5th consecutive error
    /**
     * If 5 errors occur withing this time period, assume it's an error loop and break out.
     *
     * 1 Second seems long, but it has to be long enough to handle a component not loading due to API failures, which take way longer than
     * injection failures.
     */
    readonly repeatedErrorLifespanMilliseconds = 1000;
    /** Keep track of the time codes for the past 5 errors. */
    readonly previousErrorTimes: number[] = [];

    constructor(private readonly injector: Injector) {}

    handleError(error: any, errorTimeUtcMilliseconds = new Date().valueOf()) {
        // Lazily fetch to cyclical dependencies
        const messageFacade = this.injector.get(MessageFacade as Type<MessageFacade>);
        const routerService = this.injector.get(RouterService as Type<RouterService>);
        const zone = this.injector.get(NgZone);
        // The error handler is running outside of the Angular zone,
        // this causes issues with displaying messages and routing.
        // Injecting the zone and forcing to run inside the Angular zone
        // https://github.com/angular/angular/issues/24727
        // This may need to be revisited if it causes issues or a better fix is found
        zone.run(() => {
            if (error instanceof PotentialErrorLoopError) {
                this.logger.error('Detected error loop. Navigating to error page').then(() => {
                    // TODO: It may be worth looking for a better way to ensure the component causing the error loop is properly
                    // destroyed while retaining the rest of the application's state.
                    routerService.destroyAndNavigateToPageCannotBeDisplayed();
                });
                return;
            }

            this.checkForErrorLoop(errorTimeUtcMilliseconds);
            if (error instanceof HttpErrorResponse) {
                this.handleHttpErrorResponse(error, messageFacade, routerService);
            } else if (this.checkInvalidUrlError(error)) {
                routerService.navigateToPageNotFound();
            } else {
                messageFacade.addMessage({ message: 'An unknown error occurred', severity: 'error' });
                this.logger.error('An unhandled error occurred', error);
            }
        });
    }

    /** Handle an error of type HttpErrorResponse */
    private handleHttpErrorResponse(error: any, messageFacade: MessageFacade, routerService: RouterService) {
        // Check for API errors first so they can return any status and still show the user messages
        if (error.error && instanceOfApiErrorResponse(error.error)) {
            this.handleApiErrorResponse(error, messageFacade);
        } else if (error.status === FORBIDDEN) {
            routerService.navigateToForbidden();
            this.logger.error('User is not allowed to access requested resource', error);
        } else if (error.status === UNAUTHORIZED) {
            routerService.navigateToLogin();
            this.logger.error('User is unauthenticated. Redirecting to login.', error);
        } else if (error.status === NOT_FOUND) {
            routerService.navigateToPageNotFound();
            this.logger.error('Resource was not found', error);
        } else {
            messageFacade.addMessage({ message: 'An unknown error occurred', severity: 'error' });
            this.logger.error('An unhandled error occurred', error);
        }
    }

    /** Handle a subtype of HttpErrorResponse error that our APIs return */
    private handleApiErrorResponse(error: any, messageFacade: MessageFacade) {
        let message: UserMessage;
        const apiErrorResponse = error.error;
        if (apiErrorResponse.error.errors) {
            apiErrorResponse.error.errors.forEach((e) => {
                message = getErrorMessage(e.messageKey, e.messageParams) as UserMessage;
                messageFacade.addMessage({ ...message, severity: 'error' });
            });
        } else {
            message = getErrorMessage(apiErrorResponse.error.messageKey) as UserMessage;
            messageFacade.addMessage({ ...message, severity: 'error' });
        }
        this.logger.error('An API error occurred', apiErrorResponse);
    }

    private checkInvalidUrlError(error: any): boolean {
        const unknownRoute = 'Cannot match any routes. URL Segment: ';
        const invalidUrlError = error.message && error.message.includes(unknownRoute);
        if (invalidUrlError) {
            const badPath = error.rejection.message.replace(unknownRoute, '');
            this.logger.error(`User has navigated to an unmapped path ${badPath}. Navigating to page not found.`);
        }
        return invalidUrlError;
    }

    private checkForErrorLoop(errorTimeUtcMilliseconds: number) {
        const earliestTime = errorTimeUtcMilliseconds - this.repeatedErrorLifespanMilliseconds;
        if (
            this.previousErrorTimes.length === this.repeatedErrorCount && // After n consecutive errors
            this.previousErrorTimes[this.previousErrorTimes.length - 1] > earliestTime // oldest tracked time is in the tracked duration
        ) {
            // assume error loop
            this.previousErrorTimes.length = 0; // Clear these so that we don't get stuck in a PotentialErrorLoopError loop
            throw new PotentialErrorLoopError(this.repeatedErrorCount, this.repeatedErrorLifespanMilliseconds);
        } else {
            // Add to front of array.  If array is too long now, trim it down
            if (this.previousErrorTimes.unshift(errorTimeUtcMilliseconds) > this.repeatedErrorCount) {
                this.previousErrorTimes.length = this.repeatedErrorCount;
            }
        }
    }
}
