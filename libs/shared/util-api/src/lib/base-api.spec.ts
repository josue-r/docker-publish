import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Api } from './api';
import { ApiConfig } from './models/api-config';

class TestAPI extends Api<{ id: number }, number> {
    public withPaths = super.withPaths;
    constructor(config: ApiConfig) {
        super('http://localhost', config);
    }
}

describe('BaseApi', () => {
    let api: TestAPI;
    let httpMock: HttpTestingController;
    const params = new HttpParams().append('p1', 'v1');
    const headers = new HttpHeaders().append('h1', 'v2');

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });

        httpMock = TestBed.inject(HttpTestingController);
        api = new TestAPI({ http: TestBed.inject(HttpClient) });
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('get', () => {
        it(
            'should send a GET to the specified endpoint',
            waitForAsync(() => {
                api.get(['sub-path']).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path');
                expect(request.request.method).toBe('GET');
                expect(request.request.headers.keys.length).toEqual(0);
                request.flush({});
            })
        );
        it(
            'should handle custom headers & params',
            waitForAsync(() => {
                api.get(['sub-path'], params, headers).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path?p1=v1');
                expect(request.request.method).toBe('GET');
                expect(request.request.headers).toEqual(headers);
                request.flush({});
            })
        );
        it(
            'should send a GET for Blob to the specified endpoint',
            waitForAsync(() => {
                let expectedResult: ArrayBuffer = new ArrayBuffer(8);
                api.getBlob(['sub-path']).subscribe((data: any) => {
                    expectedResult = data;
                });
                const request = httpMock.expectOne('http://localhost/sub-path');
                expect(request.request.method).toBe('GET');
                expect(request.request.headers.keys.length).toEqual(0);
                expect(request.request.responseType).toEqual('arraybuffer');
                request.flush(expectedResult);
                httpMock.verify();
            })
        );
        it(
            'should handle custom headers & params for Blob data',
            waitForAsync(() => {
                let expectedResult: ArrayBuffer = new ArrayBuffer(8);
                api.getBlob(['sub-path'], params, headers).subscribe((data: any) => {
                    expectedResult = data;
                });
                const request = httpMock.expectOne('http://localhost/sub-path?p1=v1');
                expect(request.request.method).toBe('GET');
                expect(request.request.headers).toEqual(headers);
                expect(request.request.responseType).toEqual('arraybuffer');
                request.flush(expectedResult);
                httpMock.verify();
            })
        );
    });
    describe('post', () => {
        it(
            'should send a POST to the specified endpoint',
            waitForAsync(() => {
                api.post(['sub-path'], 'post-body').subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path');
                expect(request.request.method).toBe('POST');
                expect(request.request.headers.keys.length).toEqual(0);
                expect(request.request.body).toEqual('post-body');
                request.flush({});
            })
        );
        it(
            'should handle custom headers & params',
            waitForAsync(() => {
                api.post(['sub-path'], 'post-body', params, headers).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path?p1=v1');
                expect(request.request.method).toBe('POST');
                expect(request.request.headers).toEqual(headers);
                request.flush({});
            })
        );
    });
    describe('put', () => {
        it(
            'should send a PUT to the specified endpoint',
            waitForAsync(() => {
                api.put(['sub-path'], 'put-body').subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path');
                expect(request.request.method).toBe('PUT');
                expect(request.request.headers.keys.length).toEqual(0);
                expect(request.request.body).toEqual('put-body');
                request.flush({});
            })
        );
        it(
            'should handle custom headers & params',
            waitForAsync(() => {
                api.put(['sub-path'], 'put-body', params, headers).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path?p1=v1');
                expect(request.request.method).toBe('PUT');
                expect(request.request.headers).toEqual(headers);
                request.flush({});
            })
        );
    });
    describe('patch', () => {
        const patchBody = 'patchBody';
        it(
            'should send a PATCH to the specified endpoint',
            waitForAsync(() => {
                api.patch(['sub-path'], patchBody).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path');
                expect(request.request.method).toBe('PATCH');
                expect(request.request.headers.keys.length).toEqual(0);
                expect(request.request.body).toEqual(patchBody);
                request.flush({});
            })
        );
        it(
            'should handle custom headers & params',
            waitForAsync(() => {
                api.patch(['sub-path'], patchBody, params, headers).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path?p1=v1');
                expect(request.request.method).toBe('PATCH');
                expect(request.request.headers).toEqual(headers);
                request.flush({});
            })
        );
    });
    describe('delete', () => {
        it(
            'should send a DELETE to the specified endpoint',
            waitForAsync(() => {
                api.delete(['sub-path']).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path');
                expect(request.request.method).toBe('DELETE');
                expect(request.request.headers.keys.length).toEqual(0);
                request.flush({});
            })
        );
        it(
            'should handle custom headers & params',
            waitForAsync(() => {
                api.delete(['sub-path'], params, headers).subscribe();

                const request = httpMock.expectOne('http://localhost/sub-path?p1=v1');
                expect(request.request.method).toBe('DELETE');
                expect(request.request.headers).toEqual(headers);
                request.flush({});
            })
        );
    });
    it('should append paths', () => {
        expect(api.withPaths(['path1'])).toBe('http://localhost/path1');
        expect(api.withPaths(['path1', 'path2'])).toBe('http://localhost/path1/path2');
        expect(api.withPaths([])).toBe('http://localhost');
        expect(api.withPaths([''])).toBe('http://localhost/');
    });
});
