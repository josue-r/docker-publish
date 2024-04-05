import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Comparators } from '@vioc-angular/shared/util-column';
import { likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';
import { Service } from '../src';
import { ServiceApi } from './service-api';

describe('ServiceApi', () => {
    let http: HttpClient;
    let api: ServiceApi;

    const path = '/v1/services';
    const serviceRequestBody: Service = {
        ...new Service(),
        id: 1874,
        code: 'S99',
        description: 'Service 1',
        version: 0,
        serviceCategory: { id: 3912 },
        serviceProducts: [{ defaultQuantity: 3, productCategory: { id: 4542 } }],
        active: true,
        requiresApproval: false,
        supportsQuickSale: true,
        supportsQuickInvoice: true,
        supportsRegularInvoice: true,
        supportsRefillInvoice: true,
        supportsTireCheckInvoice: true,
        updatedOn: String(),
        updatedBy: String(),
        supportsECommerce: false,
    };
    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'service-api',
                cors: true,
            },
            (interaction: JestDescribePactFnV3) => {
                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('add', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'POST',
                        path,
                        headers: standardJsonHeaders(),
                        body: {
                            ...serviceRequestBody,
                            id: null,
                        },
                    };
                    const state = 'service category with id 3912 and productCategory with id 4542 exist';

                    it('should add a service', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to add a service',
                            withRequest: { ...request, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: { status: 200 },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.add({ ...serviceRequestBody, id: null }).toPromise();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const state = 'services exist';
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        body: [],
                        query: { page: '0', size: '20', sort: 'code,asc' },
                    };
                    const serviceSearchRespondBody = {
                        code: string(),
                        description: string(),
                        id: integer(),
                        requiresApproval: boolean(),
                        serviceCategory: likeDescribed(),
                        supportsQuickInvoice: boolean(),
                        supportsQuickSale: boolean(),
                        supportsRefillInvoice: boolean(),
                        supportsRegularInvoice: boolean(),
                        supportsTireCheckInvoice: boolean(),
                        version: integer(),
                        active: boolean(),
                    };
                    it('should search for service with no search criteria', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a request to search for service with no criteria',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(serviceSearchRespondBody),
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
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api
                                .query({
                                    queryRestrictions: [],
                                    page: new QueryPage(0, 20),
                                    sort: new QuerySort({ apiSortPath: 'code' } as any, 'asc'),
                                } as QuerySearch)
                                .toPromise();
                        });
                    });
                    it('should accept all possible query restrictions', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'description',
                                dataType: 'string',
                                operator: Comparators.startsWith.value,
                                values: ['test'],
                            },
                            {
                                fieldPath: 'serviceProducts.productCategory',
                                dataType: 'productCategory',
                                operator: Comparators.equalTo.value,
                                values: [1470],
                            },
                            {
                                fieldPath: 'supportsQuickInvoice',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'supportsQuickSale',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'supportsRefillInvoice',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'supportsRegularInvoice',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'serviceCategory',
                                dataType: 'serviceCategory',
                                operator: Comparators.equalTo.value,
                                values: [1473],
                            },
                            {
                                fieldPath: 'code',
                                dataType: 'string',
                                operator: Comparators.startsWith.value,
                                values: ['OC'],
                            },
                            {
                                fieldPath: 'supportsTireCheckInvoice',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                        ];
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a request to search for all possible restrictions',
                            withRequest: { ...request, body: queryRestrictions },
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
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api
                                .query({
                                    queryRestrictions,
                                    page: new QueryPage(0, 20),
                                    sort: new QuerySort({ apiSortPath: 'code' } as any, 'asc'),
                                } as QuerySearch)
                                .toPromise();
                        });
                    });
                });

                interaction('findByCode', ({ provider, execute }) => {
                    const serviceProductResponseBody = {
                        id: {
                            serviceId: integer(),
                            productCategoryId: integer(),
                        },
                        defaultQuantity: integer(),
                        productCategory: likeDescribed(),
                        version: integer(),
                    };
                    const serviceRespondBody = {
                        code: string(),
                        description: string(),
                        id: integer(),
                        requiresApproval: boolean(),
                        serviceCategory: likeDescribed(),
                        serviceProducts: eachLike(serviceProductResponseBody),
                        supportsQuickInvoice: boolean(),
                        supportsQuickSale: boolean(),
                        supportsRefillInvoice: boolean(),
                        supportsRegularInvoice: boolean(),
                        supportsTireCheckInvoice: boolean(),
                        version: integer(),
                        active: boolean(),
                        updatedOn: string(),
                        updatedBy: string(),
                        supportsECommerce: boolean(),
                    };
                    const request: V3Request = {
                        method: 'GET',
                        path,
                        headers: { Accept: like('application/json') },
                        query: { code: serviceRequestBody.code },
                    };
                    const state = 'service with code S99 and service product exists with all non-null values';
                    it('should return services with the given code', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a request to find services by code',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: serviceRespondBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.findByCode(serviceRequestBody.code).toPromise();
                        });
                    });
                });
                interaction('serviceAssignedToAnyStore', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/serviceAssignedToAnyStores`,
                        headers: { Accept: like('application/json') },
                        query: { id: `${serviceRequestBody.id}` },
                    };
                    const state = 'service with id 1874 and all non-null values exists';

                    it('should check if the given service is assigned to any company or store', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to check if service is assigned',
                            withRequest: request,
                            willRespondWith: { status: 200, body: boolean() },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.isAssignedToAnyStores(serviceRequestBody).toPromise();
                        });
                    });
                });
                interaction('checkIfActiveAtStoreOrCompany', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/is-active-at-company-or-store`,
                        headers: { Accept: like('application/json') },
                        query: { id: `${serviceRequestBody.id}` },
                    };
                    const state = 'service with id 1874 and all non-null values exists';

                    it('should check if the given service is active to any company or store', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to check if service is active',
                            withRequest: request,
                            willRespondWith: { status: 200, body: boolean() },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.checkIfActiveAtStoreOrCompany(serviceRequestBody).toPromise();
                        });
                    });
                });
                interaction('findUsage', ({ provider, execute }) => {
                    const findUsageResponseBody = {
                        id: integer(),
                        description: string(),
                        companyResourceCount: integer(),
                        storeResourceCount: integer(),
                    };
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/usage`,
                        headers: standardJsonHeaders(),
                        body: [serviceRequestBody.id],
                    };
                    const state = 'service with id 1874 and all non-null values exists';

                    it('should return the usage of passed service ids', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to find the usage of service ids',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: eachLike(findUsageResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            const response = await api.findUsage([serviceRequestBody.id]).toPromise();
                            expect(response[0].description).toBeTruthy();
                            expect(response[0].companyResourceCount).toBeTruthy();
                            expect(response[0].storeResourceCount).toBeTruthy();
                        });
                    });
                });
                interaction('update', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'PUT',
                        path,
                        headers: standardJsonHeaders(),
                        body: serviceRequestBody,
                    };
                    const state =
                        'service with id 1874, service category with id 3912 and productCategory with id 4542 exist';
                    it('should update a service', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a service is updated',
                            withRequest: { ...request, query: { 'Content-Type': 'application/json' } },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.update(serviceRequestBody).toPromise();
                        });
                    });
                });
                interaction('activate', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'PATCH',
                        path: `${path}/activate`,
                        headers: standardJsonHeaders(),
                        body: [1, 2, 3, 4, 5],
                    };
                    const state = '';
                    it('should activate services with ids [1,2,3,4,5]', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'services are activated',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: integer(),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.activate([1, 2, 3, 4, 5]).toPromise();
                        });
                    });
                });
                interaction('deactivate', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'PATCH',
                        path: `${path}/deactivate`,
                        headers: standardJsonHeaders(),
                        body: [1, 2, 3, 4, 5],
                    };
                    const state = '';
                    it('should deactivate services with ids [1,2,3,4,5]', async () => {
                        await provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'services are deactivated',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: integer(),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.deactivate([1, 2, 3, 4, 5]).toPromise();
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
                    const state = '';
                    it('should datasync services with ids [1,2,3,4,5]', async () => {
                        await provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'services are datasync',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: integer(),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceApi(`${mockServer.url}`, { http });
                            await api.dataSync([1, 2, 3]).toPromise();
                        });
                    });
                });
            }
        );
    });
});
