import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, decimal, eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import {
    QueryPage,
    QueryRestriction,
    QuerySearch,
    QuerySort,
    SearchLine,
} from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { likeApiErrorResponse, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact//dist/v3';
import { EMPTY, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StoreProductMassUpdate } from '../model/store-product-mass-update.model';
import { StoreProduct } from '../model/store-product.model';
import { StoreProductApi } from './store-product-api';

describe('StoreProductApi', () => {
    let http: HttpClient;
    let api: StoreProductApi;

    describe('Standard tests', () => {
        beforeEach(() => (api = new StoreProductApi(null, { http: null })));
        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('searchAssignedProductsByStore', () => {
            const column: Column = Column.of({
                apiFieldPath: 'code',
                name: 'Product Code',
                type: 'string',
            });
            const queryRestriction = new SearchLine(column, Comparators.startsWith, 'p').toQueryRestriction();
            const queryPage = new QueryPage(0, 10);
            const querySort = new QuerySort(column);
            const storeAssignedProducts = [
                {
                    inventoryDescription: 'VAL 0W16 ADV FULL SYNTHETIC QUART',
                    supportsECommerce: null,
                    sapNumber: '878400',
                    bulk: false,
                    tankStorage: false,
                    upc: null,
                    defaultUom: {
                        id: 2478,
                        code: 'QUART',
                        description: 'QT',
                        version: 2,
                    },
                    vendorType: null,
                    fluidGroup: {
                        id: 6283,
                        code: '0W16',
                        description: '0W16',
                        version: 0,
                    },
                    obsolete: false,
                    relatedProductCode: '0W16SYN',
                    reportOrder: '0W16SY',
                    productCategory: {
                        id: 1467,
                        code: 'ADVFULLSYN',
                        description: 'Advanced Full Synthetic',
                        version: 9,
                    },
                    active: true,
                    code: '0W16SYN',
                    description: 'Valvoline 0W16 Adv Full Synthetic Oil API SN',
                    version: 5,
                    id: 30334,
                    type: {
                        id: 1003,
                        code: 'VAL',
                        description: 'Valvoline',
                        version: 1,
                    },
                },
                {
                    inventoryDescription: 'CASTROL 0W20 EDGE OIL QUART',
                    supportsECommerce: null,
                    sapNumber: '0W20EDGECAS',
                    bulk: false,
                    tankStorage: false,
                    upc: null,
                    defaultUom: {
                        id: 2478,
                        code: 'QUART',
                        description: 'QT',
                        version: 2,
                    },
                    vendorType: {
                        id: 6234,
                        code: 'OUTSIDE_VENDOR',
                        description: 'Outside Vendor',
                        version: 0,
                    },
                    fluidGroup: null,
                    obsolete: false,
                    relatedProductCode: '0W20EDGECAS',
                    reportOrder: '0W20ED',
                    productCategory: {
                        id: 1176,
                        code: 'NVP',
                        description: 'NON-VALV PREM',
                        version: 5,
                    },
                    active: true,
                    code: '0W20EDGECAS',
                    description: 'Castrol 0W20 EDGE OIL API SN',
                    version: 4,
                    id: 29524,
                    type: {
                        id: 1004,
                        code: 'VALAPPRVD',
                        description: 'Valvoline Approved',
                        version: 1,
                    },
                },
            ];

            it('should delegate to the post method', async () => {
                jest.spyOn(api, 'post').mockReturnValue(
                    of({
                        content: storeAssignedProducts,
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

                api.searchAssignedProductsByStore(querySearch, [store])
                    .toPromise()
                    .then((response) => {
                        expect(response.content).toEqual(storeAssignedProducts);
                        expect(response.totalElements).toEqual(2);
                    });
                expect(api.post).toHaveBeenCalledWith(['v2/store-products/store-assigned-products'], requestBody, {
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
                const store: Described = { id: 1, code: 'STORE', description: 'Test Store' };
                const product: Product = { id: 2, code: 'PROD', description: 'Test Product' };
                const massUpdate: StoreProductMassUpdate = {
                    stores: [store],
                    products: [product],
                    patch: { ...new StoreProduct(), retailPrice: 1.23 },
                };
                expect(await api.massUpdate(massUpdate, ['retailPrice']).toPromise()).toEqual(1);
                expect(api.patch).toHaveBeenCalledWith(['v1/store-products/mass-update'], {
                    storeIds: [store.id],
                    productIds: [product.id],
                    updateFields: ['retailPrice'],
                    ...massUpdate.patch,
                });
            });
        });

        describe('findByStoreAndProducts', () => {
            it('should delegate to POST method', () => {
                jest.spyOn(api, 'post').mockImplementation();
                const productCodes: string[] = ['PROD1', 'PROD2'];
                api.findByStoreAndProducts('STORE', productCodes);
                const requestBody = {
                    productIds: null,
                    productCodes,
                };
                expect(api.post).toHaveBeenCalledWith(['v1/store-products/inventory-details'], requestBody, {
                    store: 'STORE',
                });
            });
        });

        describe('findByStoreAndProduct', () => {
            it('should delegate to GET method', () => {
                jest.spyOn(api, 'get').mockImplementation();
                const productCode: string = 'PROD1';
                api.findByStoreAndProduct('STORE', productCode);
                expect(api.get).toHaveBeenCalledWith(['v1/store-products'], {
                    store: 'STORE',
                    product: productCode,
                });
            });
        });

        describe('findAssignableStores', () => {
            it('should delegate to GET method', () => {
                jest.spyOn(api, 'get').mockImplementation();
                const productCode: string = 'PROD1';
                api.findAssignableStores(productCode);
                expect(api.get).toHaveBeenCalledWith(['v1/store-products/assignable-stores'], {
                    productCode: productCode,
                });
            });
        });
    });

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'product-api',
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
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('getInventoryDetails', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `/v1/store-products/ordering-details`,
                        headers: standardJsonHeaders(),
                    };

                    const inventoryDetailsResponseObject = {
                        id: { storeId: integer(), productId: integer() },
                        wholesalePrice: decimal(),
                        maxStockLimit: decimal(),
                        uom: likeDescribed(),
                        code: string(),
                        description: string(),
                        bulk: boolean(),
                        sapNumber: string(),
                        secondLevelCategory: likeDescribed(),
                    };

                    it('should return inventory details', async () => {
                        const productCodes = ['PROD1', 'PROD2'];
                        provider.addInteraction({
                            states: [
                                {
                                    description:
                                        'Active store products exists for store 000000, vendor TEST_VEND, and products PROD1, PROD2',
                                },
                            ],
                            uponReceiving: 'A request for inventory details',
                            withRequest: {
                                ...request,
                                query: { store: '000000', vendor: 'TEST_VEND' },
                                body: { productCodes },
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(inventoryDetailsResponseObject),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            const response = await api
                                .getInventoryDetails('000000', 'TEST_VEND', productCodes)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should return an empty array if requesting inventory details of unavailable products', async () => {
                        const productCodes = ['PROD3', 'PROD4'];
                        provider.addInteraction({
                            states: [
                                {
                                    description:
                                        'Active store products exists for store 000000, vendor TEST_VEND, and products PROD1, PROD2',
                                },
                            ],
                            uponReceiving: 'A request for inventory details of unavailable products',
                            withRequest: {
                                ...request,
                                query: { store: '000000', vendor: 'TEST_VEND' },
                                body: { productCodes },
                            },
                            willRespondWith: {
                                status: 200,
                                body: [],
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            const response = await api
                                .getInventoryDetails('000000', 'TEST_VEND', productCodes)
                                .toPromise();
                            expect(response.length).toEqual(0);
                        });
                    });

                    it('should give an error if no product codes or ids are provided', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description:
                                        'Active store products exists for store 000000, vendor TEST_VEND, and products PROD1, PROD2',
                                },
                            ],
                            uponReceiving: 'A request for inventory details without product codes or product ids',
                            withRequest: {
                                ...request,
                                query: { store: '000000', vendor: 'TEST_VEND' },
                                body: { productCodes: null },
                            },
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponse('400', request.path as string),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            await api
                                .getInventoryDetails('000000', 'TEST_VEND', null)
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
                interaction('inventoryStatusSearch', ({ provider, execute }) => {
                    const state = 'store products exist';
                    const request: V3Request = {
                        method: 'POST',
                        path: `/v1/store-products/inventory-status/search`,
                        headers: standardJsonHeaders(),
                        body: [],
                        //Using active as the sorting creteria here because the h2 database
                        //used for testing on the api doesn't allow
                        //sorting on a field not returned in the query.
                        //A larger change needs to be made to properly
                        //fetch any sorted by fields on the api side
                        query: { page: '0', size: '20', sort: 'active,asc' },
                    };
                    const companyProductResponseBody = {
                        uom: likeDescribed(),
                    };
                    const productResponseBody = {
                        id: integer(),
                        code: string(),
                        description: string(),
                        version: integer(),
                        sapNumber: string(),
                    };
                    const inventoryDetailsResponseBody = {
                        store: likeDescribed(),
                        product: like(productResponseBody),
                        quantityOnHand: integer(),
                        companyProduct: like(companyProductResponseBody),
                        vendor: likeDescribed(),
                        active: boolean(),
                    };
                    it('should search for inventory statuses with no search criteria', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a request to search for inventory statuses with no criteria',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(inventoryDetailsResponseBody),
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
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            await api
                                .inventoryStatusSearch({
                                    queryRestrictions: [],
                                    page: new QueryPage(0, 20),
                                    sort: new QuerySort({ apiSortPath: 'active' } as any, 'asc'),
                                } as QuerySearch)
                                .toPromise();
                        });
                    });
                    it('should accept all possible query restrictions', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'store.code',
                                dataType: 'string',
                                operator: Comparators.startsWith.value,
                                values: ['010002'],
                            },
                            {
                                fieldPath: 'product.code',
                                dataType: 'string',
                                operator: Comparators.startsWith.value,
                                values: ['test'],
                            },
                            {
                                fieldPath: 'quantityOnHand',
                                dataType: 'decimal',
                                operator: Comparators.equalTo.value,
                                values: [1.2],
                            },
                            {
                                fieldPath: 'vendor',
                                dataType: 'vendor',
                                operator: '=',
                                values: [5059],
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
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            await api
                                .inventoryStatusSearch({
                                    queryRestrictions,
                                    page: new QueryPage(0, 20),
                                    sort: new QuerySort({ apiSortPath: 'active' } as any, 'asc'),
                                } as QuerySearch)
                                .toPromise();
                        });
                    });
                });

                interaction('searchAssignedProductsByStore', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `/v2/store-products/store-assigned-products`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'active,asc' },
                    };
                    const queryRestrictions: QueryRestriction[] = [
                        {
                            fieldPath: 'code',
                            dataType: 'string',
                            operator: Comparators.startsWith.value,
                            values: ['AIR-FILTER-11'],
                        },
                    ];
                    const querySearch: QuerySearch = {
                        queryRestrictions,
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'active' } as any, 'asc'),
                    };

                    const productResponseObject = {
                        id: integer(),
                        code: string(),
                        relatedProductCode: string(),
                        sapNumber: string(),
                        description: string(),
                        inventoryDescription: string(),
                        active: boolean(),
                        bulk: boolean(),
                        tankStorage: boolean(),
                        obsolete: boolean(),
                        upc: string(),
                        reportOrder: string(),
                        supportsECommerce: boolean(),
                        defaultUom: likeDescribed(),
                        productCategory: likeDescribed(),
                        type: likeDescribed(),
                        vendorType: likeDescribed(),
                        fluidGroup: likeDescribed(),
                        version: integer(),
                    };

                    it('should return product details', async () => {
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
                                        'Active store products exists for stores 11, 22 with a product code AIR-FILTER-11',
                                },
                            ],
                            uponReceiving: 'A request for product details',
                            withRequest: {
                                ...request,
                                body: requestBody,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(productResponseObject),
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
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            await api.searchAssignedProductsByStore(querySearch, stores).toPromise();
                        });
                    });

                    it('should return an empty array if requesting product details of unavailable products', async () => {
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
                                        'Active store products exists for stores 11, 22 with a product code AIR-FILTER-11',
                                },
                            ],
                            uponReceiving: 'A request for product details of unavailable products',
                            withRequest: {
                                ...request,
                                body: requestBody,
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
                            api = new StoreProductApi(`${mockServer.url}`, { http });
                            await api.searchAssignedProductsByStore(querySearch, stores).toPromise();
                        });
                    });
                });
            }
        );
    });
});
