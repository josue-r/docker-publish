import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Params, Router } from '@angular/router';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
    let router: Router;
    let authenticationFacade: AuthenticationFacade;

    beforeEach(() => {
        router = { navigate: () => undefined } as any;
        authenticationFacade = {
            handleLoginRedirect: () => Promise.resolve('DONE'),
            login: () => Promise.resolve('DONE'),
            getLoginRedirect: (): { segments: string[]; queryParams: Params } => null,
            setLoginRedirect: () => {},
        } as any;
    });

    function createActivatedRoute(params: Params): ActivatedRoute {
        return { snapshot: { queryParamMap: convertToParamMap(params) } } as any;
    }

    describe('ngOnInit', () => {
        beforeEach(() => {
            jest.spyOn(authenticationFacade, 'handleLoginRedirect');
            jest.spyOn(authenticationFacade, 'login');
            jest.spyOn(router, 'navigate');
        });
        it('should trigger oidc login if no code passed as query parameter', fakeAsync(() => {
            new LoginComponent(authenticationFacade, createActivatedRoute({}), router).ngOnInit();
            flush();

            expect(authenticationFacade.login).toHaveBeenCalled();
            expect(authenticationFacade.handleLoginRedirect).not.toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
        }));

        describe('when authorization code present', () => {
            it('should handle the authorization code and navigate to requested url when present', fakeAsync(() => {
                const segments = ['foo', 'bar'];
                const queryParams: Params = { baz: 'qux' };
                jest.spyOn(authenticationFacade, 'getLoginRedirect').mockReturnValue({ segments, queryParams });
                jest.spyOn(authenticationFacade, 'setLoginRedirect').mockImplementation();

                new LoginComponent(
                    authenticationFacade,
                    createActivatedRoute({ code: 'some-auth-code' }),
                    router
                ).ngOnInit();
                flush();

                expect(authenticationFacade.login).not.toHaveBeenCalled();
                expect(authenticationFacade.handleLoginRedirect).toHaveBeenCalled();
                expect(authenticationFacade.setLoginRedirect).toHaveBeenCalledWith(null); // should clear
                expect(router.navigate).toHaveBeenCalledWith(segments, { queryParams });
            }));
            it('should handle the authorization code and navigate to home when not requested url', fakeAsync(() => {
                jest.spyOn(authenticationFacade, 'getLoginRedirect').mockReturnValue(null);

                new LoginComponent(
                    authenticationFacade,
                    createActivatedRoute({ code: 'some-auth-code' }),
                    router
                ).ngOnInit();
                flush();

                expect(authenticationFacade.login).not.toHaveBeenCalled();
                expect(authenticationFacade.handleLoginRedirect).toHaveBeenCalled();
                expect(router.navigate).toHaveBeenCalledWith(['/']);
            }));
        });

        it('should navigate to error route if error and description are set', fakeAsync(() => {
            const queryParams: Params = {
                error: 'some-error',
                error_description: 'some-error-description',
            };
            new LoginComponent(authenticationFacade, createActivatedRoute(queryParams), router).ngOnInit();
            flush();

            expect(authenticationFacade.login).not.toHaveBeenCalled();
            expect(authenticationFacade.handleLoginRedirect).not.toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['login-error'], {
                queryParams: {
                    error: 'some-error',
                    error_description: 'some-error-description',
                },
            });
        }));

        it('should navigate to error route with default error and description if query params present but none of the handled ones', fakeAsync(() => {
            new LoginComponent(authenticationFacade, createActivatedRoute({ foo: 'bar' }), router).ngOnInit();
            flush();

            expect(authenticationFacade.login).not.toHaveBeenCalled();
            expect(authenticationFacade.handleLoginRedirect).not.toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['login-error'], {
                queryParams: {
                    error: 'UNKNOWN',
                    error_description: 'An unknown error occurred',
                },
            });
        }));
    });
});
