import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { Column } from '@vioc-angular/shared/util-column';
import { likeApiErrorResponseWithDetails, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ProductApi } from './product-api';

describe('ProductApi', () => {
    let http: HttpClient;
    let api: ProductApi;

    const path = '/v1/products';

    const productRequestBody: Product = {
        ...new Product(),
        id: 999,
        code: 'P1',
        description: 'Product 1',
        version: 0,
        inventoryDescription: 'Inventory Product 1',
        sapNumber: '',
        active: true,
        bulk: false,
        tankStorage: false,
        obsolete: false,
        reportOrder: '001',
        defaultUom: { id: 2477 },
        productCategory: { id: 1198 },
        type: { id: 1003 },
        relatedProductCode: 'P1',
        supportsECommerce: false,
    };

    describe('contract tests', () => {
        // standard configuration for running tests in pact. Sets up the mocked provider to add interaction to
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
                            api = new ProductApi(`${mockServer.url}`, { http });
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
                        body: productRequestBody,
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state =
                        'a uom with id 2477 exists, a productCategory with id 1198 exists, and a product type with id 1003 exists';

                    it('should add a product', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to add a product',
                            withRequest: { ...request, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: { status: 200 },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.add(productRequestBody).toPromise();
                        });
                    });

                    it('should give error when adding bad product', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that 100 a's as a product code will give an error on the api side
                        const body = {
                            ...productRequestBody,
                            code: 'a'.repeat(100),
                            relatedProductCode: 'a'.repeat(100),
                        };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to add a bad product',
                            withRequest: { ...request, body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', path),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
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
                            // ensure the instace of assertion was done
                            expect.assertions(1);
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

                    const findUsageResponse = {
                        status: 200,
                        body: eachLike(findUsageResponseBody),
                    };
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/usage`,
                        headers: standardJsonHeaders(),
                        body: [productRequestBody.id],
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state = 'a product with id 999 exists';

                    it('should return the usage of passed product ids', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to find the usage of product ids',
                            withRequest: request,
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: findUsageResponse,
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            const response = await api.findUsage([productRequestBody.id]).toPromise();
                            expect(response[0].description).toBeTruthy();
                            expect(response[0].companyResourceCount).toBeTruthy();
                            expect(response[0].storeResourceCount).toBeTruthy();
                        });
                    });
                });

                interaction('deactivate', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PATCH',
                        path: `${path}/deactivate`,
                        headers: standardJsonHeaders(),
                        body: [productRequestBody.id],
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state = 'A valid product should exist';

                    it('should deactivate the product', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to deactivate the product',
                            withRequest: request,
                            // mock provider will return a response of 200 with body containing an integer value
                            willRespondWith: { status: 200, body: integer() },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.deactivate([productRequestBody.id]).toPromise();
                        });
                    });
                });

                interaction('activate', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PATCH',
                        path: `${path}/activate`,
                        headers: standardJsonHeaders(),
                        body: [productRequestBody.id],
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state = 'A valid product should exist';

                    it('should activate the product', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to activate the product',
                            withRequest: request,
                            // mock provider will return a response of 200 with body containing an integer value
                            willRespondWith: { status: 200, body: integer() },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.activate([productRequestBody.id]).toPromise();
                        });
                    });
                });

                interaction('datasync', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/datasync`,
                        headers: standardJsonHeaders(),
                        body: [productRequestBody.id],
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state = 'A valid product should exist';

                    it('should datasync the given product ids', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to datasync the product',
                            withRequest: request,
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: { status: 200, body: integer() },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.dataSync([productRequestBody.id]).toPromise();
                        });
                    });
                });

                interaction('productAssigned', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/productAssigned`,
                        headers: standardJsonHeaders(),
                        query: { id: `${productRequestBody.id}` },
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state = 'a product with id 999 exists';

                    it('should check if the given product is assigned to any company or store', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to check if product is assigned',
                            withRequest: request,
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: { status: 200, body: boolean() },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.isProductAssigned(productRequestBody).toPromise();
                        });
                    });
                });

                interaction('findByCode', ({ provider, execute }) => {
                    const productMotorMappingResponseBody = {
                        id: integer(),
                        motorKey: string(),
                        version: integer(),
                        updatedOn: string(),
                        updatedBy: string(),
                    };

                    const productResponseBody = {
                        id: integer(),
                        code: string(),
                        description: string(),
                        version: integer(),
                        relatedProductCode: string(),
                        inventoryDescription: string(),
                        sapNumber: string(),
                        active: boolean(),
                        bulk: boolean(),
                        tankStorage: boolean(),
                        obsolete: boolean(),
                        upc: string(),
                        reportOrder: string(),
                        defaultUom: likeDescribed(),
                        productCategory: likeDescribed(),
                        type: likeDescribed(),
                        vendorType: likeDescribed(),
                        fluidGroup: likeDescribed(),
                        productMotorMapping: eachLike(productMotorMappingResponseBody),
                        updatedOn: string(),
                        updatedBy: string(),
                        supportsECommerce: boolean(),
                    };

                    const productResponse = {
                        status: 200,
                        body: productResponseBody,
                    };
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'GET',
                        path,
                        headers: standardJsonHeaders(),
                        query: { code: `${productRequestBody.code}` },
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state =
                        'a product with id 999 should be fully populated with valid product motor mapping and each field having non null value';

                    it('should return product with the given code', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to find product by code',
                            withRequest: request,
                            // mock provider will return a response of 200 with productResponse body
                            willRespondWith: productResponse,
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.findByCode(productRequestBody.code).toPromise();
                        });
                    });
                });

                interaction('update', ({ provider, execute }) => {
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PUT',
                        path,
                        headers: standardJsonHeaders(),
                        body: productRequestBody,
                    };
                    const updateProduct = { ...productRequestBody, description: 'Test update product' };

                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensures that
                    // necessary relationships exist for the produt to be properly updated
                    const state =
                        'a product with id 999 exists, a uom with id 2477 exists, a productCategory with id 1198 exists, and a product type with id 1003 exists';

                    it('should update the product', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update a product',
                            withRequest: {
                                ...request,
                                body: updateProduct,
                                query: { 'Content-Type': 'application/json' },
                            },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: {
                                status: 200,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.update(updateProduct).toPromise();
                        });
                    });

                    it('should give error when updating bad product', async () => {
                        // give a request that is reasonably certain to give an error response. Specific errors should not be
                        // tested, just that the response looks the way that it should. In this case it's a reasonable assumption
                        // that 100 a's as a description will give an error on the api side
                        const body = { ...productRequestBody, description: 'a'.repeat(100) };
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update a bad product',
                            withRequest: { ...request, body, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response status of 400 and a response body that matches the structure
                            // of an api error response. This will then be used for validation on the provider side that the
                            // response matches the structure defined here
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponseWithDetails('400', path),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
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
                            // ensure the instace of assertion was done
                            expect.assertions(1);
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        // match the query parameters provided to the api call
                        query: { page: '0', size: '20', sort: 'code,asc' },
                    };
                    // this matches only exactly what is returned by the search projection in the api, it does not map
                    // to a full Product class
                    const productSearchResponseBody = {
                        id: integer(),
                        code: string(),
                        productCategory: likeDescribed(),
                        active: boolean(),
                        description: string(),
                        defaultUom: likeDescribed(),
                        inventoryDescription: string(),
                        sapNumber: string(),
                        upc: string(),
                        relatedProductCode: string(),
                        obsolete: boolean(),
                        bulk: boolean(),
                        tankStorage: boolean(),
                        type: likeDescribed(),
                        vendorType: likeDescribed(),
                        fluidGroup: likeDescribed(),
                        reportOrder: string(),
                    };
                    // query search parameters provided to the api, no criteria for this test case
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort(
                            Column.of({
                                apiFieldPath: 'code',
                                name: 'Product Code',
                                type: 'string',
                                searchable: { defaultSearch: true },
                            })
                        ),
                    };
                    // mock provider will return a 200 response with an array of content that looks like
                    // search projection products, as well as the page information. This response will be
                    // validated against in the provider tests
                    const searchReturn = {
                        status: 200,
                        body: {
                            content: eachLike(productSearchResponseBody),
                            page: {
                                size: integer(),
                                totalElements: integer(),
                                totalPages: integer(),
                                number: integer(),
                            },
                        },
                    };

                    it('should search for products with no search criteria', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            // ensure at least one product is in the database
                            states: [{ description: 'a product exists' }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to search for products with no criteria',
                            withRequest: { ...request, body: [] },
                            willRespondWith: searchReturn,
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ProductApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            // validate the reponse has values
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });
            }
        );
    });
});
