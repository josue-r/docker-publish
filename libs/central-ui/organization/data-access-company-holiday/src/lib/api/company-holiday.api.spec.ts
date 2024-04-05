import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { CompanyHoliday, StoreHoliday } from '../model/company-holiday.model';
import { CompanyHolidayApi } from './company-holiday.api';
import moment = require('moment');

describe('CompanyHolidayApi', () => {
    let http: HttpClient;
    let api: CompanyHolidayApi;

    const path = '/v1/company-holidays';

    const company: Described = {
        id: 88,
        code: 'VAL',
        description: 'VALVOLINE',
    };

    const storeHoliday: StoreHoliday = {
        id: 77,
        store: { id: 11, code: 'code11', description: 'store11', version: 11 },
        closed: true,
    };

    const companyHolidayRequestBody: CompanyHoliday = {
        ...new CompanyHoliday(),
        id: 999,
        version: 0,
        company: company,
        holidayDate: '2022-08-08',
        storeClosed: true,
        storeHolidays: [storeHoliday],
    };

    describe('non-contract tests', () => {
        beforeEach(() => {
            api = new CompanyHolidayApi(null, { http: null });
            api.get = jest.fn();
            api.post = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('findByCompanyAndDate', () => {
            it('should delegate to GET method for company holiday', () => {
                api.findByCompanyAndDate('COMPANY', '2022-07-08');
                expect(api.get).toHaveBeenCalledWith([], { company: 'COMPANY', date: '2022-07-08' });
            });
        });
    });

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'organization-api',
                cors: true,
            },
            (interaction) => {
                const companyHolidaySearchResponseBody = {
                    id: integer(),
                    version: integer(),
                    company: likeDescribed(),
                    name: string(),
                    holidayDate: string(),
                    storeClosed: boolean(),
                };

                const fullyPopulatedCompanyHolidayState =
                    'An 8/8/2022 company holiday with id 999 for company VAL should be fully populated with valid storeHoliday containing a store with id 11';

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new CompanyHolidayApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'name,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'name' } as any, 'desc'),
                    };

                    it('should return results with default search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'holidayDate',
                                dataType: 'date',
                                operator: '=',
                                values: ['2022-08-08'],
                            },
                        ];
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedCompanyHolidayState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(companyHolidaySearchResponseBody),
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
                            api = new CompanyHolidayApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for company holiday with all search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'company.code',
                                dataType: 'string',
                                operator: '=',
                                values: ['VAL'],
                            },
                            {
                                fieldPath: 'holidayDate',
                                dataType: 'date',
                                operator: '=',
                                values: ['2022-08-01'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyPopulatedCompanyHolidayState }],
                            uponReceiving: `A request to search for a companyHoliday with restrictions: ${queryRestrictions
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
                            api = new CompanyHolidayApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findByCompanyAndDate', ({ provider, execute }) => {
                    const storeHolidayResponseBody = {
                        id: integer(),
                        store: likeDescribed(),
                        closed: boolean(),
                    };

                    const companyHolidayResponseBody = {
                        id: integer(),
                        version: integer(),
                        company: likeDescribed(),
                        name: string(),
                        holidayDate: string(),
                        storeClosed: boolean(),
                        holiday: likeDescribed(),
                        storeHolidays: eachLike(storeHolidayResponseBody),
                    };

                    const companyHolidayResponse = {
                        status: 200,
                        body: companyHolidayResponseBody,
                    };

                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'GET',
                        path,
                        query: {
                            company: `${companyHolidayRequestBody.company.code}`,
                            date: `${companyHolidayRequestBody.holidayDate}`,
                        },
                    };

                    it('should return company holiday with given company code and  company holiday', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedCompanyHolidayState }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to find By company code and holiday date',
                            withRequest: request,
                            // mock provider will return a response of 200 with companyHolidayResponse body
                            willRespondWith: companyHolidayResponse,
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new CompanyHolidayApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api
                                .findByCompanyAndDate(
                                    companyHolidayRequestBody.company.code,
                                    companyHolidayRequestBody.holidayDate
                                )
                                .toPromise();
                        });
                    });
                });

                interaction('update', ({ provider, execute }) => {
                    const updateCompanyHoliday = {
                        ...companyHolidayRequestBody,
                        storeHolidays: [{ ...storeHoliday, closed: false }],
                    };
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'PUT',
                        path,
                        headers: standardJsonHeaders(),
                        body: updateCompanyHoliday,
                    };

                    it('should update the company holiday', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedCompanyHolidayState }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to update company holiday',
                            withRequest: { ...request, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new CompanyHolidayApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.update(updateCompanyHoliday).toPromise();
                        });
                    });
                });
            }
        );
    });
});
