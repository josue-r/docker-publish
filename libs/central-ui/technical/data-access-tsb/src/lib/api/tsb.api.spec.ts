import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { boolean, eachLike, integer, like, regex, somethingLike, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Comparators } from '@vioc-angular/shared/util-column';
import { likeDateTimeWithMillis, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { Tsb } from '../model/tsb.model';
import { TsbApi } from './tsb.api';

describe('TsbApi', () => {
    let http: HttpClient;
    let api: TsbApi;
    const path = '/v1/tsbs';

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'tsb-alert-api',
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
                            api = new TsbApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                const states = {
                    TSB_EXISTS:
                        'a Tsb[id=-1] with a DocumentFile, a ServiceCategory, and a fully populated TsbVehicle that has a TsbVehicleAttribute exists',
                    TSB_EXISTS_FOR_UPDATE:
                        'a Tsb[id=-1], a ServiceCategory[id=-2], a TsbVehicle[id=-1], an AcesAttributeType[id=-3], and a DocumentFile[id=-2] exist and technical vehicle data is available for Make[id=-76], Model[id=-1032]',
                    ADDING_A_TSB:
                        'a ServiceCategory[id=-3] and an AcesAttributeType[id=-2] exist and technical vehicle data is available for Make[id=-76], Model[id=-1032]',
                };

                const tsbInitialBodyMatcher = {
                    id: integer(),
                    name: string(),
                    active: boolean(),
                    serviceCategory: likeDescribed(),
                    externalLink: regex({ matcher: 'http.*', generate: 'http://www.vioc.com' }),
                    documentFile: like({
                        id: integer(),
                        fileName: string(),
                        document: string(),
                        mimeType: string(),
                    }),
                    updatedOn: likeDateTimeWithMillis(),
                    updatedBy: string(),
                    version: integer(),
                    vehicles: eachLike({
                        id: integer(),
                        yearStart: integer(),
                        yearEnd: integer(),
                        makeId: integer(),
                        modelId: integer(),
                        engineConfigId: integer(),
                        attributes: eachLike({
                            type: somethingLike({
                                id: integer(),
                                description: string(),
                            }),
                            key: integer(),
                        }),
                    }),
                };

                interaction('findById', ({ provider, execute }) => {
                    it('should return a tsb', async () => {
                        provider.addInteraction({
                            states: [{ description: states.TSB_EXISTS }],
                            uponReceiving: 'a request for a tsb with an id of -1',
                            withRequest: {
                                method: 'GET',
                                headers: { Accept: like('application/json') },
                                path: `${path}/-1`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: tsbInitialBodyMatcher,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            // execute call
                            await api.findById(-1).toPromise();
                        });
                    });
                });

                interaction('updateTsb', ({ provider, execute }) => {
                    const updateRequestBody: Tsb = {
                        id: -1,
                        name: 'Updated Name',
                        active: true,
                        serviceCategory: { id: -2 },
                        externalLink: 'http://www.vioc.com',
                        documentFile: { id: -2 }, // indicates no changes to an existing document
                        version: 0,
                        vehicles: [
                            {
                                id: -1, // indicates an update
                                yearStart: 2019,
                                yearEnd: 2022,
                                makeId: 76,
                                modelId: 1032,
                                engineConfigId: null,
                                attributes: [{ type: { id: -3 }, key: 5, version: 0 }],
                                version: 0,
                            },
                            {
                                id: null, // indicates an add
                                yearStart: 2019,
                                yearEnd: 2022,
                                makeId: 76,
                                modelId: 1032,
                                engineConfigId: null,
                                attributes: [{ type: { id: -3 }, key: 6 }],
                            },
                        ],
                    };
                    it('should update the tsb without updating the document if only the document id is provided', async () => {
                        provider.addInteraction({
                            states: [{ description: states.TSB_EXISTS_FOR_UPDATE }],
                            uponReceiving: 'a request to update a tsb with an id of 1 without updating the document',
                            withRequest: {
                                method: 'PUT',
                                path,
                                headers: standardJsonHeaders(),
                                body: updateRequestBody,
                                query: { 'Content-Type': 'application/json' },
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            // execute call
                            await api.save(updateRequestBody).toPromise();
                        });
                    });
                    it('should update the tsb and update the document if new document data is provided', async () => {
                        const updateRequestBodyWithDocumentChanges = {
                            ...updateRequestBody,
                            documentFile: {
                                id: -2,
                                fileName: 'Updated File.pdf',
                                document: btoa('some-encoded-bytes'),
                                mimeType: 'application/pdf',
                                version: 0,
                            },
                        };

                        provider.addInteraction({
                            states: [{ description: states.TSB_EXISTS_FOR_UPDATE }],
                            uponReceiving: 'a request to update a tsb with an id of 1 including document changes',
                            withRequest: {
                                method: 'PUT',
                                path,
                                headers: standardJsonHeaders(),
                                body: updateRequestBodyWithDocumentChanges,
                                query: { 'Content-Type': 'application/json' },
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            // execute call
                            await api.save(updateRequestBodyWithDocumentChanges).toPromise();
                        });
                    });
                });

                interaction('add', ({ provider, execute }) => {
                    const addRequestBody: Tsb = {
                        id: null,
                        name: 'Added Name',
                        active: true,
                        serviceCategory: { id: -3 },
                        externalLink: 'http://www.vioc.com',
                        documentFile: null,
                        version: undefined, // important to not be set!
                        vehicles: [
                            {
                                id: null,
                                yearStart: 2019,
                                yearEnd: 2022,
                                makeId: -76,
                                modelId: -1032,
                                engineConfigId: null,
                                attributes: [{ type: { id: -2 }, key: 5 }],
                            },
                        ],
                    };

                    it('should add a new tsb without a document', async () => {
                        provider.addInteraction({
                            states: [{ description: states.ADDING_A_TSB }],
                            uponReceiving: 'a request to add a tsb without a document',
                            withRequest: {
                                method: 'POST',
                                path,
                                headers: standardJsonHeaders(),
                                body: addRequestBody,
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            // execute call
                            await api.save(addRequestBody).toPromise();
                        });
                    });
                    it('should add a new tsb with a document', async () => {
                        const addRequestBodyWithNewDocument = {
                            ...addRequestBody,
                            externalLink: null,
                            documentFile: {
                                id: null,
                                fileName: 'Added File.pdf',
                                document: btoa('some-encoded-bytes'),
                                mimeType: 'application/pdf',
                            },
                        };

                        provider.addInteraction({
                            states: [{ description: states.ADDING_A_TSB }],
                            uponReceiving: 'a request to add a tsb with a document',
                            withRequest: {
                                method: 'POST',
                                path,
                                headers: standardJsonHeaders(),
                                body: addRequestBodyWithNewDocument,
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            // execute call
                            await api.save(addRequestBodyWithNewDocument).toPromise();
                        });
                    });
                });

                interaction('activate', ({ provider, execute }) => {
                    it('should return the number of records activated', async () => {
                        provider.addInteraction({
                            states: [{ description: '' }],
                            uponReceiving: 'a request to activate ids [1,2,3,4,5]',
                            withRequest: {
                                method: 'PATCH',
                                path: `${path}/activate`,
                                headers: standardJsonHeaders(),
                                body: [1, 2, 3, 4, 5],
                            },
                            willRespondWith: {
                                status: 200,
                                body: integer(),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            await api.activate([1, 2, 3, 4, 5]).toPromise();
                        });
                    });
                });
                interaction('deactivate', ({ provider, execute }) => {
                    it('should return the number of records deactivated', async () => {
                        provider.addInteraction({
                            states: [{ description: '' }],
                            uponReceiving: 'a request to deactivate ids [1,2,3,4,5]',
                            withRequest: {
                                method: 'PATCH',
                                path: `${path}/deactivate`,
                                headers: standardJsonHeaders(),
                                body: [1, 2, 3, 4, 5],
                            },
                            willRespondWith: {
                                status: 200,
                                body: integer(),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            await api.deactivate([1, 2, 3, 4, 5]).toPromise();
                        });
                    });
                });

                interaction('search', ({ provider, execute }) => {
                    it('should accept all possible query restrictions', async () => {
                        const queryRestrictions: QueryRestriction[] = [
                            {
                                fieldPath: 'name',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: ['Pact'],
                            },
                            { fieldPath: 'active', dataType: 'boolean', operator: Comparators.true.value, values: [] },
                            {
                                fieldPath: 'serviceCategory',
                                dataType: 'serviceCategory',
                                operator: Comparators.equalTo.value,
                                values: [2],
                            },
                            {
                                fieldPath: 'serviceCategory.code',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: ['OC'],
                            },
                            {
                                fieldPath: 'serviceCategory.description',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: ['Oil Change'],
                            },
                            {
                                fieldPath: 'externalLink',
                                dataType: 'string',
                                operator: Comparators.startsWith.value,
                                values: ['http'],
                            },
                            {
                                fieldPath: 'vehicles.yearStart',
                                dataType: 'integer',
                                operator: Comparators.equalTo.value,
                                values: [2019],
                            },
                            {
                                fieldPath: 'vehicles.yearEnd',
                                dataType: 'integer',
                                operator: Comparators.equalTo.value,
                                values: [2022],
                            },
                            {
                                fieldPath: 'vehicles.makeId',
                                dataType: 'integer',
                                operator: Comparators.equalTo.value,
                                values: [59],
                            },
                            {
                                fieldPath: 'vehicles.modelId',
                                dataType: 'integer',
                                operator: Comparators.equalTo.value,
                                values: [758],
                            },
                            {
                                fieldPath: 'vehicles.engineConfigId',
                                dataType: 'integer',
                                operator: Comparators.equalTo.value,
                                values: [21100],
                            },
                            {
                                fieldPath: 'vehicles.attributes.type',
                                dataType: 'acesAttributeType',
                                operator: Comparators.equalTo.value,
                                values: [21100],
                            },
                            {
                                fieldPath: 'vehicles.attributes.key',
                                dataType: 'integer',
                                operator: Comparators.equalTo.value,
                                values: [3000],
                            },
                        ];

                        provider.addInteraction({
                            states: [{ description: states.TSB_EXISTS_FOR_UPDATE }],
                            uponReceiving: 'a search request with possible query restrictions',
                            withRequest: {
                                method: 'POST',
                                path: `${path}/search`,
                                query: { page: '0', size: '20', sort: 'id,asc' },
                                headers: standardJsonHeaders(),
                                body: queryRestrictions,
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: [],
                                    page: {
                                        size: integer(20),
                                        totalElements: integer(0),
                                        totalPages: integer(0),
                                        number: integer(0),
                                    },
                                },
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            await api
                                .query({
                                    queryRestrictions,
                                    page: new QueryPage(0, 20),
                                    sort: new QuerySort({ apiSortPath: 'id' } as any, 'asc'),
                                } as QuerySearch)
                                .toPromise();
                        });
                    });

                    it('should return results for empty search', async () => {
                        provider.addInteraction({
                            states: [{ description: states.TSB_EXISTS_FOR_UPDATE }],
                            uponReceiving: 'a search request for all records',
                            withRequest: {
                                method: 'POST',
                                path: `${path}/search`,
                                query: { page: '0', size: '20', sort: 'id,asc' },
                                headers: standardJsonHeaders(),
                                body: [],
                            },
                            willRespondWith: {
                                status: 200,
                                body: {
                                    content: eachLike({
                                        id: integer(),
                                        name: string(),
                                        active: boolean(),
                                        serviceCategory: likeDescribed(),
                                        documentFile: like({
                                            fileName: string(),
                                        }),
                                    }),
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
                            api = new TsbApi(`${mockServer.url}`, { http });
                            await api
                                .query({
                                    queryRestrictions: [],
                                    page: new QueryPage(0, 20),
                                    sort: new QuerySort({ apiSortPath: 'id' } as any, 'asc'),
                                } as QuerySearch)
                                .toPromise();
                        });
                    });
                });

                interaction('dataSync', ({ provider, execute }) => {
                    it('should trigger datasync to stores and return the number of records deactivated', async () => {
                        provider.addInteraction({
                            states: [{ description: '' }],
                            uponReceiving: 'a request to datasync ids [1,2,3]',
                            withRequest: {
                                method: 'POST',
                                path: `${path}/datasync`,
                                headers: standardJsonHeaders(),
                                body: [1, 2, 3],
                            },
                            willRespondWith: {
                                status: 200,
                                body: integer(),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new TsbApi(`${mockServer.url}`, { http });
                            await api.dataSync([1, 2, 3]).toPromise();
                        });
                    });
                });
            }
        );
    });
});
