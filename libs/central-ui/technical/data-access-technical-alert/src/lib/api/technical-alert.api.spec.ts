import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Pact } from '@pact-foundation/pact';
import { boolean, eachLike, integer, like, somethingLike, string } from '@pact-foundation/pact/src/dsl/matchers';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Comparators } from '@vioc-angular/shared/util-column';
import {
    acceptJsonHeader,
    likeDateTimeWithMillis,
    likeDescribed,
    standardJsonHeaders,
} from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { TechnicalAlert } from '../model/technical-alert.model';
import { TechnicalAlertApi } from './technical-alert.api';

describe('TechnicalAlertApi', () => {
    let http: HttpClient;
    let api: TechnicalAlertApi;
    const path = '/v1/alerts';

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
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });
                const states = {
                    TECHNICAL_ALERT_EXISTS_ID_1:
                        'a TechnicalAlert[id=-1] with all non-null values, a Product[id=-1], a related DocumentFile[id=-2], a TechnicalAlertActiveScreen with an AlertActiveScreen[id=-3], ' +
                        'a TechnicalAlertPassiveScreen with an AlertPassiveScreen[id=-4], and a TechnicalAlertVehicle[id=-1] with all non null values with a TechnicalAlertVehicleAttribute with an ' +
                        'AcesAttributeType[id=-7] exist',
                    ADDING_A_TECHNICAL_ALERT:
                        'a Product[id=-1], a TechnicalAlertActiveScreen with an AlertActiveScreen[id=-3], a TechnicalAlertPassiveScreen with an AlertPassiveScreen[id=-4], and a TechnicalAlertVehicleAttribute ' +
                        'with an AcesAttributeType[id=-7] exist and technical vehicle data is available for Make[id=-76], Model[id=-1032]',
                    ACTIVATE_DEACTIVATE_DATASYNC:
                        'TECHNICAL-ALERTs with ids [1,2,3] exist and are active. TECHNICAL-ALERTs with ids [4,5] exist and are inactive',
                };

                const technicalAlertBodyMatcher = {
                    id: integer(),
                    name: string(),
                    active: boolean(),
                    comments: string(),
                    product: likeDescribed(),
                    documentFile: like({
                        id: integer(),
                        fileName: string(),
                        document: string(),
                        mimeType: string(),
                    }),
                    updatedBy: string(),
                    updatedOn: likeDateTimeWithMillis(),
                    version: integer(),
                    activeScreens: eachLike({
                        screen: likeDescribed(),
                    }),
                    passiveScreens: eachLike({
                        screen: likeDescribed(),
                    }),
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
                    it('should return a technical-alert', async () => {
                        provider.addInteraction({
                            states: [{ description: states.TECHNICAL_ALERT_EXISTS_ID_1 }],
                            uponReceiving: 'a request for a technical-alert with and id of -1',
                            withRequest: {
                                method: 'GET',
                                headers: acceptJsonHeader(),
                                path: `${path}/-1`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: technicalAlertBodyMatcher,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.findById(-1).toPromise();
                        });
                    });
                });

                interaction('updateTechnicalAlert', ({ provider, execute }) => {
                    const requestBody: TechnicalAlert = {
                        id: -1,
                        name: 'Test technical-alert update',
                        active: true,
                        comments: 'Update test comments',
                        documentFile: { id: -2 }, // indicates no changes to an existing document
                        version: 0,
                        product: { id: -1 },
                        activeScreens: [
                            {
                                screen: {
                                    id: -3,
                                    code: 'Active screen',
                                    description: 'Technical alert active screen',
                                    version: 0,
                                },
                            },
                        ],
                        passiveScreens: [
                            {
                                screen: {
                                    id: -4,
                                    code: 'Passive screen',
                                    description: 'Technical alert passive screen',
                                    version: 0,
                                },
                            },
                        ],
                        vehicles: [
                            {
                                id: -1, // indicates an update
                                yearStart: 2019,
                                yearEnd: 2022,
                                makeId: -76,
                                modelId: -1032,
                                engineConfigId: null,
                                attributes: [{ type: { id: -7 }, key: 5 }],
                                version: 0,
                            },
                            {
                                id: null, // indicates an add
                                yearStart: 2019,
                                yearEnd: 2022,
                                makeId: -76,
                                modelId: -1032,
                                engineConfigId: null,
                                attributes: [{ type: { id: -7 }, key: 6 }],
                            },
                        ],
                    };
                    it('should update the technical-alert without updating the document if only the document id is provided', async () => {
                        provider.addInteraction({
                            states: [{ description: states.TECHNICAL_ALERT_EXISTS_ID_1 }],
                            uponReceiving:
                                'a request to update a technical-alert with an id of -1 without updating the document',
                            withRequest: {
                                method: 'PUT',
                                path,
                                headers: standardJsonHeaders(),
                                body: requestBody,
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.updateTechnicalAlert(requestBody).toPromise();
                        });
                    });
                    it('should update the technical-alert and update the document if there is new document data provided', async () => {
                        const requestBodyWithDocumentChanges = {
                            ...requestBody,
                            documentFile: {
                                id: -2,
                                fileName: 'Updated File.pdf',
                                document: btoa('some-encoded-bytes'),
                                mimeType: 'application/pdf',
                                version: 0,
                            },
                        };
                        provider.addInteraction({
                            states: [{ description: states.TECHNICAL_ALERT_EXISTS_ID_1 }],
                            uponReceiving:
                                'a request to update a technical-alert with an id of -1 including document changes',
                            withRequest: {
                                method: 'PUT',
                                path,
                                headers: standardJsonHeaders(),
                                body: requestBodyWithDocumentChanges,
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.updateTechnicalAlert(requestBodyWithDocumentChanges).toPromise();
                        });
                    });
                });

                interaction('addTechnicalAlert', ({ provider, execute }) => {
                    const requestBody: TechnicalAlert = {
                        id: null,
                        name: 'Test technical-alert add',
                        active: true,
                        comments: 'Add test comments',
                        documentFile: null,
                        product: { id: -1 },
                        version: undefined,
                        activeScreens: [
                            {
                                screen: {
                                    id: -3,
                                    code: 'Active screen',
                                    description: 'Technical alert active screen',
                                    version: 0,
                                },
                            },
                        ],
                        passiveScreens: [
                            {
                                screen: {
                                    id: -4,
                                    code: 'Passive screen',
                                    description: 'Technical alert passive screen',
                                    version: 0,
                                },
                            },
                        ],
                        vehicles: [
                            {
                                id: null,
                                yearStart: 2019,
                                yearEnd: 2022,
                                makeId: -76,
                                modelId: -1032,
                                engineConfigId: null,
                                attributes: [{ type: { id: -7 }, key: 5 }],
                            },
                            {
                                id: null,
                                yearStart: 2019,
                                yearEnd: 2022,
                                makeId: -76,
                                modelId: -1032,
                                engineConfigId: null,
                                attributes: [{ type: { id: -7 }, key: 6 }],
                            },
                        ],
                    };
                    it('should add a new technical-alert without a document', async () => {
                        provider.addInteraction({
                            states: [{ description: states.ADDING_A_TECHNICAL_ALERT }],
                            uponReceiving: 'a request to add a technical-alert without a document',
                            withRequest: {
                                method: 'POST',
                                path,
                                headers: standardJsonHeaders(),
                                body: requestBody,
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.addTechnicalAlert(requestBody).toPromise();
                        });
                    });
                    it('should add a new technical-alert with a new document', async () => {
                        const requestBodyWithNewDocument = {
                            ...requestBody,
                            documentFile: {
                                id: null,
                                fileName: 'Added File.pdf',
                                document: btoa('some-encoded-bytes'),
                                mimeType: 'application/pdf',
                            },
                        };
                        provider.addInteraction({
                            states: [{ description: states.ADDING_A_TECHNICAL_ALERT }],
                            uponReceiving: 'a request to add a technical-alert with a document',
                            withRequest: {
                                method: 'POST',
                                path,
                                headers: standardJsonHeaders(),
                                body: requestBodyWithNewDocument,
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.addTechnicalAlert(requestBodyWithNewDocument).toPromise();
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
                            {
                                fieldPath: 'active',
                                dataType: 'boolean',
                                operator: Comparators.true.value,
                                values: [],
                            },
                            {
                                fieldPath: 'comments',
                                dataType: 'string',
                                operator: Comparators.equalTo.value,
                                values: ['Pact Test Comments'],
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
                            {
                                fieldPath: 'activeScreens.screen',
                                dataType: 'alertActiveScreen',
                                operator: Comparators.equalTo.value,
                                values: [1000],
                            },
                            {
                                fieldPath: 'passiveScreens.screen',
                                dataType: 'alertPassiveScreen',
                                operator: Comparators.equalTo.value,
                                values: [2000],
                            },
                            {
                                fieldPath: 'product.id',
                                dataType: 'integer',
                                operator: Comparators.equalTo.value,
                                values: [-1],
                            },
                        ];
                        provider.addInteraction({
                            states: [{ description: states.TECHNICAL_ALERT_EXISTS_ID_1 }],
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
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
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
                            states: [{ description: states.TECHNICAL_ALERT_EXISTS_ID_1 }],
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
                                        comments: string(),
                                        product: likeDescribed(),
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
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
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

                interaction('activate', ({ provider, execute }) => {
                    it('should return the number of records activated', async () => {
                        provider.addInteraction({
                            states: [{ description: '' }],
                            uponReceiving:
                                'a request to activate ids [1,2,3,4,5], where ids [1,2,3] are already active',
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
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.activate([1, 2, 3, 4, 5]).toPromise();
                        });
                    });
                });

                interaction('deactivate', ({ provider, execute }) => {
                    it('should return the number of records deactivated', async () => {
                        provider.addInteraction({
                            states: [{ description: '' }],
                            uponReceiving:
                                'a request to deactivate ids [1,2,3,4,5], where ids [4,5] are already inactive',
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
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.deactivate([1, 2, 3, 4, 5]).toPromise();
                        });
                    });
                });

                interaction('dataSync', ({ provider, execute }) => {
                    it('should return the number of records dataSynced', async () => {
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
                            api = new TechnicalAlertApi(`${mockServer.url}`, { http });
                            await api.dataSync([1, 2, 3]).toPromise();
                        });
                    });
                });
            }
        );
    });
});
