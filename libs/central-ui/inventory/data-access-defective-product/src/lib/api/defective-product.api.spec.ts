import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import {
    likeDateTimeWithMillis,
    likeDescribed,
    standardJsonHeaders,
    likeApiErrorResponseWithDetails,
} from '@vioc-angular/test/util-test';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';
import { DefectiveProduct } from '../..';
import { DefectiveProductApi } from './defective-product.api';
import { catchError } from 'rxjs/operators';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { EMPTY } from 'rxjs';

describe('DefectiveProductApi', () => {
    let http: HttpClient;
    let api: DefectiveProductApi;

    const path = '/v1/store-defective-products';
    describe('contract test', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'inventory-api',
                cors: true,
            },
            (interaction: JestDescribePactFnV3) => {
                const storeProduct = {
                    store: likeDescribed(),
                    product: likeDescribed(),
                };

                const adjustment = {
                    id: integer(),
                };

                const defectiveProductMinimalResponseBody = {
                    id: integer(),
                    storeProduct: like(storeProduct),
                    adjustment: like(adjustment),
                    quantity: integer(),
                    defectProductReason: likeDescribed(),
                    defectDate: likeDateTimeWithMillis(),
                };

                const existingDefectiveProductId = 1000;
                const storeCode = '000000';
                const defectProductReasonCode = 'DAMAGED_AT_STORE';
                const productCode = 'VA86';
                const fullyDefectiveProductState = `A fully populated defective product with id ${existingDefectiveProductId} and storeCode ${storeCode}`;
                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new DefectiveProductApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'defectDate,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'defectDate' } as any, 'desc'),
                    };

                    it('should return results for empty search', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyDefectiveProductState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(defectiveProductMinimalResponseBody),
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
                            api = new DefectiveProductApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it(`should search for defective product with reason code ${defectProductReasonCode} and product Code ${productCode} `, async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'store.code',
                                dataType: 'string',
                                operator: '=',
                                values: [storeCode],
                            },
                            {
                                fieldPath: 'defectProductReason.code',
                                dataType: 'string',
                                operator: '=',
                                values: [`${defectProductReasonCode}`],
                            },
                            {
                                fieldPath: 'storeProduct.store.code',
                                dataType: 'string',
                                operator: '=',
                                values: [`${productCode}`],
                            },
                            {
                                fieldPath: 'defectDate',
                                dataType: 'dateTime',
                                operator: 'after',
                                values: ['2020-08-31T01:01:01'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyDefectiveProductState }],
                            uponReceiving: `A request to search for defective product with restrictions: ${queryRestrictions
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
                            api = new DefectiveProductApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('new defective product(POST)', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: path,
                        headers: standardJsonHeaders(),
                        query: { status: 'FINALIZED' },
                    };

                    const buildNewDefectiveProduct = (quantity = 100): DefectiveProduct => ({
                        ...new DefectiveProduct(),
                        quantity,
                        adjustment: { id: null },
                        defectDate: '2021-12-15T04:58:06',
                        reason: {
                            id: 6897,
                            code: 'DAMAGED_AT_STORE',
                            description: 'Damaged At Store',
                        },
                        id: 410995,
                        vendor: { code: '0W20', description: 'VAL Product', id: 3012 },
                        product: { code: '0W20EURO', description: 'VAL 0W20 EURO SYNTHETIC QUART', id: 30696 },
                        storeProduct: {
                            id: { storeId: 274130, productId: 30696 },
                            product: { code: '0W20EURO', description: 'VAL 0W20 EURO SYNTHETIC QUART', id: 30696 },
                            store: { code: '010002', description: 'BLOOMINGTON', id: 274130 },
                        },
                        store: { code: '010002', description: 'BLOOMINGTON', id: 274130 },
                    });

                    // Defines a pre existing state that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created.
                    const state =
                        'Store with id 274130, product with id 30696, vendor with id 3012, reason with id 6897 exist and are active';

                    it('should be able to finalize', async () => {
                        const defectiveProduct = buildNewDefectiveProduct();
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to finalize a new defective product',
                            withRequest: {
                                ...request,
                                body: defectiveProduct,
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new DefectiveProductApi(`${mockServer.url}`, { http });
                            await api.finalize(defectiveProduct).toPromise();
                        });
                    });

                    it('should give an error', async () => {
                        const defectiveProduct = buildNewDefectiveProduct(-2);
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving:
                                'A request to finalize a new defective product that has a negative quantity received',
                            withRequest: {
                                ...request,
                                body: defectiveProduct,
                            },
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', request.path as string),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new DefectiveProductApi(`${mockServer.url}`, { http });
                            await api
                                .finalize(defectiveProduct)
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

                interaction('getDefectiveProduct', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: path,
                    };

                    const storeCode = '010002';
                    const defectId = '411234';

                    const defectiveProduct = {
                        ...DefectiveProduct,
                        adjustment: like({
                            id: integer(),
                        }),
                        comments: string(),
                        defectDate: string(),
                        defectProductReason: likeDescribed(),
                        id: integer(),
                        quantity: integer(),
                        vendor: like({
                            id: integer(),
                            code: string(),
                            description: string(),
                            version: integer(),
                            active: boolean(),
                            valvolineDistributor: boolean(),
                        }),
                        storeProduct: like({
                            id: like({
                                storeId: integer(),
                                productId: integer(),
                            }),
                            store: likeDescribed(),
                            product: like({
                                id: integer(),
                                code: string(),
                                description: string(),
                                version: integer(),
                            }),
                            version: integer(),
                        }),
                    };

                    const state =
                        'A defective product with store code 010002 and defect id 411234 with non-null values and a product with non-null values';

                    it('should return successful message when finding a defective product', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: `A request to find defective product with storeCode: ${storeCode} and defectId: ${defectId} `,
                            withRequest: {
                                ...request,
                                query: { storeCode, defectId },
                            },
                            willRespondWith: {
                                status: 200,
                                body: like(defectiveProduct),
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new DefectiveProductApi(`${mockServer.url}`, { http });
                            const result = await api.getDefectiveProduct(storeCode, defectId).toPromise();
                            expect(result).toBeTruthy();
                        });
                    });
                });
            }
        );
    });

    describe('non-contract tests', () => {
        api = new DefectiveProductApi(null, { http: null });

        beforeEach(() => {
            api.post = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('finalize', () => {
            it('should delegate to POST method for new defective product', () => {
                const defectiveProduct = new DefectiveProduct();
                api.finalize(defectiveProduct);
                expect(api.post).toHaveBeenCalledWith([], defectiveProduct, {
                    status: 'FINALIZED',
                });
            });
        });

        describe('getDefectiveProduct', () => {
            it('should delegate to Get method', () => {
                jest.spyOn(api, 'get').mockImplementation();
                api.getDefectiveProduct('STORE', '1');
                expect(api.get).toHaveBeenCalledWith([], {
                    storeCode: 'STORE',
                    defectId: '1',
                });
            });
        });
    });
});
