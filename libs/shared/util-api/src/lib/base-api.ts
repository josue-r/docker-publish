import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfig } from './models/api-config';

/**
 * Simple `HttpClient` wrapper to encapsulate common API calls and apply common error handling.  In most cases, you will want to extend
 * `Api` instead.  This may be useful in a situation where you want to call an external API.
 *
 * @export
 * @class BaseApi
 * @template TYPE
 */
export class BaseApi<TYPE extends { id?: any } | void> {
    // cannot be private to enable APIs to access default http methods
    readonly http: HttpClient;
    private readonly logger = Loggers.get('util-api', 'BaseApi');

    constructor(protected readonly apiUrl: string, config: ApiConfig) {
        this.http = config.http;
    }

    public get<T>(
        path: string[],
        httpParams?: HttpParams | { [param: string]: string | string[] },
        httpHeaders?: HttpHeaders | { [header: string]: string }
    ): Observable<T> {
        const url = this.withPaths(path);
        return this.http
            .get<T>(url, { headers: httpHeaders, params: httpParams })
            .pipe(this.errorHandler('GET', url, httpParams));
    }

    public getBlob<T>(
        path: string[],
        httpParams?: HttpParams | { [param: string]: string | string[] },
        httpHeaders?: HttpHeaders | { [header: string]: string }
    ): Observable<Blob> {
        const url = this.withPaths(path);
        return this.http
            .get<Blob>(url, { responseType: 'arraybuffer' as 'json', headers: httpHeaders, params: httpParams })
            .pipe(this.errorHandler('GET', url, httpParams));
    }

    public post<T>(
        path: string[],
        body: any | null,
        httpParams?: HttpParams | { [param: string]: string | string[] },
        httpHeaders?: HttpHeaders | { [header: string]: string }
    ): Observable<T> {
        const url = this.withPaths(path);
        return this.http
            .post<T>(url, body, { headers: httpHeaders, params: httpParams })
            .pipe(this.errorHandler('POST', url, httpParams));
    }

    public put(
        path: string[],
        body: any | null,
        httpParams?: HttpParams | { [param: string]: string },
        httpHeaders?: HttpHeaders | { [header: string]: string }
    ): Observable<Object> {
        const url = this.withPaths(path);
        return this.http
            .put(url, body, { headers: httpHeaders, params: httpParams })
            .pipe(this.errorHandler('PUT', url, httpParams));
    }

    public patch(
        path: string[],
        body: any | null,
        httpParams?: HttpParams | { [param: string]: string },
        httpHeaders?: HttpHeaders | { [header: string]: string }
    ): Observable<Object> {
        const url = this.withPaths(path);
        return this.http
            .patch(url, body, { headers: httpHeaders, params: httpParams })
            .pipe(this.errorHandler('PATCH', url, httpParams));
    }

    public delete(
        path: string[],
        httpParams?: HttpParams | { [param: string]: string },
        httpHeaders?: HttpHeaders | { [header: string]: string }
    ): Observable<Object> {
        const url = this.withPaths(path);
        return this.http
            .delete(url, { headers: httpHeaders, params: httpParams })
            .pipe(this.errorHandler('DELETE', url, httpParams));
    }

    protected errorHandler<T>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        url: string,
        params: HttpParams | { [param: string]: string | string[] }
    ): MonoTypeOperatorFunction<T> {
        return catchError((e) => {
            this.logger.error('Error making', method, 'request to:', url, 'params:', params, e);
            throw e;
        });
    }

    protected withPaths(paths: string[]) {
        return paths.length === 0 ? this.apiUrl : `${this.apiUrl}/${paths.join('/')}`;
    }
}
