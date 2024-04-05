import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { likeDateTimeWithMillis, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { ProductAdjustmentApi } from './product-adjustment.api';

describe('ProductAdjustmentApi', () => {
    let http: HttpClient;
    let api: ProductAdjustmentApi;

    const path = '/v1/product-adjustments';

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'inventory-api',
                cors: true,
            },
            (interaction) => {
                const employeeResponseBody = {
                    id: string(),
                    name: string(),
                    firstName: string(),
                    lastName: string(),
                    version: integer(),
                };

                const storeWithCompany = {
                    id: integer(),
                    code: string(),
                    description: string(),
                    version: integer(),
                    company: {
                        id: integer(),
                        code: string(),
                        description: string(),
                        version: integer(),
                    },
                };

                const productAdjustmentMinimalResponseBody = {
                    id: integer(),
                    store: like(storeWithCompany),
                    type: likeDescribed(),
                    createdDate: likeDateTimeWithMillis(),
                    updatedOn: likeDateTimeWithMillis(),
                    updatedByEmployee: like(employeeResponseBody),
                    createdByEmployee: like(employeeResponseBody),
                };

                const productAdjustmentProductPK = {
                    lineNumber: integer(),
                    adjustmentNumber: integer(),
                };

                const productAdjustmentProductResponseBody = {
                    id: like(productAdjustmentProductPK),
                    unitOfMeasure: likeDescribed(),
                    adjustmentReason: likeDescribed(),
                    product: likeDescribed(),
                    quantity: integer(),
                    version: integer(),
                };

                const productAdjustmentFullResponseBody = {
                    id: integer(),
                    createdDate: likeDateTimeWithMillis(),
                    comments: string(),
                    type: likeDescribed(),
                    status: likeDescribed(),
                    store: like(storeWithCompany),
                    createdByEmployee: like(employeeResponseBody),
                    updatedByEmployee: like(employeeResponseBody),
                    updatedOn: likeDateTimeWithMillis(),
                    updatedBy: string(),
                    adjustmentProducts: eachLike(productAdjustmentProductResponseBody),
                };

                const existingAdjustmentID = 1000;
                const storeCode = '000000';
                const fullyProductAdjustmentState = `A fully populated adjustment product with number ${existingAdjustmentID} and storeCode ${storeCode}`;

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new ProductAdjustmentApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'createdDate,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'createdDate' } as any, 'desc'),
                    };

                    it('should return results for empty search', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyProductAdjustmentState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(productAdjustmentMinimalResponseBody),
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
                            api = new ProductAdjustmentApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for product adjustments with all search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'store.code',
                                dataType: 'string',
                                operator: '=',
                                values: [storeCode],
                            },
                            {
                                fieldPath: 'id',
                                dataType: 'integer',
                                operator: '=',
                                values: [`${existingAdjustmentID}`],
                            },
                            {
                                fieldPath: 'createdDate',
                                dataType: 'dateTime',
                                operator: 'after',
                                values: ['2020-08-31T01:01:01'],
                            },
                            {
                                fieldPath: 'type',
                                dataType: 'integer',
                                operator: '=',
                                values: ['1122'],
                            },
                            {
                                fieldPath: 'createdByEmployee.lastName',
                                dataType: 'string',
                                operator: 'starts-with',
                                values: ['JF'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyProductAdjustmentState }],
                            uponReceiving: `A request to search for product adjustments with restrictions: ${queryRestrictions
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
                            api = new ProductAdjustmentApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findById', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}`,
                        query: { adjustmentId: `${existingAdjustmentID}` },
                    };

                    it('should return the product adjustment', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `An adjustment with storeCode ${storeCode} and adjustmentId ${existingAdjustmentID} with non-null values and a product with non-null values`,
                                },
                            ],
                            uponReceiving: `A request to find a product adjustment with id: ${existingAdjustmentID}`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: productAdjustmentFullResponseBody,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductAdjustmentApi(`${mockServer.url}`, { http });
                            const response = await api.findByAdjustmentId(existingAdjustmentID).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                describe('finalize', () => {
                    interaction('new productAdjustment (POST)', ({ provider, execute }) => {
                        const request: V3Request = {
                            method: 'POST',
                            path: `${path}`,
                            headers: standardJsonHeaders(),
                        };

                        const adjustmentProductsRequestBody = {
                            product: {
                                id: 88,
                                code: 'PROD1',
                                description: 'TEST PRODUCT',
                            },
                            adjustmentReason: { id: 999, code: 'RSN1', description: 'TEST REASON' },
                            quantity: 100,
                        };

                        const productAdjustment = {
                            store: {
                                id: 444,
                                code: '101010',
                                description: 'TEST STORE',
                            },
                            comments: 'test',
                            adjustmentProducts: [adjustmentProductsRequestBody],
                        };

                        const productAdjustmentNegativeQuantity = {
                            store: {
                                id: 444,
                                code: '101010',
                                description: 'TEST STORE',
                            },
                            comments: 'test',
                            adjustmentProducts: [
                                {
                                    product: {
                                        id: 88,
                                        code: 'PROD1',
                                        description: 'TEST PRODUCT',
                                    },
                                    adjustmentReason: { id: 999, code: 'RSN1', description: 'TEST REASON' },
                                    quantity: -100,
                                },
                            ],
                        };

                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const statePositive =
                            'Store with id 444 and product with id 88, adjustment reason with id 999, UOM QUART exist and are active and with a positive quantity';
                        const stateNegative =
                            'Store with id 444, product with id 88, adjustment reason with id 999, UOM QUART exist and are active and with a negative quantity';
                        it('should be able to finalize with positive quantity', async () => {
                            provider.addInteraction({
                                states: [{ description: statePositive }],
                                uponReceiving: 'A request to finalize a new product adjustment',
                                withRequest: {
                                    ...request,
                                    body: productAdjustment,
                                },
                                willRespondWith: {
                                    status: 200,
                                    body: integer(),
                                },
                            });

                            await provider.executeTest(async (mockServer) => {
                                api = new ProductAdjustmentApi(`${mockServer.url}`, { http });
                                const response = await api.finalize(productAdjustment).toPromise();
                                expect(response).toBeTruthy();
                            });
                        });

                        it('should be able to finalize with negative quantity', async () => {
                            provider.addInteraction({
                                states: [{ description: stateNegative }],
                                uponReceiving: 'A request to finalize a new product adjustment with negative quantity',
                                withRequest: {
                                    ...request,
                                    body: { ...productAdjustmentNegativeQuantity },
                                },
                                willRespondWith: {
                                    status: 200,
                                    body: integer(),
                                },
                            });

                            await provider.executeTest(async (mockServer) => {
                                api = new ProductAdjustmentApi(`${mockServer.url}`, { http });
                                const response = await api.finalize(productAdjustmentNegativeQuantity).toPromise();
                                expect(response).toBeTruthy();
                            });
                        });
                    });
                });
            }
        );
    });

    describe('non-contract tests', () => {
        beforeEach(() => {
            api = new ProductAdjustmentApi(null, { http: null });
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });
    });
});
