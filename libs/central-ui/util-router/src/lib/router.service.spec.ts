import { ActivatedRoute, Router } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { RouterHistoryFacade } from '@vioc-angular/shared/data-access-router-history';
import { RouterService } from './router.service';

describe('RouterService', () => {
    const mockRouter = ({
        navigate: jest.fn(),
        navigateByUrl: jest.fn(),
    } as unknown) as Router;
    const mockRouterHistoryFacade = ({
        getPreviousRoute: jest.fn(),
        revertRouterHistory: jest.fn(),
    } as unknown) as RouterHistoryFacade;
    const mockRoute = ({
        parent: jest.fn(),
    } as unknown) as ActivatedRoute;
    const routerService = new RouterService(mockRouter, mockRouterHistoryFacade);

    beforeEach(() => jest.clearAllMocks());

    it('should navigate to forbidden', () => {
        routerService.navigateToForbidden();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['forbidden']);
    });
    it('should navigate to page not found', () => {
        routerService.navigateToPageNotFound();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['error/page-not-found']);
    });
    it('should navigate to page cannot be displayed', () => {
        routerService.navigateToPageCannotBeDisplayed();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['error']);
    });
    describe('destroyAndNavigateToPageCannotBeDisplayed', () => {
        const windowOrig = window;
        // Deleting window object temporarily to allow href to be edited during test
        beforeAll(() => {
            delete window.location;
            window.location = ({ href: 'some initial url' } as unknown) as Location;
        });
        // Replace with original window object after tests
        afterAll(() => (window = windowOrig));
        it('should destroy and navigate to page cannot be displayed', () => {
            routerService.destroyAndNavigateToPageCannotBeDisplayed();
            expect(window.location.href).toEqual('/error');
        });
    });
    it('should navigate to navigate to dashboard', () => {
        routerService.navigateToDashboard();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['dashboard']);
    });
    describe('back', () => {
        it('should navigate back to the most recent url', () => {
            const previousPage = '/previous-page';
            jest.spyOn(mockRouterHistoryFacade, 'getPreviousRoute').mockReturnValueOnce(previousPage);
            routerService.back();
            expect(mockRouterHistoryFacade.revertRouterHistory).toHaveBeenCalled();
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(previousPage);
        });
        it("should not navigate back if there's no history", () => {
            routerService.back();
            expect(mockRouterHistoryFacade.revertRouterHistory).not.toHaveBeenCalled();
            expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
        });
    });
    it('should navigate to navigate to login', () => {
        routerService.navigateToLogin();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['login']);
    });

    it('should navigate to search Page of the route passed', () => {
        routerService.navigateToSearchPage(mockRoute);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['search'], {
            relativeTo: mockRoute.parent,
        });
    });
});
