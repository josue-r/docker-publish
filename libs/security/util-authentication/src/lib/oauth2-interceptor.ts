import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This component needs to be moved to a shared feature and this rule is fixed
// tslint:disable-next-line: nx-enforce-module-boundaries
import { AuthenticationFacade, USER_MANAGER_SETTINGS_TOKEN } from '@vioc-angular/security/data-access-security';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { UserManagerSettings } from 'oidc-client-ts';
import { Observable, from } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

const localHostRegex = /^http[s]?:\/\/localhost:[\d]+\/.*$/;

/**
 * `HttpInterceptor` to update the request to include the bearer token if:
 * - The URL is pointing at the gateway or localhost
 * - The user is logged in
 */
@Injectable()
export class OAuth2Interceptor implements HttpInterceptor {
    private readonly logger = Loggers.get('util-authentication', 'OAuth2Interceptor');

    constructor(
        private readonly authenticationFacade: AuthenticationFacade,
        @Inject(GATEWAY_TOKEN) private readonly gateway: string,
        @Inject(USER_MANAGER_SETTINGS_TOKEN) private readonly userManagerSettings: UserManagerSettings
    ) {
        if (!gateway.endsWith('/')) {
            throw new Error(
                `The gateway (${gateway}) should end with a "/" character.  This is important because the intercept method uses ` +
                    "'request.url.startsWith(this.gateway)' to to prevent leaking the token to external APIs.  If we do not use this " +
                    'check, OAuth2Interceptor can be exploited if gateway is https://foo.us-east-1.elb.amazonaws.com and an external url ' +
                    'is https://foo.us-east-1.elb.amazonaws.com.malicious.domain.com.  Without the trailing /, the token would be leaked.'
            );
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.shouldAddToken(request.url)) {
            // If requesting one of our APIs, add the token
            return from(this.authenticationFacade.getToken()) //
                .pipe(
                    tap((token) => this.logger.debug('Intercepting', request.url, 'token=', token)),
                    mergeMap((token) => {
                        if (token) {
                            // If token present, include it
                            // If this throws an odd error like "TypeError: headers.set is not a function"
                            // Look at passing headers like `{headers: new HttpHeaders({ foo: 'bar' })}` instead of `{headers: { foo: 'bar' }}`
                            // This was an issue in testing.  If it's a real-world issue, please log a bug and we will find another solution,
                            // potentially by checking the type of the headers object
                            const headersWithToken = request.headers
                                .append('Authorization', `Bearer ${token}`)
                                .append('Central-Client', this.userManagerSettings.client_id);
                            return next.handle(request.clone({ headers: headersWithToken }));
                        } else {
                            return next.handle(request);
                        }
                    })
                );
        } else {
            // Don't include the token for other API calls
            return next.handle(request);
        }
    }

    /**
     * Should add the token if we are routing to the gateway or one of our API deployed to localhost.
     *
     * @param {string} url
     * @returns {boolean}
     * @memberof OAuth2Interceptor
     */
    shouldAddToken(url: string): boolean {
        return url.startsWith(this.gateway) || localHostRegex.test(url);
    }
}
