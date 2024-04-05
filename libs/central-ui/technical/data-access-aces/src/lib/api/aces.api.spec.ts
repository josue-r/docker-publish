import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { eachLike, integer, string } from '@pact-foundation/pact/src/dsl/matchers';
import { standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { AcesApi } from './aces.api';

describe('AcesApi', () => {
    let http: HttpClient;
    let api: AcesApi;

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'vehicle-technical-api',
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
                            api = new AcesApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });

                const states = {
                    HONDA_TOYOTA_VEHICLES_EXIST: 'Honda and Toyota vehicles through 2021 exist',
                };

                const acesDataMatcher = { id: integer(), description: string() };

                interaction('findAllMakes', ({ provider, execute }) => {
                    it('should return honda and toyota makes', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'a request for all makes',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: '/v1/makes',
                            },
                            willRespondWith: {
                                status: 200,
                                body: [
                                    { id: integer(59), description: string('Honda') },
                                    { id: integer(76), description: string('Toyota') },
                                ],
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findAllMakes().toPromise();
                        });
                    });
                });

                interaction('findModelsByMakeId', ({ provider, execute }) => {
                    it('should return all models for the specified make when not send years', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'a request for all Honda models',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: '/v1/makes/59/models',
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            const hondaMakeId = 59;
                            await api.findModelsByMakeId(hondaMakeId).toPromise();
                        });
                    });

                    it('should return all models for the specified make and years', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'a request for 2020-2021 Honda models',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: '/v1/makes/59/models',
                                query: { yearStart: '2020', yearEnd: '2021' },
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            const hondaMakeId = 59;
                            await api.findModelsByMakeId(hondaMakeId, { yearStart: 2020, yearEnd: 2021 }).toPromise();
                        });
                    });
                });

                interaction('findSubModelsByMakeIdAndModelId', ({ provider, execute }) => {
                    it('should return all Accord sub-models', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for all Honda Accord SubModels',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: '/v1/makes/59/models/751/sub-models',
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findSubModelsByMakeIdAndModelId(59, 751).toPromise();
                        });
                    });

                    it('should return all 2020-2021 Accord sub-models', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for 2020-2021 Honda Accord SubModels',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: '/v1/makes/59/models/751/sub-models',
                                query: { yearStart: '2020', yearEnd: '2021' },
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api
                                .findSubModelsByMakeIdAndModelId(59, 751, { yearStart: 2020, yearEnd: 2021 })
                                .toPromise();
                        });
                    });
                });

                interaction('findEngineDesignationsByMakeId', ({ provider, execute }) => {
                    it('should return all honda engine designations', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for all honda engine designations',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: `/v1/makes/59/engine-designations`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findEngineDesignationsByMakeId(59).toPromise();
                        });
                    });

                    it('should return 2020-2021 Honda engine designations', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for 2020-2021 honda engine designations',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: `/v1/makes/59/engine-designations`,
                                query: { yearStart: '2020', yearEnd: '2021' },
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api
                                .findEngineDesignationsByMakeId(59, { yearStart: 2020, yearEnd: 2021 })
                                .toPromise();
                        });
                    });
                });

                interaction('findAllFuelTypes', ({ provider, execute }) => {
                    it('should return all fuel types', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for all fuel types',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: `/v1/fuel-types`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findAllFuelTypes().toPromise();
                        });
                    });
                });

                interaction('findAllFuelDeliverySubTypes', ({ provider, execute }) => {
                    it('should return all fuel delivery subtypes', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for all fuel delivery subtypes',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: `/v1/fuel-delivery-sub-types`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findAllFuelDeliverySubTypes().toPromise();
                        });
                    });
                });

                interaction('findAllTransmissionTypes', ({ provider, execute }) => {
                    it('should return all transmission types', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for all transmission types',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: `/v1/transmission-types`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findAllTransmissionTypes().toPromise();
                        });
                    });
                });

                interaction('findAllTransmissionControlTypes', ({ provider, execute }) => {
                    it('should return all transmission control types', async () => {
                        provider.addInteraction({
                            states: [{ description: states.HONDA_TOYOTA_VEHICLES_EXIST }],
                            uponReceiving: 'A request for all transmission control types',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: `/v1/transmission-control-types`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findAllTransmissionControlTypes().toPromise();
                        });
                    });
                });

                interaction('findAllVehicleClasses', ({ provider, execute }) => {
                    it('should return all vehicle classes', async () => {
                        provider.addInteraction({
                            states: [{ description: '' }],
                            uponReceiving: 'A request for all vehicle classes',
                            withRequest: {
                                method: 'GET',
                                headers: standardJsonHeaders(),
                                path: `/v1/vehicle-classes`,
                            },
                            willRespondWith: {
                                status: 200,
                                body: eachLike(acesDataMatcher),
                            },
                        });

                        await provider.executeTest(async (mockServer) => {
                            api = new AcesApi(`${mockServer.url}`, { http });
                            await api.findAllVehicleClasses().toPromise();
                        });
                    });
                });
            }
        );
    });
});
