import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { likeApiErrorResponseWithDetails, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OfferContent } from '../model/offer-content.model';
import { OfferContentApi } from './offer-content.api';

describe('OfferContentApi', () => {
    let http: HttpClient;
    let api: OfferContentApi;

    const path = '/v1/discount-offer-contents';

    const offerContentRequestBody: OfferContent = {
        ...new OfferContent(),
        id: 999,
        name: 'Premium Oil Change, 5qts.',
        active: true,
        version: 0,
        shortText: 'Short Text',
        longText: 'a'.repeat(1000),
        disclaimerShortText: 'Disclaimer Short Text',
        disclaimerLongText: 'd'.repeat(1000),
        conditions: 'Conditions',
    };

    describe('non-contract tests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            api = new OfferContentApi(null, { http: null });
            api.query = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('findActive', () => {
            it('should delegate to the get method', () => {
                jest.spyOn(api, 'get').mockImplementation();
                api.findActive();
                expect(api.get).toHaveBeenCalled();
            });
        });
    });

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'discount-api',
                cors: true,
            },
            (interaction: JestDescribePactFnV3) => {
                const offerContentSearchResponseBody = {
                    id: integer(),
                    name: string(),
                    shortText: string(),
                    active: boolean(),
                };

                const minimalOfferContentResponseBody = {
                    id: integer(),
                    name: string(),
                };

                const fullOfferContentResponseBody = {
                    id: integer(),
                    name: string(),
                    shortText: string(),
                    longText: string(),
                    disclaimerShortText: string(),
                    disclaimerLongText: string(),
                    active: boolean(),
                    conditions: string(),
                    version: integer(),
                    updatedOn: string(),
                    updatedBy: string(),
                };

                const fullyPopulatedOfferContentState = `A fully populated offer content`;
                const fullyPopulatedOfferContentStateByName = `A fully populated offer content with name as Premium Oil Change, 5qts. exists`;
                const activeFullyPopulatedOfferContentState = `A list of fully populated offer contents with active as true`;
                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new OfferContentApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });
                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'name,asc' },
                    };

                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'name' } as any, 'asc'),
                    };

                    it('should return results for default search', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedOfferContentState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(offerContentSearchResponseBody),
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
                            api = new OfferContentApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('active', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/active`,
                    };

                    it('should return results for all active', async () => {
                        provider.addInteraction({
                            states: [{ description: activeFullyPopulatedOfferContentState }],
                            uponReceiving: 'a request for active offer contents',
                            withRequest: { ...request },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(minimalOfferContentResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferContentApi(`${mockServer.url}`, { http });
                            const results = await api.findActive().toPromise();
                            expect(results[0].id).toBeTruthy();
                            expect(results[0].name).toBeTruthy();
                        });
                    });
                });

                interaction('findByName', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: path,
                    };

                    it('should return offer content with the given name', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedOfferContentStateByName }],
                            uponReceiving: 'a request for offer content with a given name',
                            withRequest: {
                                ...request,
                                query: { name: offerContentRequestBody.name },
                            },
                            willRespondWith: {
                                status: 200,
                                body: fullOfferContentResponseBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferContentApi(`${mockServer.url}`, { http });
                            const result = await api.findByName(offerContentRequestBody.name).toPromise();
                            expect(result).toBeTruthy();
                        });
                    });
                });

                interaction('update', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PUT',
                        path,
                        headers: standardJsonHeaders(),
                        body: offerContentRequestBody,
                    };
                    const updateOfferContent = { ...offerContentRequestBody, shortText: 'Test update offerContent' };

                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensures that
                    // necessary relationships exist for the offer content to be properly updated
                    const state = 'An offer content with id 999 exists';

                    it('should update the offer content', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update offer content',
                            withRequest: {
                                ...request,
                                body: updateOfferContent,
                                query: { 'Content-Type': 'application/json' },
                            },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferContentApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.update(updateOfferContent).toPromise();
                        });
                    });

                    it('should give error when updating bad offer content', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that a shortText that exceeds the allowed size will give an error on the api side
                        const body = { ...updateOfferContent, shortText: 'a'.repeat(1000) };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update a bad offer content',
                            withRequest: { ...request, body: body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', path),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferContentApi(`${mockServer.url}`, { http });
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
                            // ensure the instace of assertion was done
                            expect.assertions(1);
                        });
                    });
                });

                interaction('add', ({ provider, execute }) => {
                    // removing id property from the testObject
                    delete offerContentRequestBody['id'];
                    const offerContentToBeAdded = offerContentRequestBody;

                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'POST',
                        path,
                        headers: standardJsonHeaders(),
                        body: offerContentToBeAdded,
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests.
                    const state = 'A new offer content to be added';

                    it('should add a offer content', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to add a offer content',
                            withRequest: { ...request, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: { status: 200 },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferContentApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.add(offerContentToBeAdded).toPromise();
                        });
                    });

                    it('should give error when adding bad offer content', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that a shortText that exceeds the allowed size will give an error on the api side
                        const body = { ...offerContentToBeAdded, shortText: 'a'.repeat(1000) };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to add a bad offer content',
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
                            api = new OfferContentApi(`${mockServer.url}`, { http });
                            await api
                                .add(body)
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
                            // ensure the instace of assertion was done
                            expect.assertions(1);
                        });
                    });
                });
            }
        );
    });
});
