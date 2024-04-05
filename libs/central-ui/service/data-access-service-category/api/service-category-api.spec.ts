import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { boolean, decimal, eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import { Comparators } from '@vioc-angular/shared/util-column';
import {
    acceptJsonHeader,
    likeApiErrorResponse,
    likeDescribed,
    standardJsonHeaders,
} from '@vioc-angular/test/util-test';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServiceCategory } from '../src';
import { ServiceCategoryApi } from './service-category-api';

describe('ServiceCategoryApi', () => {
    let http: HttpClient;
    let api = new ServiceCategoryApi(null, { http: null });

    describe('standard tests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            api.get = jest.fn();
            api.post = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('findByCode', () => {
            it('should delegate to the get method', () => {
                const code = 'TFBC';
                api.findByCode(code);
                expect(api.get).toHaveBeenCalledWith([], { code });
            });
        });

        describe('generateCategories', () => {
            it('should delegate to the post method', () => {
                const code = 'TFBC';
                api.generateCategories([code]);
                expect(api.post).toHaveBeenCalledWith(['codes'], [code]);
            });
        });

        describe('validateParentCategory', () => {
            it('should delegate to get method', () => {
                const parCode = 'TESTPARCODE';
                const currCode = 'TESTCURRCODE';
                api.validateParentCategory(parCode, currCode);
                expect(api.get).toHaveBeenCalledWith(['validate/parent-category'], {
                    parentCategoryCode: parCode,
                    serviceCategoryCode: currCode,
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
            (interaction: JestDescribePactFnV3) => {
                const path = '/v1/service-categories';
                const serviceCategoryRequestBody: ServiceCategory = {
                    ...new ServiceCategory(),
                    active: true,
                    code: '101',
                    carFaxMapping: [],
                    defaultService: null,
                    description: 'test',
                    excludeFromMetrics: false,
                    fleetProductCode: { id: 5675, code: '001', version: 1, description: 'OIL CHANGE' },
                    id: 5550,
                    nacsProductCode: { id: 6153, code: '121', version: 2, description: 'Air Conditioning Service' },
                    nocrGroup: { id: 6092, code: 'CORE', version: 0, description: 'Core NOCR' },
                    parentCategory: { id: 5547, code: '100', version: 2, description: 'Something' },
                    premium: true,
                    serviceInfo: {
                        id: 100,
                        serviceCategory: { id: 101, code: '102', description: 'test', version: 1 },
                        appearOnWorkOrder: true,
                        carSystem: { id: 1, code: '101', description: 'car system test', version: 1 },
                        serviceTime: '20 Minutes',
                        competitivePrice: 100.5,
                        importance: 'important',
                        customerDisplayName: 'Test customer display name',
                        technicalInformationRequired: false,
                        recommendationOrder: 1000,
                        reportGroup: { id: 100, code: '104', description: 'test report group' },
                        version: 10,
                    },
                    version: 8,
                };

                /**
                 * validates that a given param matches the structure of a ServiceCategoryInfo model.
                 * used to validate fields in the body of a response
                 *
                 * const response = {
                 *      serviceInfo: likeServiceCategoryInfo()
                 * }
                 */

                function likeServiceCategoryInfo() {
                    return like({
                        id: integer(),
                        serviceCategory: likeDescribed(),
                        appearOnWorkOrder: boolean(),
                        carSystem: likeDescribed(),
                        serviceTime: string(),
                        competitivePrice: decimal(),
                        importance: string(),
                        customerDisplayName: string(),
                        technicalInformationRequired: boolean(),
                        recommendationOrder: integer(),
                        reportGroup: likeDescribed(),
                        version: integer(),
                    });
                }

                const serviceCategoryResponseBody = {
                    active: boolean(),
                    code: string(),
                    defaultService: likeDescribed(),
                    description: string(),
                    excludeFromMetrics: boolean(),
                    fleetProductCode: likeDescribed(),
                    id: integer(),
                    nacsProductCode: likeDescribed(),
                    nocrGroup: likeDescribed(),
                    parentCategory: likeDescribed(),
                    premium: boolean(),
                    serviceInfo: likeServiceCategoryInfo(),
                    version: integer(),
                };

                const parentServiceCategoryResponseBody = {
                    active: boolean(),
                    code: string(),
                    description: string(),
                    id: integer(),
                    nacsProductCode: likeDescribed(),
                    version: integer(),
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
                            api = new ServiceCategoryApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                interaction('add', ({ provider, execute }) => {
                    const testBody: ServiceCategory = {
                        active: true,
                        code: '10002',
                        carFaxMapping: [],
                        defaultService: null,
                        description: 'test',
                        excludeFromMetrics: false,
                        fleetProductCode: { id: 5675, code: '001', version: 1, description: 'OIL CHANGE' },
                        id: null,
                        nacsProductCode: { id: 6153, code: '121', version: 2, description: 'Air Conditioning Service' },
                        nocrGroup: { id: 6092, code: 'CORE', version: 0, description: 'Core NOCR' },
                        parentCategory: { id: 5547, code: '362071', version: 2, description: 'Something' },
                        premium: true,
                        version: null,
                    };
                    const request: V3Request = {
                        method: 'POST',
                        path,
                        headers: standardJsonHeaders(),
                        body: testBody,
                    };
                    const state =
                        'a fully populated service category with id 5547, NacsProductCode with id 6153, NonOilChangeRevenueGroup with id 6092 and FleetProductCode with id 5675 exist';
                    it('should add a service category', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to add a service category',
                            withRequest: { ...request, query: { 'Content-Type': 'application/json' } },
                            // mock provider will return a response of 200 with no body, this will then be validated on the
                            // provider side
                            willRespondWith: { status: 200 },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceCategoryApi(`${mockServer.url}`, { http });
                            await api.add(testBody).toPromise();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    const state = 'service category exists';
                    const request: V3Request = {
                        method: 'POST',
                        path: `${path}/search`,
                        headers: standardJsonHeaders(),
                        body: [],
                        query: { page: '0', size: '20', sort: 'code,asc' },
                    };

                    const querySearch: QuerySearch = {
                        queryRestrictions: [],
                        page: new QueryPage(0, 20),
                        sort: new QuerySort({ apiSortPath: 'code' } as any, 'asc'),
                    };

                    it('should search category for service category with no search criteria', async () => {
                        const state = 'multiple service categories exist';
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a request to search for service category with no criteria',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike(parentServiceCategoryResponseBody),
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
                            api = new ServiceCategoryApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions: [] }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });

                    it('should accept all possible query restriction', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'code',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: [101],
                            },
                            {
                                fieldPath: 'description',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: ['test'],
                            },
                            {
                                fieldPath: 'fleetProductCode',
                                dataType: 'fleetProductCode',
                                operator: Comparators.equalTo.value,
                                values: [5694],
                            },
                            {
                                fieldPath: 'excludeFromMetrics',
                                dataType: 'boolean',
                                operator: Comparators.falseOrBlank.value,
                                values: [false],
                            },
                            {
                                fieldPath: 'nacsProductCode',
                                dataType: 'nacsProductCode',
                                operator: Comparators.equalTo.value,
                                values: [6168],
                            },
                            {
                                fieldPath: 'nocrGroup',
                                dataType: 'nonOilChangeRevenueGroup',
                                operator: Comparators.equalTo.value,
                                values: [6092],
                            },
                            {
                                fieldPath: 'parentCategory.description',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: ['Something'],
                            },
                            {
                                fieldPath: 'premium',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [true],
                            },
                            {
                                fieldPath: 'serviceInfo.carSystem',
                                dataType: 'carSystem',
                                operator: Comparators.equalTo.value,
                                values: [1007],
                            },
                            {
                                fieldPath: 'serviceInfo.appearOnWorkOrder',
                                dataType: 'boolean',
                                operator: Comparators.falseOrBlank.value,
                                values: [false],
                            },
                            {
                                fieldPath: 'serviceInfo.technicalInformationRequired',
                                dataType: 'boolean',
                                operator: Comparators.falseOrBlank.value,
                                values: [false],
                            },
                            {
                                fieldPath: 'serviceInfo.competitivePrice',
                                dataType: 'decimal',
                                operator: Comparators.equalTo.value,
                                values: [500],
                            },
                            {
                                fieldPath: 'serviceInfo.serviceTime',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: [1007],
                            },
                            {
                                fieldPath: 'defaultService.code',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: [1007],
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
                            api = new ServiceCategoryApi(`${mockServer.url}`, { http });
                            const results = await api.query({ ...querySearch, queryRestrictions }).toPromise();
                            expect(results.totalElements).toBeTruthy();
                            expect(results.content).toBeTruthy();
                        });
                    });
                });

                interaction('findByCode', ({ provider, execute }) => {
                    const state = 'a fully populated service category with code 101 and service exists';

                    const request: V3Request = {
                        method: 'GET',
                        path,
                        headers: acceptJsonHeader(),
                        query: { code: serviceCategoryRequestBody.code },
                    };

                    it('should return service category with the given code', async () => {
                        await provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'a request to find service category by code',
                            withRequest: request,
                            willRespondWith: {
                                status: 200,
                                body: serviceCategoryResponseBody,
                            },
                        });
                        provider.executeTest(async (mockServer) => {
                            api = new ServiceCategoryApi(`${mockServer.url}`, { http });
                            await api.findByCode(serviceCategoryRequestBody.code).toPromise();
                        });
                    });
                });

                interaction('validateParentCategory_NotInCircularForm', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/validate/parent-category`,
                        headers: acceptJsonHeader(),
                        query: {
                            parentCategoryCode: `${serviceCategoryRequestBody.parentCategory.code}`,
                            serviceCategoryCode: `${serviceCategoryRequestBody.code}`,
                        },
                    };

                    const state =
                        'a service category with code 101 and parent category with code 100 should not be a circular reference and exist';
                    it('should return 200 if service category code and parent category code exist and are not circular reference ', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to check if service category exists without circular reference',
                            withRequest: request,
                            willRespondWith: { status: 200 },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceCategoryApi(`${mockServer.url}`, { http });
                            await api
                                .validateParentCategory(
                                    serviceCategoryRequestBody.parentCategory.code,
                                    serviceCategoryRequestBody.code
                                )
                                .toPromise();
                        });
                    });
                });

                interaction('validateParentCategory_InCircularForm', ({ provider, execute }) => {
                    const request: V3Request = {
                        method: 'GET',
                        path: `${path}/validate/parent-category`,
                        headers: acceptJsonHeader(),
                        query: {
                            parentCategoryCode: `${serviceCategoryRequestBody.parentCategory.code}`,
                            serviceCategoryCode: `${serviceCategoryRequestBody.code}`,
                        },
                    };

                    const state =
                        'a service category with code 101 and parent category with code 100 in a circular reference and exist';
                    it('should return 400 if service category code and parent category code exist and are in circular reference ', async () => {
                        provider.addInteraction({
                            states: [{ description: state }],
                            uponReceiving: 'A request to check the service category for circular reference',
                            withRequest: request,
                            willRespondWith: {
                                status: 400,
                                body: likeApiErrorResponse('400', request.path as string),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new ServiceCategoryApi(`${mockServer.url}`, { http });
                            await api
                                .validateParentCategory(
                                    serviceCategoryRequestBody.parentCategory.code,
                                    serviceCategoryRequestBody.code
                                )
                                .pipe(
                                    catchError((error) => {
                                        expect(instanceOfApiErrorResponse(error.error)).toBeTruthy();
                                        return EMPTY;
                                    })
                                )
                                .toPromise();
                        });
                    });
                });
            }
        );
    });
});
