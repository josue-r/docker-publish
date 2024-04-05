import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { boolean, eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { V3Request } from '@pact-foundation/pact';
import { nullValue } from '@pact-foundation/pact/src/v3/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Comparators } from '@vioc-angular/shared/util-column';
import { likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';
import { DiscountApi } from './discount.api';

describe('DiscountApi', () => {
    let http: HttpClient;
    let api: DiscountApi;
    const pathV1 = '/v1/discounts';
    const pathV2 = '/v2/discounts';

    describe('non-contract tests', () => {
        beforeEach(() => {
            api = new DiscountApi(null, { http: null });
            api.post = jest.fn();
            api.get = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('findByCodeAndCompany', () => {
            it('should delegate to the GET method', () => {
                const code = 'test';
                const companyCode = 'testCompany';
                api.findByCodeAndCompany(code, companyCode);
                expect(api.get).toHaveBeenCalledWith(['v1/discounts'], {
                    discountCode: code,
                    companyCode: companyCode,
                });
            });
        });

        describe('findByCodeAndCompanyV2', () => {
            it('should delegate to the GET method for local discounts', () => {
                const code = 'test';
                const companyCode = 'testCompany';
                api.findByCodeAndCompanyV2(code, companyCode);
                expect(api.get).toHaveBeenCalledWith(['v2/discounts'], {
                    discountCode: code,
                    companyCode: companyCode,
                });
            });

            it('should delegate to the GET method for national discounts', () => {
                const code = 'test';
                const companyCode = null;
                api.findByCodeAndCompanyV2(code, companyCode);
                expect(api.get).toHaveBeenCalledWith(['v2/discounts'], { discountCode: code });
            });
        });
    });

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'discount-api',
                cors: true,
            },
            (interaction: JestDescribePactFnV3) => {
                const discountSearchResponseBody = {
                    id: integer(),
                    company: likeDescribed(),
                    startDate: string(),
                    endDate: string(),
                    code: string(),
                    description: string(),
                    type: likeDescribed(),
                    active: boolean(),
                    national: boolean(),
                    approach: likeDescribed(),
                };

                const discountId = '114488';
                const discountCode = 'VALA01B';
                const companyCode = 'VAL';
                const nationalDiscountCode = 'NANA01B';
                const fullyPopulatedDiscountState = `A fully populated local discount with discountId ${discountId}, discountCode ${discountCode} and companyCode ${companyCode}`;
                const fullyPopulatedNationalDiscountState = `A fully populated national discount with discountCode ${nationalDiscountCode}`;

                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new DiscountApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${pathV1}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'code,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'code' } as any, 'desc'),
                    };

                    it('should return results for default search', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'endDate',
                                dataType: 'date',
                                operator: 'after',
                                values: ['2022-08-01'],
                            },
                        ];
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedDiscountState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(discountSearchResponseBody),
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
                            api = new DiscountApi(`${mockServer.url}${pathV1}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for store with all search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'company.code',
                                dataType: 'string',
                                operator: '=',
                                values: ['VAL'],
                            },
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'id',
                                dataType: 'integer',
                                operator: '=',
                                values: [114488],
                            },
                            {
                                fieldPath: 'description',
                                dataType: 'string',
                                operator: '=',
                                values: ['$7 OFF OC ANYTIME'],
                            },
                            {
                                fieldPath: 'endDate',
                                dataType: 'date',
                                operator: 'after',
                                values: ['2022-08-10'],
                            },
                            {
                                fieldPath: 'startDate',
                                dataType: 'date',
                                operator: 'before',
                                values: ['2022-08-10'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: fullyPopulatedDiscountState }],
                            uponReceiving: `A request to search for a discount with restrictions: ${queryRestrictions
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
                            api = new DiscountApi(`${mockServer.url}${pathV1}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findByCodeAndCompany', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: pathV1,
                        query: { discountCode: `${discountCode}`, companyCode: `${companyCode}` },
                    };

                    it('should return the discount', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedDiscountState }],
                            uponReceiving: `A request to find a discount with code: ${discountCode} and companyCode: ${companyCode}`,
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: discountSearchResponseBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new DiscountApi(`${mockServer.url}`, { http });
                            const response = await api
                                .findByCodeAndCompany(`${discountCode}`, `${companyCode}`)
                                .toPromise();
                            expect(response).toBeTruthy();
                        });
                    });

                    it('should return the national discount', async () => {
                        provider.addInteraction({
                            states: [{ description: fullyPopulatedNationalDiscountState }],
                            uponReceiving: `A request to find a national discount with code: ${nationalDiscountCode}`,
                            withRequest: {
                                ...request,
                                query: { discountCode: `${nationalDiscountCode}` },
                            },
                            willRespondWith: {
                                status: 200,
                                body: discountSearchResponseBody,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new DiscountApi(`${mockServer.url}`, { http });
                            const response = await api.findByCodeAndCompany(`${nationalDiscountCode}`).toPromise();
                            expect(response).toBeTruthy();
                        });
                    });
                });

                const nationalDiscountSearchResponseBody = {
                    id: integer(),
                    company: nullValue(),
                    startDate: string(),
                    endDate: string(),
                    code: string(),
                    description: string(),
                    type: likeDescribed(),
                    active: boolean(),
                    national: boolean(),
                    approach: likeDescribed(),
                };

                const natDiscountCode = 'NACI031';
                const locDiscountCode = 'LOC032';
                const startDate = '2020-01-31';
                const endDate = '2024-02-02';
                const description = 'Oil Filter';

                const nationalSearchDiscountState = `A fully populated national discount with discountCode ${natDiscountCode}`;
                const localSearchDiscountState = `A fully populated local discount with discountCode ${locDiscountCode}`;
                const criteriaSearchDiscountState = `A fully populated national discount with discountCode ${natDiscountCode}, startDate of ${startDate}, endDate of ${endDate}, description of ${description}`;

                interaction('search v2', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'POST',
                        path: `${pathV2}/search`,
                        headers: standardJsonHeaders(),
                        query: { page: '0', size: '20', sort: 'code,desc' },
                    };
                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'code' } as any, 'desc'),
                    };

                    it('should return results for default search', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'endDate',
                                dataType: 'date',
                                operator: 'after',
                                values: ['2024-02-01'],
                            },
                            {
                                fieldPath: 'national',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                        ];
                        provider.addInteraction({
                            states: [{ description: nationalSearchDiscountState }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(nationalDiscountSearchResponseBody),
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
                            api = new DiscountApi(`${mockServer.url}${pathV2}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for local discounts', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'endDate',
                                dataType: 'date',
                                operator: 'after',
                                values: ['2024-02-01'],
                            },
                            {
                                fieldPath: 'national',
                                dataType: 'boolean',
                                operator: Comparators.falseOrBlank.value,
                                values: [],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: localSearchDiscountState }],
                            uponReceiving: `A request to search for a discount with restrictions: ${queryRestrictions
                                .map((q) => q.fieldPath)
                                .join()}`,
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(discountSearchResponseBody),
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
                            api = new DiscountApi(`${mockServer.url}${pathV2}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should search for discounts with some extra search criteria', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'endDate',
                                dataType: 'date',
                                operator: 'after',
                                values: ['2024-02-01'],
                            },
                            {
                                fieldPath: 'national',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'startDate',
                                dataType: 'date',
                                operator: 'before',
                                values: ['2022-02-01'],
                            },
                            {
                                fieldPath: 'code',
                                dataType: 'string',
                                operator: 'starts-with',
                                values: ['NA'],
                            },
                            {
                                fieldPath: 'description',
                                dataType: 'string',
                                operator: 'contains',
                                values: ['Oil'],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: criteriaSearchDiscountState }],
                            uponReceiving: `A request to search for a discount with restrictions: ${queryRestrictions
                                .map((q) => q.fieldPath)
                                .join()}`,
                            withRequest: {
                                ...request,
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(nationalDiscountSearchResponseBody),
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
                            api = new DiscountApi(`${mockServer.url}${pathV2}`, { http });
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
