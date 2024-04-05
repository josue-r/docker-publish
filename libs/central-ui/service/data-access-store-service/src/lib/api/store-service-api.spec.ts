import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import {
    QueryPage,
    QueryRestriction,
    QuerySearch,
    QuerySort,
    SearchLine,
} from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { of } from 'rxjs';
import { StoreServiceMassAdd } from '../model/store-service-mass-add.model';
import { StoreServiceMassUpdate } from '../model/store-service-mass-update.model';
import { StoreService } from '../model/store-service.model';
import { StoreServiceApi } from './store-service-api';

describe('StoreServiceApi', () => {
    let http: HttpClient;
    let api = new StoreServiceApi(null, { http: null });

    describe('standardTests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            api.get = jest.fn();
        });

        describe('findByStoreAndService', () => {
            it('should delegate to the get method', () => {
                const storeNumber = 'test-store';
                const serviceCode = 'test-srv-code';
                api.findByStoreAndService(storeNumber, serviceCode);
                expect(api.get).toHaveBeenCalledWith(['v1/store-services'], {
                    store: storeNumber,
                    service: serviceCode,
                });
            });
        });

        describe('previewMassAdd', () => {
            it('should delegate to the post method', () => {
                api.post = jest.fn();
                const storeIds = [1, 2];
                const serviceId = 4;
                api.previewMassAdd(storeIds, serviceId);
                expect(api.post).toHaveBeenCalledWith(['v1/store-services/mass-add-preview'], {
                    storeIds,
                    serviceIds: [serviceId],
                });
            });
        });

        describe('add', () => {
            it('should delegate to the post method', async () => {
                jest.spyOn(api, 'post').mockImplementation((path: string[], request: any) => of(1));
                const store: Described = { id: 1, code: 'S1', description: 'Store 1' };
                const service: Service = { id: 1, code: 'Srv1', description: 'Service 1' };
                const massAdd: StoreServiceMassAdd = {
                    stores: [store],
                    service: service,
                    storeService: new StoreService(),
                };
                expect(await api.add(massAdd).toPromise()).toEqual(1);
                expect(api.post).toHaveBeenCalledWith(['v1/store-services/mass-add'], {
                    ...massAdd.storeService,
                    storeIds: [store.id],
                    serviceIds: [service.id],
                });
            });
        });

        describe('searchAssignedServicesByStore', () => {
            const column: Column = Column.of({
                apiFieldPath: 'code',
                name: 'Service Code',
                type: 'string',
            });
            const queryRestriction = new SearchLine(column, Comparators.startsWith, 's').toQueryRestriction();
            const queryPage = new QueryPage(0, 10);
            const querySort = new QuerySort(column);
            const storeAssignedServices = [
                {
                    requiresApproval: false,
                    supportsQuickSale: false,
                    supportsQuickInvoice: true,
                    supportsRegularInvoice: true,
                    supportsRefillInvoice: true,
                    supportsTireCheckInvoice: false,
                    supportsECommerce: null,
                    serviceCategory: {
                        code: 'COMPLETE FUEL',
                        id: 1025,
                        description: '12 Mo. Fuel Treatment',
                        version: 13,
                    },
                    active: true,
                    code: 'COMPLETEFUELSVC',
                    description: 'Complete Fuel System',
                    version: 14,
                    id: 1050,
                },
                {
                    requiresApproval: false,
                    supportsQuickSale: false,
                    supportsQuickInvoice: false,
                    supportsRegularInvoice: true,
                    supportsRefillInvoice: false,
                    supportsTireCheckInvoice: false,
                    supportsECommerce: null,
                    serviceCategory: {
                        code: 'STCONV',
                        id: 1142,
                        description: 'Standard',
                        version: 13,
                    },
                    active: true,
                    code: 'CONVENTIONALOC',
                    description: 'Conventional Oil Change',
                    version: 25,
                    id: 1051,
                },
            ];

            it('should delegate to the post method', async () => {
                jest.spyOn(api, 'post').mockReturnValue(
                    of({
                        content: storeAssignedServices,
                        page: {
                            size: 10,
                            totalElements: 2,
                            totalPages: 1,
                            number: 0,
                        },
                    })
                );
                const querySearch: QuerySearch = {
                    queryRestrictions: [queryRestriction],
                    page: queryPage,
                    sort: querySort,
                    additionalParams: { param: 'additional' },
                };
                const store = { id: 2, code: 'STORE', description: 'Test Store' };
                const requestBody = {
                    storeIds: [store.id],
                    restrictions: querySearch.queryRestrictions,
                };

                api.searchAssignedServicesByStore(querySearch, [store])
                    .toPromise()
                    .then((response) => {
                        expect(response.content).toEqual(storeAssignedServices);
                        expect(response.totalElements).toEqual(2);
                    });
                expect(api.post).toHaveBeenCalledWith(['v2/store-services/store-assigned-services'], requestBody, {
                    page: '0',
                    param: 'additional',
                    size: '10',
                    sort: ['code,asc'],
                });
            });
        });

        describe('massUpdate', () => {
            it('should just delegate to patch method', async () => {
                jest.spyOn(api, 'patch').mockImplementation((path: string[], request: any) => of(1));
                const store: Described = { id: 1, code: 'S1', description: 'Store 1' };
                const service: Service = { id: 2, code: 'Srv1', description: 'Service 1' };
                const massUpdate: StoreServiceMassUpdate = {
                    stores: [store],
                    services: [service],
                    updateFields: ['laborAmount'],
                    storeService: { ...new StoreService(), laborAmount: 1.23 },
                };
                expect(await api.massUpdate(massUpdate).toPromise()).toEqual(1);
                expect(api.patch).toHaveBeenCalledWith(['v1/store-services/mass-update'], {
                    ...massUpdate.storeService,
                    storeIds: [store.id],
                    serviceIds: [service.id],
                    updateFields: ['laborAmount'],
                });
            });
        });
    });

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'service-api',
                cors: true,
            },
            (interaction) => {
                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new StoreServiceApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });
                interaction('searchAssignedServicesByStore', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `/v2/store-services/store-assigned-services`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'active,asc' },
                    };
                    const queryRestrictions: QueryRestriction[] = [
                        {
                            fieldPath: 'code',
                            dataType: 'string',
                            operator: '=',
                            values: ['SERVICE-11'],
                        },
                    ];
                    const querySearch: QuerySearch = {
                        queryRestrictions,
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'active' } as any, 'asc'),
                    };

                    const serviceResponseObject = {
                        id: integer(),
                        code: string(),
                        description: string(),
                        active: boolean(),
                        serviceCategory: likeDescribed(),
                        supportsQuickSale: boolean(),
                        supportsQuickInvoice: boolean(),
                        supportsRegularInvoice: boolean(),
                        supportsRefillInvoice: boolean(),
                        requiresApproval: boolean(),
                        supportsTireCheckInvoice: boolean(),
                        supportsECommerce: boolean(),
                        version: integer(),
                    };

                    it('should return service details', async () => {
                        const stores: Described[] = [
                            { id: 11, code: 'store1', description: 'Test Store 1' },
                            { id: 22, code: 'store2', description: 'Test Store 2' },
                        ];
                        const requestBody = {
                            storeIds: stores.map(Described.idMapper),
                            restrictions: querySearch.queryRestrictions,
                        };
                        provider.addInteraction({
                            // removed 000000 as storeId because sonar changed the value to 0
                            states: [
                                {
                                    description:
                                        'Active store services exists for stores 11, 22 with a service code SERVICE-11',
                                },
                            ],
                            uponReceiving: 'A request for service details',
                            withRequest: {
                                ...request,
                                body: requestBody as any,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(serviceResponseObject),
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
                            api = new StoreServiceApi(`${mockServer.url}`, { http });
                            await api.searchAssignedServicesByStore(querySearch, stores).toPromise();
                        });
                    });

                    it('should return an empty array if requesting service details of unavailable services', async () => {
                        const stores: Described[] = [
                            { id: 33, code: 'store3', description: 'Test Store 3' },
                            { id: 44, code: 'store4', description: 'Test Store 4' },
                        ];
                        const requestBody = {
                            storeIds: stores.map(Described.idMapper),
                            restrictions: querySearch.queryRestrictions,
                        };
                        provider.addInteraction({
                            states: [
                                {
                                    description:
                                        'Active store services exists for stores 11, 22 with a service code SERVICE-11',
                                },
                            ],
                            uponReceiving: 'A request for service details of unavailable services',
                            withRequest: {
                                ...request,
                                body: requestBody as any,
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
                            api = new StoreServiceApi(`${mockServer.url}`, { http });
                            await api.searchAssignedServicesByStore(querySearch, stores).toPromise();
                        });
                    });
                });
            }
        );
    });
});
