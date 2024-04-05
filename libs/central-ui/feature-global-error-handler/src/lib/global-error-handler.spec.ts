import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { ApiDetailedError, ApiErrorResponse } from '@vioc-angular/shared/util-api';
import { GlobalErrorHandler } from './global-error-handler';
import { PotentialErrorLoopError } from './potential-error-loop.error';

const routerServiceStub = {
    navigateToForbidden: jest.fn(),
    navigateToPageNotFound: jest.fn(),
    navigateToPageCannotBeDisplayed: jest.fn(),
    destroyAndNavigateToPageCannotBeDisplayed: jest.fn(),
    navigateToDashboard: jest.fn(),
    back: jest.fn(),
    navigateToLogin: jest.fn(),
};
const messageFacadeStub = {
    addMessage: jest.fn(),
};
describe('GlobalErrorHandler', () => {
    let routerService: RouterService;
    let errorHandler: GlobalErrorHandler;
    let messageFacade: MessageFacade;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GlobalErrorHandler,
                { provide: MessageFacade, useValue: messageFacadeStub },
                { provide: RouterService, useValue: routerServiceStub },
            ],
        });
    });

    beforeEach(() => {
        routerService = TestBed.inject(RouterService);
        errorHandler = TestBed.inject(GlobalErrorHandler);
        messageFacade = TestBed.inject(MessageFacade);
        // prevent errors filling up console
        jest.spyOn(errorHandler['logger'], 'error').mockImplementation();
        jest.clearAllMocks(); // reset mocked functions
    });

    describe('Handling ApiErrorResponse', () => {
        const errorResponse = {
            apiVersion: '1.0.0',
            error: undefined,
        } as ApiErrorResponse;

        it('should handle ApiErrors before generic errors', () => {
            errorResponse.error = {
                uuid: '12',
                messageKey: 'error.order-api.orderNotFound',
                developerMessage: 'Order not found',
                status: '404',
                path: '/',
                timestamp: undefined,
            };

            errorHandler.handleError(new HttpErrorResponse({ error: errorResponse, status: 404 }));

            expect(routerService.navigateToPageNotFound).not.toHaveBeenCalled();
            expect(messageFacade.addMessage).toHaveBeenCalledWith({
                message: 'Order not found',
                severity: 'error',
                hasTimeout: true,
            });
        });

        it('should handle ApiErrors', () => {
            errorResponse.error = {
                uuid: '12',
                messageKey: 'error.dataAccess',
                developerMessage: 'Data access error',
                status: '500',
                path: '/',
                timestamp: undefined,
            };

            errorHandler.handleError(new HttpErrorResponse({ error: errorResponse, status: 500 }));

            expect(messageFacade.addMessage).toHaveBeenCalledWith({
                message:
                    'Your request could not be processed, please contact the Help Desk for more details or assistance: error.dataAccess',
                severity: 'error',
                hasTimeout: false,
            });
        });

        it('should handle ApiDetailedErrors', () => {
            errorResponse.error = {
                uuid: '12',
                messageKey: 'error.constraintViolation',
                developerMessage: 'Integrity constraint violation',
                status: '400',
                path: '/',
                timestamp: undefined,
                errors: [
                    {
                        messageKey: 'error.fieldNotNullConstraint',
                        developerMessage: 'must not be null',
                        messageParams: ['code', null, 'NotNull'],
                    } as ApiDetailedError,
                ],
            };

            errorHandler.handleError(new HttpErrorResponse({ error: errorResponse, status: 400 }));

            expect(messageFacade.addMessage).toHaveBeenCalledWith({
                message: 'Code must not be null',
                severity: 'error',
                hasTimeout: true,
            });
        });
    });

    const verifyHttpErrorRedirect = (status: 401 | 403 | 404, redirectFn: Function) => {
        errorHandler.handleError(new HttpErrorResponse({ status }));
        expect(redirectFn).toHaveBeenCalled();
        expect(messageFacade.addMessage).not.toHaveBeenCalled();
    };

    it('should navigate to "forbidden" on 403', () => {
        verifyHttpErrorRedirect(403, routerService.navigateToForbidden);
    });

    it('should navigate to "login" on 401', () => {
        verifyHttpErrorRedirect(401, routerService.navigateToLogin);
    });

    it('should navigate to "page not found" for 404', () => {
        verifyHttpErrorRedirect(404, routerService.navigateToPageNotFound);
    });

    it('should create generic error message for unhandled httpErrorResponse', () => {
        errorHandler.handleError(new HttpErrorResponse({}));

        expect(routerService.navigateToForbidden).not.toHaveBeenCalled();
        expect(routerService.navigateToPageNotFound).not.toHaveBeenCalled();
        expect(messageFacade.addMessage).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should create generic error message for unhandled error', () => {
        errorHandler.handleError(new Error());

        expect(routerService.navigateToForbidden).not.toHaveBeenCalled();
        expect(routerService.navigateToPageNotFound).not.toHaveBeenCalled();
        expect(messageFacade.addMessage).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should handle PotentialErrorLoopError', fakeAsync(() => {
        jest.spyOn(errorHandler['logger'], 'error').mockReturnValueOnce(Promise.resolve());
        errorHandler.previousErrorTimes.length = 0;
        errorHandler.previousErrorTimes.fill(1000, 0, 4);

        errorHandler.handleError(new PotentialErrorLoopError(4, 1000), 1001);
        flush();

        // error count should be cleared
        expect(errorHandler.previousErrorTimes).toHaveLength(0);
        // Should navigate to /error
        expect(routerService.destroyAndNavigateToPageCannotBeDisplayed).toHaveBeenCalledTimes(1);
    }));

    it('should keep a running list of error times', () => {
        expect(errorHandler.previousErrorTimes).toHaveLength(0); // Precondition
        errorHandler.handleError(new Error(), 1000);
        expect(errorHandler.previousErrorTimes).toEqual([1000]);
        errorHandler.handleError(new Error(), 2000);
        expect(errorHandler.previousErrorTimes).toEqual([2000, 1000]);
        errorHandler.handleError(new Error(), 3000);
        errorHandler.handleError(new Error(), 4000);
        errorHandler.handleError(new Error(), 5000);
        expect(errorHandler.previousErrorTimes).toEqual([5000, 4000, 3000, 2000]); // 1000 rolls off
    });

    describe('error loops', () => {
        it('should be detected if error threshold is reached in the configured period', () => {
            expect(errorHandler.previousErrorTimes).toHaveLength(0); // Precondition
            errorHandler.handleError(new Error(), 1000);
            errorHandler.handleError(new Error(), 1200);
            errorHandler.handleError(new Error(), 1400);
            errorHandler.handleError(new Error(), 1600);
            expect(errorHandler.previousErrorTimes).toHaveLength(4);

            // Should throw error since 1999 is less than a second away from 1000
            expect(() => errorHandler.handleError(new Error(), 1999)).toThrowError(
                'Detected error loop because 5 errors have occurred in the past 1000 milliseconds. Navigating to error page'
            );
            // should clear the error times
            expect(errorHandler.previousErrorTimes).toHaveLength(0);
        });

        it('should not be detected if the threshold is reached but NOT in the configured period', () => {
            expect(errorHandler.previousErrorTimes).toHaveLength(0); // Precondition
            errorHandler.handleError(new Error(), 1000);
            errorHandler.handleError(new Error(), 1200);
            errorHandler.handleError(new Error(), 1400);
            errorHandler.handleError(new Error(), 1600);

            // should not throw error since 2000 is a full second away from 1000
            expect(() => errorHandler.handleError(new Error(), 2000)).not.toThrowError();
            // should not have cleared the error times
            expect(errorHandler.previousErrorTimes).toHaveLength(4);
        });

        it('should handle invalid url errors', () => {
            errorHandler.handleError({
                message: "Uncaught (in promise): Error: Cannot match any routes. URL Segment: 'r'",
                rejection: { message: "Cannot match any routes. URL Segment: 'r'" },
            });

            expect(routerService.navigateToPageNotFound).toHaveBeenCalled();
        });
    });
});
