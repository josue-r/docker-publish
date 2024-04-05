import { HttpEvent, HttpHandler, HttpHeaders, HttpRequest } from '@angular/common/http';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This component needs to be moved to a shared feature and this rule is fixed
// tslint:disable-next-line: nx-enforce-module-boundaries
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { UserManagerSettings } from 'oidc-client-ts';
import { EMPTY, Observable, of } from 'rxjs';
import { OAuth2Interceptor } from './oauth2-interceptor';

describe('OAuth2Interceptor', () => {
    let interceptor: OAuth2Interceptor;
    let authFacade: AuthenticationFacade;
    const gateWay = 'https://foo.us-east-1.elb.amazonaws.com/';
    const userManagerSettings: UserManagerSettings = { client_id: 'VIOCUI', redirect_uri: '', authority: '' };
    beforeEach(() => {
        authFacade = {
            getToken: () => {
                throw Error('getToken not mocked');
            },
        } as any;
        interceptor = new OAuth2Interceptor(authFacade, gateWay, userManagerSettings);
    });

    it('should create with valid gateway', () => {
        expect(() => new OAuth2Interceptor(null, gateWay, userManagerSettings)).not.toThrowError();
        expect(() => new OAuth2Interceptor(null, 'foo/', userManagerSettings)).not.toThrowError();
        expect(() => new OAuth2Interceptor(null, '/', userManagerSettings)).not.toThrowError();
    });

    it('should fail create with invalid gateway', () => {
        expect(
            () => new OAuth2Interceptor(null, 'https://foo.us-east-1.elb.amazonaws.com', userManagerSettings)
        ).toThrowError();
        expect(() => new OAuth2Interceptor(null, '', userManagerSettings)).toThrowError();
    });

    describe('shouldAddToken', () => {
        it('should return true if hitting gateway', () => {
            expect(interceptor.shouldAddToken(`${gateWay}foo/bar`)).toBeTruthy();
        });
        it('should return true if hitting localhost', () => {
            expect(interceptor.shouldAddToken(`http://localhost:8080/foo/bar`)).toBeTruthy();
            expect(interceptor.shouldAddToken(`https://localhost:8080/foo/bar`)).toBeTruthy();
        });
        it('should return false if hitting external url', () => {
            expect(interceptor.shouldAddToken(`http://google.com/foo/bar`)).toBeFalsy();
            expect(interceptor.shouldAddToken(`http://localhost.malicious.domain.com:8080/foo/bar`)).toBeFalsy();
            expect(interceptor.shouldAddToken(`http://localhost.malicious.domain.com/foo/bar`)).toBeFalsy();
            expect(
                interceptor.shouldAddToken(`https://foo.us-east-1.elb.amazonaws.com.malicious.domain.com/foo/bar`)
            ).toBeFalsy();
        });
    });

    describe('intercept', () => {
        class Handler extends HttpHandler {
            handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
                return of(undefined);
            }
        }
        const originalRequest: HttpRequest<any> = new HttpRequest(
            'GET',
            `${gateWay}foo`, //
            { headers: new HttpHeaders().append('foo', 'bar') }
        );

        it('should not add the bearer token if url is not supported', async () => {
            jest.spyOn(authFacade, 'getToken');
            jest.spyOn(interceptor, 'shouldAddToken').mockReturnValue(false);
            const handler: HttpHandler = new Handler();
            jest.spyOn(handler, 'handle');

            await interceptor.intercept(originalRequest, handler).toPromise();

            expect(interceptor.shouldAddToken).toHaveBeenCalled();
            expect(authFacade.getToken).not.toHaveBeenCalled(); // shouldAddToken should prevent this
            expect(handler.handle).toHaveBeenCalledWith(originalRequest);
        });

        it('should not add the bearer token if url is supported but not logged in', async () => {
            jest.spyOn(authFacade, 'getToken').mockReturnValue(Promise.resolve(null));
            jest.spyOn(interceptor, 'shouldAddToken').mockReturnValue(true);
            const handler: HttpHandler = new Handler();
            jest.spyOn(handler, 'handle');

            await interceptor.intercept(originalRequest, handler).toPromise();

            expect(interceptor.shouldAddToken).toHaveReturnedWith(true);
            expect(authFacade.getToken).toHaveBeenCalled();
            expect(handler.handle).toHaveBeenCalledWith(originalRequest);
        });

        it('should add the bearer token if authenticated and url is supported', async () => {
            const access_token = 'foo-bar-baz';
            jest.spyOn(authFacade, 'getToken').mockReturnValue(Promise.resolve(access_token));
            jest.spyOn(interceptor, 'shouldAddToken');
            const handler: HttpHandler = {
                handle: (req) => {
                    expect(req.headers.get('foo')).toEqual('bar');
                    expect(req.headers.get('Authorization')).toEqual(`Bearer ${access_token}`);
                    expect(req.headers.get('Central-Client')).toEqual('VIOCUI');
                    return EMPTY;
                },
            };

            await interceptor.intercept(originalRequest, handler).toPromise();

            expect(interceptor.shouldAddToken).toHaveReturnedWith(true);
            expect(authFacade.getToken).toHaveBeenCalled();
            expect.assertions(5); // handler(3) + 2 additional
        });
    });
});
