import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { likeDateTimeWithMillis, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { NonInventoryItemApi } from './non-inventory-item.api';

describe('NonInventoryItemApi', () => {
    let http: HttpClient;
    let api: NonInventoryItemApi;

    const path = '/v1/non-inventory-items';

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'inventory-api',
                cors: true,
            },
            (interaction) => {
                const nonInventoryItemResponseBody = {
                    id: integer(),
                    company: likeDescribed(),
                    number: string(),
                    description: string(),
                    category: likeDescribed(),
                    uom: likeDescribed(),
                    active: boolean(),
                    updatedOn: likeDateTimeWithMillis(),
                };

                const existingItemNumber = '1000';
                const companyCode = '000000';
                const storeCode = '111111';
                const fullyNonInventoryItemState = `A fully populated non inventory item with itemNumber ${existingItemNumber} and companyCode ${companyCode}`;

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new NonInventoryItemApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'number,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'number' } as any, 'desc'),
                    };

                    it('should return results for empty search', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyNonInventoryItemState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(nonInventoryItemResponseBody),
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
                            api = new NonInventoryItemApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for non inventory order with search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'company.code',
                                dataType: 'string',
                                operator: '=',
                                values: [companyCode],
                            },
                            {
                                fieldPath: 'number',
                                dataType: 'string',
                                operator: '=',
                                values: [existingItemNumber],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyNonInventoryItemState }],
                            uponReceiving: `A request to search for non inventory item with restrictions: ${queryRestrictions
                                .map((q) => q.fieldPath)
                                .join()}`,
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(nonInventoryItemResponseBody),
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
                            api = new NonInventoryItemApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('getItemDetails', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: path,
                    };

                    const item: string[] = ['1000', '1001'];
                    const nonInventoryItemMinimalResponseBody = {
                        id: integer(),
                        company: likeDescribed(),
                        number: string(),
                        description: string(),
                        category: likeDescribed(),
                        uom: likeDescribed(),
                        maximumQuantity: integer(),
                        minimumQuantity: integer(),
                        quantityPerPack: integer(),
                        active: boolean(),
                        updatedOn: likeDateTimeWithMillis(),
                    };

                    const state =
                        'Fully populated non inventory items with itemNumbers 1000, 1001, and companyCode 000000';

                    it('should return successful message when finding a non inventory item', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: `A request to find non inventory item with companyCode: ${companyCode} and itemNumbers: ${item} `,
                            withRequest: {
                                ...request,
                                query: { companyCode, storeCode, item },
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(nonInventoryItemMinimalResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new NonInventoryItemApi(`${mockServer.url}`, { http });
                            const result = await api.getItemDetails(companyCode, storeCode, item).toPromise();
                            expect(result).toBeTruthy();
                        });
                    });
                });
            }
        );
    });

    describe('non-contract tests', () => {
        beforeEach(() => {
            api = new NonInventoryItemApi(null, { http: null });
            api.get = jest.fn();
            api.post = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('getItemDetails', () => {
            it('should delegate to GET method for Non Inventory Item', () => {
                const itemNumbers: string[] = ['54321', '12543'];
                api.getItemDetails('COMPANY', 'STORE', itemNumbers);
                expect(api.get).toHaveBeenCalledWith([], {
                    item: ['54321', '12543'],
                    companyCode: 'COMPANY',
                    storeCode: 'STORE',
                });
            });
        });
    });
});
