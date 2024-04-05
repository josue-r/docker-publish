import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { eachLike, integer, like, somethingLike, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { Column } from '@vioc-angular/shared/util-column';
import {
    likeDateTimeWithMillis,
    acceptJsonHeader,
    likeApiErrorResponseWithDetails,
    likeDescribed,
    standardJsonHeaders,
} from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReceiptOfMaterial } from '../model/receipt-of-material.model';
import { ReceiptOfMaterialProduct } from './../model/receipt-of-material-product.model';
import { ReceiptOfMaterialApi } from './receipt-of-material.api';

describe('ReceiptOfMaterialApi', () => {
    let http: HttpClient;
    let api: ReceiptOfMaterialApi;

    describe('Standard Tests', () => {
        const standardApi = new ReceiptOfMaterialApi(null, { http: null });

        beforeEach(() => {
            standardApi.delete = jest.fn();
            standardApi.put = jest.fn();
            standardApi.get = jest.fn();
            standardApi.post = jest.fn();
        });

        describe('findReceiptProducts', () => {
            it('should delegate to GET method', () => {
                const storeCode = 'TESTSTORE';
                const rmNumber = 'TESTNUMBER';
                standardApi.findReceiptProducts(storeCode, rmNumber);
                expect(standardApi.get).toHaveBeenCalledWith([], { storeCode, rmNumber });
            });
        });

        describe('cancelReceiptOfMaterial', () => {
            it('should delegate to DELETE method', () => {
                const storeCode = 'TESTSTORE';
                const rmNumber = 'TESTNUMBER';
                standardApi.cancelReceiptOfMaterial(storeCode, rmNumber);
                expect(standardApi.delete).toHaveBeenCalledWith([], { storeCode, rmNumber });
            });
        });

        describe('finalize', () => {
            it('should delegate to PUT method for existing receipts', () => {
                const testReceiptOfMaterial: ReceiptOfMaterial = {
                    ...new ReceiptOfMaterial(),
                    id: { number: '123', storeId: 123 },
                };
                standardApi.finalize(testReceiptOfMaterial, true);
                expect(standardApi.put).toHaveBeenCalledWith([], testReceiptOfMaterial, {
                    status: 'FINALIZED',
                    split: 'true',
                });
            });

            it('should delegate to POST method for new receipts', () => {
                const testReceiptOfMaterial = new ReceiptOfMaterial();
                standardApi.finalize(testReceiptOfMaterial);
                expect(standardApi.post).toHaveBeenCalledWith([], testReceiptOfMaterial, {
                    status: 'FINALIZED',
                });
            });
        });

        describe('findAssociatedReceiptsOfMaterial', () => {
            it('should delegate to GET method', () => {
                const storeCode = 'VAL001';
                const receiptTypeCode = '1100';
                const source = '2505';
                const sourceStoreCode = 'VAL002';
                standardApi.findAssociatedReceiptsOfMaterial(storeCode, receiptTypeCode, source, sourceStoreCode);
                expect(standardApi.get).toHaveBeenCalledWith(['associated'], {
                    storeCode,
                    receiptTypeCode,
                    source,
                    sourceStoreCode,
                });
            });
        });

        describe('findOpenReceiptsOfMaterial', () => {
            it('should delegate to GET method', () => {
                const storeCode = 'TESTSTORE';
                const vendorcode = 'TESTVENDOR';
                standardApi.findOpenReceiptsOfMaterial(storeCode, vendorcode);
                expect(standardApi.get).toHaveBeenCalledWith(
                    ['open-order-receipts'],
                    {
                        store: storeCode,
                        vendor: vendorcode,
                    },
                    { 'Content-Type': 'application/json' }
                );
            });
        });

        describe('findOpenInventoryOrderReceipts', () => {
            it('should delegate to GET method', () => {
                const storeCode = 'TESTSTORE';
                standardApi.findOpenProductCountReceipts(storeCode);
                expect(standardApi.get).toHaveBeenCalledWith(['open-count-receipts'], { store: storeCode });
            });
        });
    });

    describe('contract tests', () => {
        // Standard configuration for running tests in pact
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'order-api',
                cors: true,
            },
            (interaction) => {
                const basePath = '/v2/receipt-of-materials';

                const receiptOfMaterialSearchResponseBody = {
                    id: like({ number: string(), storeId: integer() }),
                    version: integer(),
                    number: string(),
                    store: likeDescribed(),
                    vendor: likeDescribed(),
                    receiptDate: string(),
                    status: likeDescribed(),
                    receiptType: likeDescribed(),
                    finalizedOn: string(),
                    finalizedByEmployee: somethingLike({ id: string(), firstName: string(), lastName: string() }),
                    createdByEmployee: somethingLike({ id: string(), firstName: string(), lastName: string() }),
                    originalNumber: string(),
                    source: string(),
                    poNumber: string(),
                    invoiceNumber: string(),
                    deliveryTicket: string(),
                };

                // Defines a pre existing state that must be met for the tests to work on the provider side.
                // This string will need to be matches exactly by a state in the provider tests. This ensure that
                // necessary relationships exist for the product to be properly created.
                const fullyPopulatedRegularReceiptOfMaterialState =
                    'A fully populated regular receipt with number R000000678910 and storeCode 000000';

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('findOpenReceiptsOfMaterial', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${basePath}/open-order-receipts`,
                        headers: standardJsonHeaders(),
                    };

                    it('should return open receipts', async () => {
                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const state = 'An open regular rm exists for store 000000 and vendor TEST_VEND';

                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request for open receipts',
                            withRequest: { ...request, query: { store: '000000', vendor: 'TEST_VEND' } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike({
                                    number: string(),
                                    receiptDate: likeDateTimeWithMillis(),
                                }),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const response = await api.findOpenReceiptsOfMaterial('000000', 'TEST_VEND').toPromise();
                            expect(response[0].number).toBeTruthy();
                        });
                    });

                    it('should return empty array if no receipts', async () => {
                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const state = 'A store with code 000000 and vendor with code TEST_VEND exist';

                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request for open receipts with no open receipts',
                            withRequest: { ...request, query: { store: '000000', vendor: 'TEST_VEND' } },
                            willRespondWith: {
                                status: 200,
                                body: [],
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const response = await api.findOpenReceiptsOfMaterial('000000', 'TEST_VEND').toPromise();
                            expect(response.length).toEqual(0);
                        });
                    });

                    it('should give an error', async () => {
                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const state = 'A store with code 000000 exists';

                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request with non-existent vendor',
                            withRequest: { ...request, query: { store: '000000', vendor: 'NOT_EXIST' } },
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', request.path as string),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            await api
                                .findOpenReceiptsOfMaterial('000000', 'NOT_EXIST')
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

                interaction('findOpenProductCountReceipts', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${basePath}/open-count-receipts`,
                        headers: acceptJsonHeader(),
                    };

                    it('should return open receipts', async () => {
                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const state = 'An open regular rm exists for store 000000';

                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request for open product count receipts',
                            withRequest: { ...request, query: { store: '000000' } },
                            willRespondWith: {
                                status: 200,
                                body: eachLike({
                                    number: string(),
                                    receiptDate: string(),
                                    vendor: likeDescribed(),
                                    store: likeDescribed(),
                                }),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const response = await api.findOpenProductCountReceipts('000000').toPromise();
                            expect(response[0].number).toBeTruthy();
                            expect(response[0].receiptDate).toBeTruthy();
                            expect(response[0].vendor).toBeTruthy();
                            expect(response[0].store).toBeTruthy();
                        });
                    });

                    it('should return empty array if no receipts', async () => {
                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const state = 'A store with code 000000 exists';

                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request for open receipts with no open product count receipts',
                            withRequest: { ...request, query: { store: '000000' } },
                            willRespondWith: {
                                status: 200,
                                body: [],
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const response = await api.findOpenProductCountReceipts('000000').toPromise();
                            expect(response.length).toEqual(0);
                        });
                    });
                });

                describe('finalize', () => {
                    interaction('new receipt (POST)', ({ provider, execute }) => {
                        const request: V3Request = {
                            method: 'POST',
                            path: basePath,
                            headers: standardJsonHeaders(),
                            query: { status: 'FINALIZED' },
                        };

                        const buildNewReceiptProduct = (quantityReceived = 2): ReceiptOfMaterialProduct => ({
                            ...new ReceiptOfMaterialProduct(),
                            quantityReceived,
                            wholesalePrice: 3.46,
                            maxStockLimit: 99999,
                            uom: { version: 2, description: 'EA', code: 'EACH', id: 5 },
                            product: {
                                id: 88,
                                code: 'PROD1',
                                description: 'TEST PRODUCT',
                            },
                            bulk: false,
                            sapNumber: '753609',
                            secondLevelCategory: {
                                version: 41,
                                description: 'AIR FILTER',
                                code: 'AIR FILTER',
                                id: 1,
                            },
                        });

                        const buildNewReceipt = (receiptProducts = [buildNewReceiptProduct()]): ReceiptOfMaterial => ({
                            ...new ReceiptOfMaterial(),
                            store: { version: 90, description: 'TEST STORE', id: 444, code: '000000' },
                            vendor: { version: 1, description: 'TEST VENDOR', code: 'TEST_VEND', id: 3 },
                            receiptType: { description: 'Keep Fill', code: 'KF', id: 99 },
                            receiptProducts,
                        });

                        // Defines a pre existing state that must be met for this test to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const state =
                            'Store with id 444, vendor with id 3, manual receipt type with id 99, and product with id 88 exist and are active';

                        it('should be able to finalize', async () => {
                            const receipt = buildNewReceipt();
                            provider.addInteraction({
                                states: [{ description: state }],
                                uponReceiving: 'A request to finalize a new receipt of material',
                                withRequest: {
                                    ...request,
                                    body: receipt,
                                },
                                willRespondWith: {
                                    status: 200,
                                    body: like({ number: string(), storeId: integer() }),
                                },
                            });

                            await provider.executeTest(async (mockServer) => {
                                api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                                const response = await api.finalize(receipt).toPromise();
                                expect(response).toBeTruthy();
                            });
                        });

                        it('should give an error', async () => {
                            const receipt = buildNewReceipt([buildNewReceiptProduct(-4)]);
                            provider.addInteraction({
                                states: [{ description: state }],
                                uponReceiving:
                                    'A request to finalize a new receipt of material that has a negative quantity received',
                                withRequest: {
                                    ...request,
                                    body: receipt,
                                },
                                willRespondWith: {
                                    status: 400,
                                    body: likeApiErrorResponseWithDetails('400', request.path as string),
                                },
                            });

                            await provider.executeTest(async (mockServer) => {
                                api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                                await api
                                    .finalize(receipt)
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

                    interaction('existing receipt (PUT)', ({ provider, execute }) => {
                        const request: V3Request = {
                            method: 'PUT',
                            path: basePath,
                            headers: standardJsonHeaders(),
                        };

                        const buildExistingReceiptProduct = (
                            quantityReceived = 2,
                            quantityOrdered = 2
                        ): ReceiptOfMaterialProduct => ({
                            ...new ReceiptOfMaterialProduct(),
                            quantityReceived,
                            quantityOrdered,
                            lineNumber: 0,
                            wholesalePrice: 3.46,
                            maxStockLimit: 99999,
                            uom: { version: 2, description: 'EA', code: 'EACH', id: 5 },
                            product: {
                                id: 88,
                                code: 'PROD1',
                                description: 'TEST PRODUCT',
                            },
                            bulk: false,
                            sapNumber: '753609',
                            secondLevelCategory: {
                                version: 41,
                                description: 'AIR FILTER',
                                code: 'AIR FILTER',
                                id: 1,
                            },
                        });

                        const buildExistingReceipt = (
                            receiptProducts = [buildExistingReceiptProduct()]
                        ): ReceiptOfMaterial => ({
                            ...new ReceiptOfMaterial(),
                            store: { version: 90, description: 'TEST STORE', id: 444, code: '000000' },
                            vendor: { version: 1, description: 'TEST VENDOR', code: 'TEST_VEND', id: 3 },
                            status: { version: 1, description: 'Open', code: 'OPEN', id: 5 },
                            receiptType: { version: 1, description: 'Regular', code: 'REG', id: 9 },
                            id: { number: 'R000000123456', storeId: 444 },
                            number: 'R000000123456',
                            sourceStore: { version: 90, description: 'TEST STORE', id: 444, code: '000000' },
                            version: 0,
                            source: '002557',
                            receiptDate: '2021-02-09',
                            shipTo: '10359',
                            createdByEmployee: {
                                id: 'a123456',
                                firstName: 'TEST',
                                lastName: 'USER',
                            },
                            receiptProducts,
                        });

                        // Defines a pre existing state that must be met for the tests to work on the provider side.
                        // This string will need to be matches exactly by a state in the provider tests. This ensure that
                        // necessary relationships exist for the product to be properly created.
                        const existingRegularReceiptOfMaterialWithDetailsState =
                            'A regular receipt with number R000000123456, storeId 444, vendor id 3, quantityOnHand 2, and product id 88 exists';

                        it('should be able to finalize', async () => {
                            const receipt = buildExistingReceipt();
                            provider.addInteraction({
                                states: [{ description: existingRegularReceiptOfMaterialWithDetailsState }],
                                uponReceiving: 'A request to finalize an existing receipt of material',
                                withRequest: {
                                    ...request,
                                    body: receipt,
                                    query: { status: 'FINALIZED', split: 'false' },
                                },
                                willRespondWith: {
                                    status: 200,
                                },
                            });

                            await provider.executeTest(async (mockServer) => {
                                api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                                const response = await api.finalize(receipt).toPromise();
                                expect(response).toBeNull();
                            });
                        });

                        it('should be able to split and finalize', async () => {
                            const receipt = buildExistingReceipt([buildExistingReceiptProduct(1, 2)]);
                            provider.addInteraction({
                                states: [{ description: existingRegularReceiptOfMaterialWithDetailsState }],
                                uponReceiving:
                                    'A request to split and finalize an existing regular receipt of material',
                                withRequest: {
                                    ...request,
                                    body: receipt,
                                    query: { status: 'FINALIZED', split: 'true' },
                                },
                                willRespondWith: {
                                    status: 200,
                                    body: like({ storeCode: string(), number: string() }),
                                },
                            });

                            await provider.executeTest(async (mockServer) => {
                                api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                                const response = await api.finalize(receipt, true).toPromise();
                                expect(response).toBeTruthy();
                            });
                        });

                        it('should give an error', async () => {
                            const receipt = buildExistingReceipt([buildExistingReceiptProduct(-4)]);
                            provider.addInteraction({
                                states: [{ description: existingRegularReceiptOfMaterialWithDetailsState }],
                                uponReceiving:
                                    'A request to finalize an existing receipt of material that has a negative quantity received',
                                withRequest: {
                                    ...request,
                                    body: receipt,
                                    query: { status: 'FINALIZED', split: 'false' },
                                },
                                willRespondWith: {
                                    status: 400,
                                    body: likeApiErrorResponseWithDetails('400', request.path as string),
                                },
                            });

                            await provider.executeTest(async (mockServer) => {
                                api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                                await api
                                    .finalize(receipt)
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
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${basePath}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'number,asc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort(
                            Column.of({
                                apiFieldPath: 'number',
                                name: 'RM Number',
                                type: 'string',
                                searchable: { defaultSearch: true },
                            })
                        ),
                    };

                    it('should search for receipts of material with default search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'receiptDate',
                                dataType: 'dateTime',
                                operator: 'after',
                                values: ['2020-06-21T00:00:00.000'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyPopulatedRegularReceiptOfMaterialState }],
                            uponReceiving:
                                'A request to search for receipts of materials with default restriction(s): receiptDate',
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(receiptOfMaterialSearchResponseBody),
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
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for receipts of material with all search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'store.code',
                                dataType: 'string',
                                operator: '=',
                                values: ['VAL001'],
                            },
                            {
                                fieldPath: 'number',
                                dataType: 'string',
                                operator: '=',
                                values: ['RVAL00112345'],
                            },
                            {
                                fieldPath: 'receiptType',
                                dataType: 'receiptOfMaterialType',
                                operator: '=',
                                values: [1100],
                            },
                            {
                                fieldPath: 'status',
                                dataType: 'receiptOfMaterialStatus',
                                operator: '=',
                                values: [2505],
                            },
                            {
                                fieldPath: 'vendor.description',
                                dataType: 'string',
                                operator: '=',
                                values: ['Test'],
                            },
                            {
                                fieldPath: 'receiptDate',
                                dataType: 'dateTime',
                                operator: 'before',
                                values: ['2020-08-31'],
                            },
                            {
                                fieldPath: 'store.company',
                                dataType: 'company',
                                operator: '=',
                                values: [79605],
                            },
                            {
                                fieldPath: 'finalizedOn',
                                dataType: 'dateTime',
                                operator: 'after',
                                values: ['2020-01-01'],
                            },
                            {
                                fieldPath: 'createdByEmployee.lastName',
                                dataType: 'string',
                                operator: 'starts-with',
                                values: ['Ty'],
                            },
                            {
                                fieldPath: 'finalizedByEmployee.lastName',
                                dataType: 'string',
                                operator: 'ends-with',
                                values: ['D'],
                            },
                            {
                                fieldPath: 'originalNumber',
                                dataType: 'string',
                                operator: 'is-not-null',
                                values: [],
                            },
                            {
                                fieldPath: 'deliveryTicket',
                                dataType: 'string',
                                operator: 'is-null',
                                values: [],
                            },
                            {
                                fieldPath: 'invoiceNumber',
                                dataType: 'string',
                                operator: '!=',
                                values: ['1000'],
                            },
                            {
                                fieldPath: 'poNumber',
                                dataType: 'string',
                                operator: 'contains',
                                values: ['102'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyPopulatedRegularReceiptOfMaterialState }],
                            uponReceiving: `A request to search for receipts of materials with restrictions: ${queryRestrictions
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
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findReceiptProducts', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: basePath,
                    };

                    const storeCode = '000000';
                    const rmNumber = 'R000000678910';

                    const receiptProductsResponseBody = {
                        sourceStore: likeDescribed(),
                        receiptProducts: eachLike({
                            lineNumber: integer(),
                            quantityReceived: integer(),
                            quantityOrdered: integer(),
                            wholesalePrice: integer(),
                            uom: likeDescribed(),
                            product: likeDescribed(),
                            secondLevelCategory: likeDescribed(),
                        }),
                    };

                    it('should return a successful message when finding a receipt', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedRegularReceiptOfMaterialState }],
                            uponReceiving: `A request to find a receipt of material with storeCode: ${storeCode} and rmNumber: ${rmNumber}`,
                            withRequest: {
                                ...request,
                                query: { storeCode, rmNumber },
                            },
                            willRespondWith: {
                                status: 200,
                                body: receiptProductsResponseBody,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const result = await api.findReceiptProducts(storeCode, rmNumber).toPromise();
                            expect(result).toBeTruthy();
                        });
                    });
                });

                interaction('findAssociatedReceiptsOfMaterial', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${basePath}/associated`,
                    };

                    const storeCode = '000000';
                    const sourceStoreCode = '000001';
                    const receiptTypeCode = 'REG';
                    const source = 'VAL0012';

                    const receiptOfMaterialResponseBody = {
                        ...receiptOfMaterialSearchResponseBody,
                        comments: string(),
                        shipTo: string(),
                        store: like({
                            id: integer(),
                            code: string(),
                            description: string(),
                            version: integer(),
                            company: likeDescribed(),
                        }),
                    };

                    // Defines a pre existing state that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created.
                    const state =
                        'A regular receipt of material with storeCode 000000, sourceStoreCode 000001, receiptTypeCode REG, and source VAL0012 has a fully populated associated RM';

                    it('should return successful message when finding an associated rm', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: `A request to find associated receipt of material with storeCode: ${storeCode} and receiptTypeCode: ${receiptTypeCode} and source: ${source}`,
                            withRequest: {
                                ...request,
                                query: { storeCode, receiptTypeCode, source, sourceStoreCode },
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(receiptOfMaterialResponseBody),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            const result = await api
                                .findAssociatedReceiptsOfMaterial(storeCode, receiptTypeCode, source, sourceStoreCode)
                                .toPromise();
                            expect(result).toBeTruthy();
                        });
                    });
                });

                interaction('cancelReceiptOfMaterial', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'DELETE',
                        path: basePath,
                    };

                    // Defines a pre existing state that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created.
                    const state = 'A regular receipt of material with number R000000121212 and storeCode 000000';

                    it('should return a successful message', async () => {
                        const storeCode = '000000';
                        const rmNumber = 'R000000121212';

                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: `A request to cancel a receipt of material with storeCode: ${storeCode} and rmNumber: ${rmNumber}`,
                            withRequest: { ...request, query: { storeCode, rmNumber } },
                            willRespondWith: {
                                status: 200,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ReceiptOfMaterialApi(`${mockServer.url}`, { http });
                            await api.cancelReceiptOfMaterial(storeCode, rmNumber).toPromise();
                        });
                    });
                });
            }
        );
    });
});
