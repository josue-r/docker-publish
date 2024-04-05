import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, iso8601Date, like, string } from '@pact-foundation/pact/src/dsl/matchers';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { Comparators } from '@vioc-angular/shared/util-column';
import { likeApiErrorResponseWithDetails, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '../model/store.model';
import { StoreApi } from './store.api';

describe('StoreApi', () => {
    let http: HttpClient;
    let api: StoreApi;

    describe('non-contract tests', () => {
        beforeEach(() => {
            api = new StoreApi(null, { http: null });
            api.post = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('findByCode', () => {
            it('should delegate to the get method', () => {
                const storeCode = 'test';
                jest.spyOn(api, 'get').mockImplementation();
                api.findByCode(storeCode);
                expect(api.get).toHaveBeenCalledWith([], { code: storeCode });
            });
        });
    });

    const path = '/v1/stores';
    const dateFormat = 'YYYY-MM-dd';
    const dateLocale = 'en-Us';

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'organization-api',
                cors: true,
            },
            (interaction: JestDescribePactFnV3) => {
                const address = {
                    line1: string(),
                    line2: string(),
                    city: string(),
                    state: string(),
                    zip: string(),
                };

                const employee = {
                    id: string(),
                    firstName: string(),
                    lastName: string(),
                };

                const storeSearchResponseBody = {
                    id: integer(),
                    code: string(),
                    description: string(),
                    active: boolean(),
                    company: likeDescribed(),
                    region: likeDescribed(),
                    market: likeDescribed(),
                    area: likeDescribed(),
                    address: like(address),
                    phone: string(),
                    fax: string(),
                    emergencyPhone: string(),
                    bayCount: integer(),
                    storeOpenDate: iso8601Date(),
                    storeCloseDate: iso8601Date(),
                    manager: like(employee),
                    oilChangePrice: integer(),
                    currentStore: likeDescribed(),
                    marketingArea: likeDescribed(),
                    brand: likeDescribed(),
                    version: integer(),
                };

                const storeResponseBody = {
                    id: integer(),
                    code: string(),
                    description: string(),
                    active: boolean(),
                    company: likeDescribed(),
                    region: likeDescribed(),
                    market: likeDescribed(),
                    area: likeDescribed(),
                    address: like(address),
                    phone: string(),
                    fax: string(),
                    emergencyPhone: string(),
                    bayCount: integer(),
                    storeOpenDate: iso8601Date(),
                    storeCloseDate: iso8601Date(),
                    manager: like(employee),
                    oilChangePrice: integer(),
                    currentStore: likeDescribed(),
                    marketingArea: likeDescribed(),
                    brand: likeDescribed(),
                    version: integer(),
                    latitude: integer(),
                    longitude: integer(),
                    locationDirections: string(),
                    communitiesServed: string(),
                };

                const storeRequestBody = {
                    ...new Store(),
                    id: 999,
                    version: 0,
                    latitude: 0,
                    longitude: 0,
                    locationDirections: 'Turn right after the sign',
                    communitiesServed: 'test communitiesServed',
                };

                const storeCode = '000000';
                const fullyPopulatedStoreState = `A fully populated store with storeCode ${storeCode}`;
                const fullyPopulatedState = 'A fully populated store with id 999 exists';

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'code,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'code' } as any, 'desc'),
                    };

                    it('should return results for empty search', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedStoreState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(storeSearchResponseBody),
                                    page: {
                                        size: integer(),
                                        totalElements: integer(),
                                        totalPages: integer(),
                                        number: integer(),
                                    },
                                },
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for store with all search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'code',
                                dataType: 'string',
                                operator: '=',
                                values: [storeCode],
                            },
                            {
                                fieldPath: 'address.city',
                                dataType: 'string',
                                operator: '=',
                                values: ['Delhi'],
                            },
                            {
                                fieldPath: 'address.state',
                                dataType: 'string',
                                operator: '=',
                                values: ['MN'],
                            },
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyPopulatedStoreState }],
                            uponReceiving: `A request to search for store with restrictions: ${queryRestrictions
                                .map((q) => q.fieldPath)
                                .join()}`,
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: [],
                                    page: {
                                        size: integer(),
                                        totalElements: integer(),
                                        totalPages: integer(),
                                        number: integer(),
                                    },
                                },
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findByCode', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path,
                        query: { code: `${storeCode}` },
                    };
                    it('should return the store with the given code', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedStoreState }],
                            uponReceiving: `A request to find a store with code: ${storeCode}`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: storeResponseBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            const response = await api.findByCode(`${storeCode}`).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                interaction('datasync', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/datasync`,
                        headers: standardJsonHeaders(),
                        body: [1, 2, 3],
                    };
                    const state = 'stores with id 1, 2 and 3 exists';
                    it('should trigger datasync to stores and return the number of records datasynced', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a request to datasync ids [1,2,3]',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: integer(),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            await api.dataSync([1, 2, 3]).toPromise();
                        });
                    });
                });

                interaction('update', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PUT',
                        path,
                        headers: standardJsonHeaders(),
                        body: storeResponseBody,
                    };

                    it('should update the store', async () => {
                        // defines any pre-existing conditions that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensures that
                        // necessary relationships exist for the store to be properly updated
                        let updatedStore = { ...storeRequestBody, communitiesServed: 'updated test communitiesServed' };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedState }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update store',
                            withRequest: {
                                ...request,
                                body: updatedStore,
                                query: { 'Content-Type': 'application/json' },
                            },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.update(updatedStore).toPromise();
                        });
                    });

                    it('should give error when updating bad store', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that 300 a's as a communitiesServed will give an error on the api side
                        const body = { ...storeRequestBody, communitiesServed: 'a'.repeat(300) };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedState }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update a bad store',
                            withRequest: { ...request, body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', path),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            await api
                                .update(body)
                                .pipe(
                                    // catch the error so it doesn't fail the test
                                    catchError((error) => {
                                        // validate the error is an instance of apiErrorResponse. Ensures that the response provided
                                        // in the mock provider is actually being read in as an apiErrorResponse
                                        expect(instanceOfApiErrorResponse(error.error)).toBeTruthy();
                                        // don't rethrow the error
                                        return EMPTY;
                                    })
                                )
                                .toPromise();
                            // ensure the instance of assertion was done
                            expect.assertions(1);
                        });
                    });
                });

                interaction('update coordinates', ({ provider, execute }) => {
                    const coordinatesPath = path + '/coordinates';

                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PUT',
                        path: coordinatesPath,
                        headers: standardJsonHeaders(),
                        body: storeResponseBody,
                    };

                    let updatedStore = { ...storeRequestBody, latitude: 89, longitude: 180 };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensures that
                    // necessary relationships exist for the store to be properly updated

                    it('should update the coordinates', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedState }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update for latitude & longitude of store',
                            withRequest: {
                                ...request,
                                body: updatedStore,
                                query: { 'Content-Type': 'application/json' },
                            },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.update(updatedStore, ['coordinates']).toPromise();
                        });
                    });

                    it('should give error when updating bad coordinates in store', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that -100 as latitude and -200 as longitude will give an error on the api side
                        const body = { ...storeRequestBody, latitude: -100, longitude: -200 };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedState }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update for latitude & longitude of bad store',
                            withRequest: { ...request, body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', path),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });

                            await api
                                .update(body, ['coordinates'])
                                .pipe(
                                    // catch the error so it doesn't fail the test
                                    catchError((error) => {
                                        // validate the error is an instance of apiErrorResponse. Ensures that the response provided
                                        // in the mock provider is actually being read in as an apiErrorResponse
                                        expect(instanceOfApiErrorResponse(error.error)).toBeTruthy();
                                        // don't rethrow the error
                                        return EMPTY;
                                    })
                                )
                                .toPromise();
                            // ensure the instance of assertion was done
                            expect.assertions(1);
                        });
                    });
                });

                interaction('update location content', ({ provider, execute }) => {
                    const locationContentPath = path + '/location-content';

                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PUT',
                        path: locationContentPath,
                        headers: standardJsonHeaders(),
                        body: storeResponseBody,
                    };

                    let updatedStore = {
                        ...storeRequestBody,
                        locationDirections: 'Turn left and then turn right',
                        communitiesServed: 'Communities A and B',
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensures that
                    // necessary relationships exist for the store to be properly updated

                    it('should update the location content', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedState }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update for locationDirections and communitiesServed of store',
                            withRequest: {
                                ...request,
                                body: updatedStore,
                                query: { 'Content-Type': 'application/json' },
                            },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.update(updatedStore, ['location-content']).toPromise();
                        });
                    });

                    it('should give error when updating bad locationDirections and communitiesServed in store', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that 1030 a's as locationDirections and 300 b's as communitiesServed will give an error on the api side
                        const body = {
                            ...storeRequestBody,
                            locationDirections: 'a'.repeat(1030),
                            communitiesServed: 'b'.repeat(300),
                        };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedState }],
                            // a unique string identifying this interaction
                            uponReceiving:
                                'A request to update for locationDirections and communitiesServed of bad store',
                            withRequest: { ...request, body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', path),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreApi(`${mockServer.url}`, { http });
                            await api
                                .update(body, ['location-content'])
                                .pipe(
                                    // catch the error so it doesn't fail the test
                                    catchError((error) => {
                                        // validate the error is an instance of apiErrorResponse. Ensures that the response provided
                                        // in the mock provider is actually being read in as an apiErrorResponse
                                        expect(instanceOfApiErrorResponse(error.error)).toBeTruthy();
                                        // don't rethrow the error
                                        return EMPTY;
                                    })
                                )
                                .toPromise();
                            // ensure the instance of assertion was done
                            expect.assertions(1);
                        });
                    });
                });
            }
        );
    });
});
