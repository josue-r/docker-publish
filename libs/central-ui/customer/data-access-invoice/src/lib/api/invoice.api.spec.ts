import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { like, eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';

import { InvoiceApi } from '../api/invoice.api';
describe('InvoiceApi', () => {
    const api = new InvoiceApi(null, { http: null });

    describe('non-contract tests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            api.query = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });
    });

    describe('contract tests', () => {
        let http: HttpClient;
        let api: InvoiceApi;

        const path = '/v1/invoices';

        pactWith(
            {
                consumer: 'central-ui',
                provider: 'invoice-api',
                cors: true,
            },
            (interaction) => {
                //Setup response body structure
                const customerAddressResponseBody = {
                    state: string(),
                };
                const customerResponseBody = {
                    id: string(),
                    firstName: string(),
                    lastName: string(),
                    email: string(),
                };
                const vehicleResponseBody = {
                    id: string(),
                    vin: string(),
                    makeDescription: string(),
                    modelDescription: string(),
                    year: integer(),
                    engineDescription: string(),
                };
                const invoiceSearchResponseBody = {
                    invoiceNumber: integer(),
                    customer: like(customerResponseBody),
                    customerAddress: like(customerAddressResponseBody),
                    store: likeDescribed(),
                    vehicle: like(vehicleResponseBody),
                    totalDue: integer(),
                };

                //Setup states
                const storeCode = '000000';
                const invoiceDate = '2023-01-02';
                const defaultCriteriaState = `A fully populated invoice with storeCode ${storeCode} and default search criteria`;
                const invoiceDateCriteriaState = `A fully populated invoice with storeCode ${storeCode} and invoiceDate of ${invoiceDate}`;

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new InvoiceApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'invoiceNumber,asc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'invoiceNumber' } as any, 'asc'),
                    };

                    /*Testing the results of an empty search, using a state with invoiceDate of yesterday 
                    because backend returns results within the default period of the last fortnight when 
                    no query restritions are passed in the request.*/
                    it('should return results for default search criteria', async () => {
                        provider.addInteraction({
                            states: [{ description: defaultCriteriaState }],
                            uponReceiving: 'a search for a request with the default restriction',
                            withRequest: {
                                ...request,
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(invoiceSearchResponseBody),
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
                            api = new InvoiceApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should return results for search with criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'invoiceDate',
                                dataType: 'dateTime',
                                operator: 'between',
                                values: ['2023-01-01', '2023-02-02'],
                            },
                        ];
                        provider.addInteraction({
                            states: [{ description: invoiceDateCriteriaState }],
                            uponReceiving: `a search request with restrictions: ${queryRestrictions
                                .map((q) => q.fieldPath)
                                .join()}`,
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(invoiceSearchResponseBody),
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
                            api = new InvoiceApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });
            }
        );
    });
});
