import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { integer } from '@pact-foundation/pact/src/dsl/matchers';
import { standardJsonHeaders } from '@vioc-angular/test/util-test';
import { CommonCodeApi } from './common-code.api';
import { JestDescribePactFnV3, pactWith } from 'jest-pact/dist/v3';

describe('CommonCodeApi', () => {
    describe('contract tests', () => {
        let http: HttpClient;
        let api: CommonCodeApi;
        const path = '/v1/common-codes';

        pactWith(
            {
                consumer: 'central-ui',
                provider: 'config-api',
                cors: true,
            },
            (interaction: JestDescribePactFnV3) => {
                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new CommonCodeApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });
                interaction('datasync', ({ provider, execute }) => {
                    it('should trigger datasync to stores and return the number of records datasynced', async () => {
                        provider.addInteraction({
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
                            api = new CommonCodeApi(`${mockServer.url}`, { http });
                            await api.dataSync([1, 2, 3]).toPromise();
                        });
                    });
                });
            }
        );
    });

    describe('non-contract tests', () => {
        const api = new CommonCodeApi(null, { http: null });

        beforeEach(() => {
            jest.clearAllMocks();
            api.get = jest.fn();
        });

        describe('findByType', () => {
            it('delegate to the get method', () => {
                const type = 'CDTYPE';
                api.findByType(type);
                expect(api.get).toHaveBeenCalledWith([type], undefined);
            });

            it('delegate to the get method', () => {
                const type = 'CDTYPE';
                api.findByType(type, true);
                expect(api.get).toHaveBeenCalledWith([type], { active: 'true', undefined });
            });

            it('delegate to the get method with sort', () => {
                const type = 'CDTYPE';
                api.findByType(type, true, ['code,asc']);
                expect(api.get).toHaveBeenCalledWith([type], { active: 'true', sort: ['code,asc'] });
            });
        });

        describe('findByTypeAndCode', () => {
            it('delegate to the get method', () => {
                const type = 'CDTYPE';
                const code = '111';
                api.findByTypeAndCode(type, code);
                expect(api.get).toHaveBeenCalledWith([type + '/' + code]);
            });
        });
    });
});
