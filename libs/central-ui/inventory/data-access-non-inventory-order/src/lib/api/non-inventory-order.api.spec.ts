import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import {
    acceptJsonHeader,
    likeDateTimeWithMillis,
    likeDescribed,
    standardJsonHeaders,
} from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { NonInventoryCatalog, NonInventoryOrder, NonInventoryOrderItem } from '../..';
import { NonInventoryOrderApi } from './non-inventory-order.api';

describe('NonInventoryOrderApi', () => {
    let http: HttpClient;
    let api: NonInventoryOrderApi;

    const path = '/v1/non-inventory-orders';
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

                const nonInventoryOrderMinimalResponseBody = {
                    store: like(storeWithCompany),
                    orderNumber: integer(),
                    orderDate: likeDateTimeWithMillis(),
                    status: likeDescribed(),
                    updatedOn: likeDateTimeWithMillis(),
                    updatedByEmployee: like(employeeResponseBody),
                    createdByEmployee: like(employeeResponseBody),
                };

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

                const nonInventoryItemProjection = {
                    id: like({
                        storeId: integer(),
                        orderNumber: integer(),
                        lineNumber: integer(),
                    }),
                    uom: likeDescribed(),
                    version: integer(),
                    quantity: integer(),
                    nonInventoryCatalog: like(nonInventoryItemMinimalResponseBody),
                };

                const nonInventoryOrderFullProjection = {
                    store: like(storeWithCompany),
                    orderNumber: integer(),
                    orderDate: likeDateTimeWithMillis(),
                    status: likeDescribed(),
                    updatedBy: string(),
                    updatedOn: likeDateTimeWithMillis(),
                    updatedByEmployee: like(employeeResponseBody),
                    createdByEmployee: like(employeeResponseBody),
                    comments: string(),
                    nonInventoryOrderItems: eachLike(nonInventoryItemProjection),
                };

                const existingOrderNumber = 1000;
                const storeCode = '000000';
                const fullyNonInventoryOrderState = `A fully populated non-inventory order with storeCode ${storeCode} and orderNumber ${existingOrderNumber}`;

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new NonInventoryOrderApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'orderDate,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'orderDate' } as any, 'desc'),
                    };

                    it('should return results for empty search', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyNonInventoryOrderState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(nonInventoryOrderMinimalResponseBody),
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
                            api = new NonInventoryOrderApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for non inventory order with search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'store.code',
                                dataType: 'string',
                                operator: '=',
                                values: [storeCode],
                            },
                            {
                                fieldPath: 'orderNumber',
                                dataType: 'integer',
                                operator: '=',
                                values: [`${existingOrderNumber}`],
                            },
                            {
                                fieldPath: 'orderDate',
                                dataType: 'dateTime',
                                operator: 'after',
                                values: ['2020-01-01T01:01:01'],
                            },
                            {
                                fieldPath: 'status',
                                dataType: 'integer',
                                operator: '=',
                                values: [2],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyNonInventoryOrderState }],
                            uponReceiving: `A request to search for non inventory order with restrictions: ${queryRestrictions
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
                            api = new NonInventoryOrderApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                const nonInventoryOrderState = `A non-inventory order with storeCode ${storeCode} and orderNumber ${existingOrderNumber}`;
                interaction('findNonInventoryOrder', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}`,
                        headers: acceptJsonHeader(),
                    };

                    it('should return non inventory order', async () => {
                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.

                        provider.addInteraction({
                            states: [{ description: nonInventoryOrderState }],
                            uponReceiving: 'A request for non inventory order',
                            withRequest: { ...request, query: { storeCode: '000000', orderNumber: '1000' } },
                            willRespondWith: {
                                status: 200,
                                body: like(nonInventoryOrderFullProjection),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new NonInventoryOrderApi(`${mockServer.url}`, { http });
                            const response = await api.findNonInventoryOrder('000000', '1000').toPromise();
                            expect(response.orderNumber).toBeTruthy();
                            expect(response.orderDate).toBeTruthy();
                        });
                    });
                });

                describe('finalize', () => {
                    interaction('new receipt (POST)', ({ provider, execute }) => {
                        const request: V3Request = {
                            method: 'POST',
                            path: `${path}`,
                            headers: standardJsonHeaders(),
                            query: { status: 'FINALIZED' },
                        };

                        const buildNewNonInventoryItem = (quantity = 2): NonInventoryOrderItem => ({
                            ...new NonInventoryOrderItem(),
                            quantity,
                            uom: { version: 2, description: 'EA', code: 'EACH', id: 5 },
                            nonInventoryCatalog: {
                                ...new NonInventoryCatalog(),
                                id: 88,
                                number: '1',
                                description: 'test',
                                quantityPerPack: 1,
                                minimumQuantity: 1,
                                maximumQuantity: 5,
                            },
                        });

                        const buildNewNonInventoryOrder = (
                            nonInventoryOrderItems = [buildNewNonInventoryItem()]
                        ): NonInventoryOrder => ({
                            ...new NonInventoryOrder(),
                            store: { version: 90, description: 'TEST STORE', id: 444, code: '000000' },
                            comments: 'test',
                            nonInventoryOrderItems,
                        });

                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the item to be properly created.
                        const state = 'A non-inventory order with storeId 444 and itemId 88 exist and are active';

                        it('should be able to finalize', async () => {
                            const nonInventoryOrder = buildNewNonInventoryOrder();
                            provider.addInteraction({
                                states: [{ description: state }],
                                uponReceiving: 'A request to finalize a new non inventory order',
                                withRequest: {
                                    ...request,
                                    body: nonInventoryOrder,
                                },
                                willRespondWith: {
                                    status: 200,
                                    body: like({ orderNumber: integer(), storeId: integer() }),
                                },
                            });
                            await provider.executeTest(async (mockServer) => {
                                api = new NonInventoryOrderApi(`${mockServer.url}`, { http });
                                const response = await api.finalizeSave(nonInventoryOrder).toPromise();
                                expect(response).toBeTruthy();
                            });
                        });
                    });

                    interaction('existing receipt (PUT)', ({ provider, execute }) => {
                        const request: V3Request = {
                            method: 'PUT',
                            path: `${path}`,
                            headers: standardJsonHeaders(),
                        };

                        const buildExistingNonInventoryItem = (quantity = 2): NonInventoryOrderItem => ({
                            ...new NonInventoryOrderItem(),
                            id: { storeId: 444, orderNumber: 123456, lineNumber: 1 },
                            quantity,
                            uom: { version: 2, description: 'EA', code: 'EACH', id: 5 },
                            nonInventoryCatalog: {
                                ...new NonInventoryCatalog(),
                                id: 88,
                                number: '1',
                                description: 'test',
                                quantityPerPack: 1,
                                minimumQuantity: 1,
                                maximumQuantity: 5,
                            },
                        });

                        const buildExistingNonInventoryOrder = (
                            nonInventoryOrderItems = [buildExistingNonInventoryItem()]
                        ): NonInventoryOrder => ({
                            ...new NonInventoryOrder(),
                            id: { storeId: 444, orderNumber: 123456 },
                            store: { version: 90, description: 'TEST STORE', id: 444, code: '000000' },
                            comments: 'test',
                            nonInventoryOrderItems,
                            version: 0,
                        });

                        // Defines a pre existing state that must be met for the tests to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the item to be properly created.
                        const existingNonInventoryOrderState =
                            'A non-inventory order with storeId 444, itemId 88 and orderNumber 123456 exists';

                        it('should be able to finalize', async () => {
                            const nonInventoryOrder = buildExistingNonInventoryOrder();
                            provider.addInteraction({
                                states: [{ description: existingNonInventoryOrderState }],
                                uponReceiving: 'A request to finalize an existing non inventory order',
                                withRequest: {
                                    ...request,
                                    body: nonInventoryOrder,
                                    query: { status: 'FINALIZED' },
                                },
                                willRespondWith: {
                                    status: 200,
                                },
                            });
                            await provider.executeTest(async (mockServer) => {
                                api = new NonInventoryOrderApi(`${mockServer.url}`, { http });
                                const response = await api.finalizeUpdate(nonInventoryOrder).toPromise();
                                expect(response).toBeNull();
                            });
                        });
                    });
                });
            }
        );
    });

    describe('non-contract tests', () => {
        beforeEach(() => {
            api = new NonInventoryOrderApi(null, { http: null });
            api.get = jest.fn();
            api.put = jest.fn();
            api.post = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('finalize', () => {
            it('should delegate to PUT method for existing Non inventory Order', () => {
                const nonInventoryOrder: NonInventoryOrder = { id: { storeId: 1, orderNumber: 12 }, store: { id: 1 } };
                api.finalizeUpdate(nonInventoryOrder);
                expect(api.put).toHaveBeenCalledWith([], nonInventoryOrder, {
                    status: 'FINALIZED',
                });
            });

            it('should delegate to POST method for  new Non inventory Order', () => {
                const nonInventoryOrder = { ...new NonInventoryOrder(), number: 'N000001', store: { id: 1 } };
                api.finalizeSave(nonInventoryOrder);
                expect(api.post).toHaveBeenCalledWith([], nonInventoryOrder, {
                    status: 'FINALIZED',
                });
            });
        });

        describe('findNonInventoryOrder', () => {
            it('should delegate to GET method for existing Non inventory Order', () => {
                const storeCode = 'VAL002';
                const orderNumber = 'NUM001';
                api.findNonInventoryOrder(storeCode, orderNumber);
                expect(api.get).toHaveBeenCalledWith([], {
                    storeCode: storeCode,
                    orderNumber: orderNumber,
                });
            });
        });
    });
});
