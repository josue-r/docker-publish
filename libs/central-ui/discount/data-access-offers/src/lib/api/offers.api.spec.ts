import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, decimal, eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { likeApiErrorResponseWithDetails, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Offer } from '../model/offers.model';
import { OfferApi } from './offers.api';

describe('OfferApi', () => {
    let http: HttpClient;
    let api: OfferApi;

    const pathV1 = '/v1/discount-offers';
    const pathV2 = '/v2/discount-offers';

    describe('non-contract tests', () => {
        beforeEach(() => {
            api = new OfferApi(null, { http: null });
            api.get = jest.fn();
            api.post = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('findById', () => {
            it('should delegate to the GET method', () => {
                const id = '1';
                api.findById(id);
                expect(api.get).toHaveBeenCalledWith(['v1/discount-offers'], { id: id });
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
                const offerContent = {
                    name: string(),
                    shortText: string(),
                    longText: string(),
                    disclaimerShortText: string(),
                    disclaimerLongText: string(),
                    conditions: string(),
                };

                const discountOffer = {
                    id: string(),
                    name: string(),
                    amount: decimal(),
                    amountFormat: likeDescribed(),
                    discount: likeDescribed(),
                    offerContent: like(offerContent),
                    company: likeDescribed(),
                };

                const offerSearchResponseBody = {
                    id: integer(),
                    company: likeDescribed(),
                    store: likeDescribed(),
                    discount: likeDescribed(),
                    endDate: string(),
                    name: string(),
                    shortText: likeDescribed(),
                    discountOffer: like(discountOffer),
                    version: integer(),
                };

                const offerResponseBody = {
                    id: string(),
                    discount: like({
                        startDate: string(),
                        endDate: string(),
                        active: boolean(),
                        national: boolean(),
                        type: like({ code: string(), description: string() }),
                    }),
                    company: likeDescribed(),
                    name: string(),
                    amount: integer(),
                    amountFormat: likeDescribed(),
                    daysToExpire: integer(),
                    expirationDate: string(),
                    storeDiscounts: eachLike({ store: likeDescribed(), assigned: boolean() }),
                    offerContent: like({ id: integer(), name: string() }),
                    active: boolean(),
                    updatedBy: string(),
                    updatedOn: string(),
                    version: integer(),
                };

                const offerRequestBody: Offer = {
                    ...new Offer(),
                    amount: 500.0,
                    amountFormat: { id: 6897 },
                    id: '999',
                    store: { id: 123 },
                    company: { id: 111, code: 'VAL' },
                    version: 0,
                    discount: { id: '121', code: 'EPCA7' },
                    offerContent: { id: 121 },
                    active: true,
                    daysToExpire: 111,
                    name: 'absolute discount',
                    storeDiscounts: [{ store: { id: 123 } }],
                };

                const discountOfferId = '999';
                const discountCode = 'EPCA7';
                const fullyPopulatedOfferState = `A fully populated offer with discountCode ${discountCode} and discountOfferId ${discountOfferId}`;
                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new OfferApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${pathV2}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'discount.code,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'discount.code' } as any, 'desc'),
                    };

                    it('should return results for default search', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'discount.endDate',
                                dataType: 'date',
                                operator: 'after',
                                values: ['2022-08-01'],
                            },
                        ];
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedOfferState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: queryRestrictions as any,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(offerSearchResponseBody),
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
                            api = new OfferApi(`${mockServer.url}${pathV2}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for offer with all search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'company.code',
                                dataType: 'string',
                                operator: '=',
                                values: ['VAL'],
                            },
                            {
                                fieldPath: 'discount.code',
                                dataType: 'string',
                                operator: '=',
                                values: ['EPCA7'],
                            },
                            {
                                fieldPath: 'discount.description',
                                dataType: 'string',
                                operator: '=',
                                values: ['$7 OFF OC ANYTIME'],
                            },
                            {
                                fieldPath: 'discount.endDate',
                                dataType: 'date',
                                operator: 'after',
                                values: ['2022-08-10'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyPopulatedOfferState }],
                            uponReceiving: `A request to search for an offer with restrictions: ${queryRestrictions
                                .map((q) => q.fieldPath)
                                .join()}`,
                            withRequest: {
                                ...request,
                                body: queryRestrictions as any,
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
                            api = new OfferApi(`${mockServer.url}${pathV2}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findById', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: pathV1,
                        query: { id: `${discountOfferId}` },
                    };

                    it('should return the discount offer', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedOfferState }],
                            uponReceiving: `A request to find an offer with id: ${discountOfferId}`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: offerResponseBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferApi(`${mockServer.url}`, { http });
                            const response = await api.findById(`${discountOfferId}`).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                interaction('update', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PUT',
                        path: pathV1,
                        headers: standardJsonHeaders(),
                        body: offerRequestBody as any,
                    };
                    const updateOffer = { ...offerRequestBody, name: 'total discount' };

                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensures that
                    // necessary relationships exist for the offer to be properly updated
                    const state =
                        'An offer with id 999 exists, a national discount with id 121 exists, a company with id 111 exists';

                    it('should update the offer', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update an offer',
                            withRequest: {
                                ...request,
                                body: updateOffer as any,
                                query: { 'Content-Type': 'application/json' },
                            },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferApi(`${mockServer.url}${pathV1}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.update(updateOffer).toPromise();
                        });
                    });

                    it('should give error when updating bad offer', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that 0 as amount will give an error on the api side
                        const body = {
                            ...offerRequestBody,
                            id: '10',
                            amount: 0,
                        } as any;
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update a bad offer',
                            withRequest: { ...request, body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', pathV1) as any,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferApi(`${mockServer.url}${pathV1}`, { http });
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

                interaction('add', ({ provider, execute }) => {
                    // removing id property from the testObject
                    delete offerRequestBody['id'];
                    const offerToBeAdded = offerRequestBody;

                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'POST',
                        path: pathV1,
                        headers: standardJsonHeaders(),
                        body: offerToBeAdded as any,
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests.
                    const state = 'An offer with a discount with id 121 exists and a company with id 111 exists';

                    it('should add an offer', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to add an offer',
                            withRequest: { ...request, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: { status: 200 },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferApi(`${mockServer.url}${pathV1}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.add(offerToBeAdded).toPromise();
                        });
                    });

                    it('should give error when adding bad offer', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that 500 a's as a name will give an error on the api side
                        const body = { ...offerToBeAdded, name: 'a'.repeat(500) } as any;
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to add a bad offer',
                            withRequest: { ...request, body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', pathV1) as any,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new OfferApi(`${mockServer.url}${pathV1}`, { http });
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
                            // ensure the instance of assertion was done
                            expect.assertions(1);
                        });
                    });
                });
            }
        );
    });
});
