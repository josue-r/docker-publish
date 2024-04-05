import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { decimal, eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import {
    likeApiErrorResponseWithDetails,
    likeDateTimeWithMillis,
    likeDescribed,
    standardJsonHeaders,
} from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PhysicalInventoryApi } from './physical-inventory.api';
import { PhysicalInventoryCount } from '../model/physical-inventory-count.model';
import { PhysicalInventory } from '../model/physical-inventory.model';

describe('PhysicalInventoryApi', () => {
    let http: HttpClient;
    let api: PhysicalInventoryApi;

    const path = '/v1/physical-inventories';

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
                const physicalInventoryMinimalResponseBody = {
                    id: integer(),
                    store: likeDescribed(),
                    frequency: likeDescribed(),
                    status: likeDescribed(),
                    createdOn: likeDateTimeWithMillis(),
                    finalizedOn: likeDateTimeWithMillis(),
                    updatedOn: likeDateTimeWithMillis(),
                    updatedByEmployee: like(employeeResponseBody),
                    version: integer(),
                };
                const likeCode = like({
                    id: integer(),
                    code: string(),
                });
                const physicalInventoryCountResponseBody = {
                    id: like({ physicalInventoryId: integer(), line: integer() }),
                    status: likeCode,
                    closedOn: likeDateTimeWithMillis(),
                    product: likeCode,
                    category: likeCode,
                    uom: likeCode,
                    actualCount: integer(),
                    variance: integer(),
                    qohCountWhenOpened: integer(),
                    qohCountWhenClosed: integer(),
                    // TODO: add warnings back to reponse body once implemented
                    // warning: eachLike(string()),
                    // https://dev.azure.com/valvoline/Project%20Evolution/_workitems/edit/2150
                };

                const physicalInventoryCountResponseBody_includingStoreTank = {
                    id: like({ physicalInventoryId: integer(), line: integer() }),
                    status: likeCode,
                    closedOn: likeDateTimeWithMillis(),
                    product: likeCode,
                    category: likeCode,
                    uom: likeCode,
                    actualCount: integer(),
                    variance: integer(),
                    qohCountWhenOpened: integer(),
                    qohCountWhenClosed: integer(),
                    storeTank: like({ companyTank: like({ heightUom: likeCode }) }),
                };

                const physicalInventoryCountResponseBody_excludingCountVariance = {
                    id: like({ physicalInventoryId: integer(), line: integer() }),
                    status: likeCode,
                    closedOn: likeDateTimeWithMillis(),
                    product: likeCode,
                    category: likeCode,
                    uom: likeCode,
                    actualCount: integer(),
                    // TODO: add warnings back to reponse body once implemented
                    // warning: eachLike(string()),
                    // https://dev.azure.com/valvoline/Project%20Evolution/_workitems/edit/2150
                };
                const physicalInventoryCountUpdateResponseBody = {
                    id: like({ physicalInventoryId: integer(), line: integer() }),
                    product: likeCode,
                    status: likeCode,
                    closedOn: likeDateTimeWithMillis(),
                    actualCount: integer(),
                    version: integer(),
                };
                const physicalInventoryUpdateResponseBody = {
                    id: integer(),
                    version: integer(),
                    status: likeDescribed(),
                    finalizedOn: likeDateTimeWithMillis(),
                    updatedOn: likeDateTimeWithMillis(),
                    updatedByEmployee: like(employeeResponseBody),
                    counts: eachLike(physicalInventoryCountUpdateResponseBody),
                };

                const existingPhysicalNumber = 1000;
                const storeCode = '000000';
                const fullyPopulatedPhysicalInventoryState = `A fully populated physical inventory with number ${existingPhysicalNumber} and storeCode ${storeCode}`;
                const fullyPopulatedPhysicalInventoryWithProductOnLineOneState = `A fully populated physical inventory with number ${existingPhysicalNumber} and a product with id 100`;

                // TODO: this will need to be updated when the update/close endpoints are updated on the API side
                // https://dev.azure.com/valvoline/Project%20Evolution/_workitems/edit/2150
                const physicalInventoryRequestBody = {
                    id: existingPhysicalNumber,
                    version: 0,
                    counts: [
                        {
                            product: {
                                id: 100,
                            },
                            actualCount: 10.0,
                            version: 0,
                        },
                    ],
                };

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'createdOn,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'createdOn' } as any, 'desc'),
                    };

                    it('should return results for empty search', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedPhysicalInventoryState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(physicalInventoryMinimalResponseBody),
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
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for physical inventory counts with all search criteria', async () => {
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
                                values: [`${existingPhysicalNumber}`],
                            },
                            {
                                fieldPath: 'createdOn',
                                dataType: 'dateTime',
                                operator: 'after',
                                values: ['2020-08-31T01:01:01'],
                            },
                            {
                                fieldPath: 'status',
                                dataType: 'inventoryStatus',
                                operator: '=',
                                values: ['2'],
                            },
                            {
                                fieldPath: 'frequency',
                                dataType: 'countFrequency',
                                operator: '=',
                                values: ['1'],
                            },
                            {
                                fieldPath: 'finalizedOn',
                                dataType: 'dateTime',
                                operator: 'after',
                                values: ['2020-01-01T01:01:01'],
                            },
                            {
                                fieldPath: 'updatedByEmployee.lastName',
                                dataType: 'string',
                                operator: 'starts-with',
                                values: ['Ty'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyPopulatedPhysicalInventoryState }],
                            uponReceiving: `A request to search for physical inventory counts with restrictions: ${queryRestrictions
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
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findById', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path,
                        query: { id: `${existingPhysicalNumber}` },
                    };

                    it('should return the product count', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedPhysicalInventoryState }],
                            uponReceiving: `A request to find a physical inventory count with id: ${existingPhysicalNumber}`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: physicalInventoryMinimalResponseBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api.findById(`${existingPhysicalNumber}`).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                interaction('createCount', ({ provider, execute }) => {
                    const frequencyCode = 'W';
                    const request: V3Request = {
                        method: 'POST',
                        path,
                        headers: standardJsonHeaders(),
                        query: { store: storeCode, frequency: frequencyCode },
                    };

                    it('should create a new physical inventory count', async () => {
                        const state = `a store with code ${storeCode} and a frequency with code W exists`;
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to create a new physical inventory count',
                            withRequest: request,
                            willRespondWith: {
                                status: 201,
                                body: integer(),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api.createCount(storeCode, frequencyCode).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should give an CONFLICT api error with the existing product count id as a parameter', async () => {
                        const state = `A physical inventory exists for store ${storeCode} and frequency with code W`;
                        const apiError = likeApiErrorResponseWithDetails('409', request.path as string);
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to create a new physical inventory count',
                            withRequest: request,
                            willRespondWith: {
                                status: 409,
                                body: apiError,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            await api
                                .createCount(storeCode, frequencyCode)
                                .pipe(
                                    catchError((error) => {
                                        expect(instanceOfApiErrorResponse(error.error)).toBeTruthy();
                                        return EMPTY;
                                    })
                                )
                                .toPromise();
                            expect.assertions(1);
                        });
                    });
                });

                interaction('updateCount', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/update-counts`,
                        headers: standardJsonHeaders(),
                        body: physicalInventoryRequestBody,
                    };

                    it('should update the physical inventory count', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedPhysicalInventoryWithProductOnLineOneState }],
                            uponReceiving: `A request to update a physical inventory count with id: ${existingPhysicalNumber}`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: {
                                    ...physicalInventoryUpdateResponseBody,
                                    finalizedOn: null,
                                    counts: eachLike({ ...physicalInventoryCountUpdateResponseBody, closedOn: null }),
                                },
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            await api.updateCount(physicalInventoryRequestBody as PhysicalInventory).toPromise();
                        });
                    });
                });

                interaction('updateCountByLocation', ({ provider, execute }) => {
                    const physicalInventoryByLocationRequestBody = {
                        id: { physicalInventoryId: existingPhysicalNumber, line: 1 },
                        countsByLocation: [
                            {
                                count: 10.0,
                                location: 'BAY',
                            },
                        ],
                        version: 0,
                    };

                    const request: V3Request = {
                        method: 'PUT',
                        path: `${path}/${existingPhysicalNumber}/itemized-count`,
                        headers: standardJsonHeaders(),
                        body: physicalInventoryByLocationRequestBody,
                    };

                    const physicalInventoryCountByLocationUpdateResponseBody = {
                        product: likeCode,
                        actualCount: integer(),
                        uom: likeCode,
                        countsByLocation: eachLike({ location: string(), count: integer() }),
                    };

                    it('should update the physical inventory count', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedPhysicalInventoryWithProductOnLineOneState }],
                            uponReceiving: `A request to update a physical inventory count by location with id: ${existingPhysicalNumber}`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: physicalInventoryCountByLocationUpdateResponseBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            await api
                                .updateCountByLocation(
                                    existingPhysicalNumber,
                                    physicalInventoryByLocationRequestBody as PhysicalInventoryCount
                                )
                                .toPromise();
                        });
                    });
                });

                interaction('closeCount', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/update-counts`,
                        query: { status: 'CLOSED' },
                        headers: standardJsonHeaders(),
                        body: physicalInventoryRequestBody,
                    };

                    it('should update the physical inventory count status to closed', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedPhysicalInventoryWithProductOnLineOneState }],
                            uponReceiving: `A request to update a product on a physical inventory count with id: ${existingPhysicalNumber} to closed`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: {
                                    ...physicalInventoryUpdateResponseBody,
                                    counts: eachLike({
                                        ...physicalInventoryCountUpdateResponseBody,
                                        status: { id: integer(), code: 'CLOSED' },
                                    }),
                                },
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            await api.closeCount(physicalInventoryRequestBody as PhysicalInventory).toPromise();
                        });
                    });
                });
                interaction('stopCount', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/stop-count`,
                        headers: standardJsonHeaders(),
                        query: { id: `${existingPhysicalNumber}`, storeCode },
                    };

                    it('should stop the physical inventory count ', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedPhysicalInventoryState }],
                            uponReceiving: `A request to stop a product count with id ${existingPhysicalNumber}`,
                            withRequest: { ...request },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api.stopCount(existingPhysicalNumber, storeCode).toPromise();
                            expect(response).toBeNull();
                        });
                    });
                });

                interaction('searchCountProducts', ({ provider, execute }) => {
                    const categoryCode = 'VPCAT';
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/${existingPhysicalNumber}/counts`,
                    };

                    /** @deprecated because contract was updated so count variance fields are only returned when SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter is true */
                    it('should search for all physical inventory count products when no category is provided', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} and no category code`,
                                },
                            ],
                            uponReceiving: `A request to search for all physical inventory products with id: ${existingPhysicalNumber} and no category`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api.searchCountProducts(existingPhysicalNumber).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    /** @deprecated because contract was updated so count variance fields are only returned when SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter is true */
                    it('should search for physical inventory count products by category', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has at least one product with second level category code ${categoryCode}`,
                                },
                            ],
                            uponReceiving: `A request to search for physical inventory products with id: ${existingPhysicalNumber} and of second level category: ${categoryCode}`,
                            withRequest: { ...request, query: { categoryCode } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProducts(existingPhysicalNumber, categoryCode)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should search for all physical inventory count products when no category is provided', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} and no category code and the SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter true`,
                                },
                            ],
                            uponReceiving: `A request to search for all physical inventory products with id: ${existingPhysicalNumber} and no category`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api.searchCountProducts(existingPhysicalNumber).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should search for physical inventory count products by category', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has at least one product with second level category code ${categoryCode} and the SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter true`,
                                },
                            ],
                            uponReceiving: `A request to search for physical inventory products with id: ${existingPhysicalNumber} and of second level category: ${categoryCode}`,
                            withRequest: { ...request, query: { categoryCode } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProducts(existingPhysicalNumber, categoryCode)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should search for all physical inventory count products when no category is provided', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} and no category code and the SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter false`,
                                },
                            ],
                            uponReceiving: `A request to search for all physical inventory products with id: ${existingPhysicalNumber} and no category`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody_excludingCountVariance),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api.searchCountProducts(existingPhysicalNumber).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should not return variance, qohCountWhenOpen, or qohCountWhenClosed when SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter is false', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has at least one product with second level category code ${categoryCode} and the SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter false`,
                                },
                            ],
                            uponReceiving: `A request to search for physical inventory products with id: ${existingPhysicalNumber} and of second level category: ${categoryCode}`,
                            withRequest: { ...request, query: { categoryCode } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody_excludingCountVariance),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProducts(existingPhysicalNumber, categoryCode)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                const volumeState = `A store with code ${storeCode} and product with id ${existingPhysicalNumber}, have a store tank mapping`;
                interaction('calculatedVolume', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/calculate-product-volume`,
                    };

                    it('should return calculated volume', async () => {
                        provider.addInteraction({
                            states: [{ description: volumeState }],
                            uponReceiving: 'A request for volume calculation',
                            withRequest: {
                                ...request,
                                query: { productId: '1000', storeCode: '000000', enteredHeight: '12' },
                            },
                            willRespondWith: {
                                status: 200,
                                body: decimal(),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api.calculateVolume('1000', '000000', '12').toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                interaction('searchCountProductsByCategories', ({ provider, execute }) => {
                    const categoryCodes = ['VPCAT', 'OIL'];
                    const categoryCode = ['OIL'];
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/${existingPhysicalNumber}/multiple-category-counts`,
                    };

                    it('should search for all physical inventory count products when no category is provided ', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has at least one product with second level category codes ${categoryCodes.join(
                                        ', '
                                    )}`,
                                },
                            ],
                            uponReceiving: `A request to search for all physical inventory products with id: ${existingPhysicalNumber} and no category`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProductsByCategories(existingPhysicalNumber)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should search for all physical inventory count products when no category is provided and has a store tank configured ', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has products with second level category codes ${categoryCodes.join(
                                        ', '
                                    )} and has a store tank configured`,
                                },
                            ],
                            uponReceiving: `A request to search for all physical inventory products has a store tank configured with id: ${existingPhysicalNumber} and no category`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody_includingStoreTank),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProductsByCategories(existingPhysicalNumber)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should search for physical inventory count products by a single category', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has at least one product with second level category code ${categoryCode}`,
                                },
                            ],
                            uponReceiving: `A request to search for physical inventory products with id: ${existingPhysicalNumber} and of second level category: ${categoryCode}`,
                            withRequest: { ...request, query: { categoryCodes: categoryCode } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProductsByCategories(existingPhysicalNumber, categoryCode)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should search for physical inventory count products by categories', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has at least one product with second level category codes ${categoryCodes.join(
                                        ', '
                                    )}`,
                                },
                            ],
                            uponReceiving: `A request to search for physical inventory products with id: ${existingPhysicalNumber} and of second level category: ${categoryCodes.join(
                                ', '
                            )}`,
                            withRequest: { ...request, query: { categoryCodes } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(physicalInventoryCountResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProductsByCategories(existingPhysicalNumber, categoryCodes)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should search for physical inventory count products by location', async () => {
                        const countResponseBody = {
                            ...physicalInventoryCountResponseBody_excludingCountVariance,
                            countsByLocation: eachLike({
                                count: integer(),
                                location: string(),
                            }),
                        };
                        provider.addInteraction({
                            states: [
                                {
                                    description: `A fully populated physical inventory with number ${existingPhysicalNumber} has at least one product with second level category code ${categoryCode.join(
                                        ', '
                                    )} that was counted by location`,
                                },
                            ],
                            uponReceiving: `A request to search for physical inventory products by locatiion with id: ${existingPhysicalNumber} and of second level category: ${categoryCode.join(
                                ', '
                            )}  that was counted by location `,
                            withRequest: { ...request, query: { categoryCodes, isCountingByLocation: 'true' } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(countResponseBody),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                            const response = await api
                                .searchCountProductsByCategories(existingPhysicalNumber, categoryCodes, true)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                // TODO: re-enable this pact test once we've learned how to properly implement matchers for byte[]
                describe.skip('printPDF', () => {
                    interaction('printPdf', ({ provider, execute }) => {
                        const request: V3Request = {
                            method: 'GET',
                            path: `${path}/${storeCode}/${existingPhysicalNumber}/print`,
                        };

                        it('should get the PDF of the physical inventory', async () => {
                            provider.addInteraction({
                                states: [{ description: fullyPopulatedPhysicalInventoryWithProductOnLineOneState }],
                                uponReceiving: `A request to get the PDF of physical inventory with id: ${existingPhysicalNumber} and store code: ${storeCode}`,
                                withRequest: request,
                                willRespondWith: {
                                    status: 200,
                                    headers: { 'Content-Type': 'application/pdf' },
                                    body: string(),
                                },
                            });
                            await provider.executeTest(async (mockServer) => {
                                api = new PhysicalInventoryApi(`${mockServer.url}`, { http });
                                const response = await api.getPDF(storeCode, existingPhysicalNumber).toPromise();
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
            api = new PhysicalInventoryApi(null, { http: { get: jest.fn() } as any as HttpClient });
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('getPDF', () => {
            const storeCode = 'STORE';
            const physicalInventoryId = 100;
            const categoryCodes = ['VPCAT', 'OIL'];

            it('should return s PDF blob', async () => {
                const b64Data = atob('abc');
                const byteArray = btoa(b64Data);
                jest.spyOn(api.http, 'get').mockReturnValueOnce(of(byteArray));

                const result = await api.getPDF(storeCode, physicalInventoryId).toPromise();
                expect(api.http.get).toHaveBeenCalledWith(
                    `null/v1/physical-inventories/${storeCode}/${physicalInventoryId}/print`,
                    {
                        responseType: 'arraybuffer' as 'json',
                    }
                );
                expect(result).toEqual(new Blob([byteArray], { type: 'application/pdf' }));
            });
            it('should return s PDF blob with category codes', async () => {
                const b64Data = atob('abc');
                const byteArray = btoa(b64Data);
                jest.spyOn(api.http, 'get').mockReturnValueOnce(of(byteArray));
                const result = await api.getPDF(storeCode, physicalInventoryId, categoryCodes).toPromise();
                expect(api.http.get).toHaveBeenCalledWith(
                    `null/v1/physical-inventories/${storeCode}/${physicalInventoryId}/print`,
                    {
                        params: {
                            categoryCodes,
                        },
                        responseType: 'arraybuffer' as 'json',
                    }
                );
                expect(result).toEqual(new Blob([byteArray], { type: 'application/pdf' }));
            });

            it('should return s PDF blob with empty category Code', async () => {
                const b64Data = atob('abc');
                const byteArray = btoa(b64Data);
                jest.spyOn(api.http, 'get').mockReturnValueOnce(of(byteArray));
                const categoryCode = [];
                const result = await api.getPDF(storeCode, physicalInventoryId, categoryCode).toPromise();
                expect(api.http.get).toHaveBeenCalledWith(
                    `null/v1/physical-inventories/${storeCode}/${physicalInventoryId}/print`,
                    {
                        responseType: 'arraybuffer' as 'json',
                    }
                );
                expect(result).toEqual(new Blob([byteArray], { type: 'application/pdf' }));
            });
        });
    });
});
