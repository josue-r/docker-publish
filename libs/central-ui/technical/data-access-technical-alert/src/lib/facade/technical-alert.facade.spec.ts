import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { TechnicalAlertApi } from '../api/technical-alert.api';
import { TechnicalAlert } from '../model/technical-alert.model';
import { TechnicalAlertFacade } from './technical-alert.facade';

describe('TechnicalAlertFacade', () => {
    let api: TechnicalAlertApi;
    let facade: TechnicalAlertFacade;

    beforeEach(() => {
        facade = new TechnicalAlertFacade('//gateway', null);
        api = facade['api'];
    });

    describe('findById', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findById').mockImplementation();

            facade.findById(1);

            expect(api.findById).toBeCalledWith(1);
        });
    });

    describe('save', () => {
        it('should delegate to the API', () => {
            const technicalAlert: TechnicalAlert = {
                name: 'TEST Alert',
                activeScreens: [{ id: null, screen: { id: 1 } }],
                passiveScreens: [],
                vehicles: [],
            };
            jest.spyOn(api, 'save').mockImplementation();

            facade.save(technicalAlert);

            expect(api.save).toBeCalledWith(technicalAlert);
        });
    });

    describe('update', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'updateTechnicalAlert').mockImplementation();
            const technicalAlert: TechnicalAlert = {
                id: 1,
                name: 'technical-alert',
                active: true,
                comments: 'test technical alert',
                documentFile: { id: 2 },
                version: 0,
                activeScreens: [
                    {
                        id: 1,
                        screen: {
                            id: 1,
                            code: 'Active screen',
                            description: 'Technical alert active screen',
                        },
                    },
                ],
                passiveScreens: [
                    {
                        id: 2,
                        screen: {
                            id: 2,
                            code: 'Passive screen',
                            description: 'Technical alert passive screen',
                        },
                    },
                ],
                vehicles: [
                    {
                        id: 1,
                        yearStart: 2000,
                        yearEnd: 2005,
                        makeId: 1,
                        modelId: 2,
                        engineConfigId: 3,
                        attributes: [{ type: { id: 1 }, key: 2 }],
                    },
                ],
            };
            facade.update(technicalAlert);
            expect(api.updateTechnicalAlert).toBeCalledWith(technicalAlert);
        });
    });

    describe('add', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'addTechnicalAlert').mockImplementation();
            const technicalAlert: TechnicalAlert = {
                id: 1,
                name: 'technical-alert',
                active: true,
                comments: 'test technical alert',
                documentFile: { id: 2 },
                version: 0,
                activeScreens: [
                    {
                        id: 1,
                        screen: {
                            id: 1,
                            code: 'Active screen',
                            description: 'Technical alert active screen',
                        },
                    },
                ],
                passiveScreens: [
                    {
                        id: 2,
                        screen: {
                            id: 2,
                            code: 'Passive screen',
                            description: 'Technical alert passive screen',
                        },
                    },
                ],
                vehicles: [
                    {
                        id: 1,
                        yearStart: 2000,
                        yearEnd: 2005,
                        makeId: 1,
                        modelId: 2,
                        engineConfigId: 3,
                        attributes: [{ type: { id: 1 }, key: 2 }],
                    },
                ],
            };
            facade.add(technicalAlert);
            expect(api.addTechnicalAlert).toBeCalledWith(technicalAlert);
        });
    });

    describe('search', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'query').mockImplementation();
            const column = Column.of({
                name: 'Test Column',
                type: 'string',
                apiFieldPath: 'test',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.notBlank).toQueryRestriction()],
                sort: new QuerySort(column),
                page: new QueryPage(0, 20),
            };
            facade.search(querySearch);
            expect(api.query).toBeCalledWith(querySearch);
        });
    });

    describe('dataSync', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'activate').mockImplementation();
            const ids = [1, 2];
            facade.activate(ids);
            expect(api.activate).toBeCalledWith(ids);
        });
    });

    describe('activate', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'activate').mockImplementation();
            const ids = [1, 2];
            facade.activate(ids);
            expect(api.activate).toBeCalledWith(ids);
        });
    });

    describe('deactivate', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();
            const ids = [1, 2];
            facade.deactivate(ids);
            expect(api.deactivate).toBeCalledWith(ids);
        });
    });
});
