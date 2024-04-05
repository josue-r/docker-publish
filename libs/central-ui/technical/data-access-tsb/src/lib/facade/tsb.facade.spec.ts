import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { TsbApi } from '../api/tsb.api';
import { Tsb } from '../model/tsb.model';
import { TsbFacade } from './tsb.facade';

describe('TsbFacade', () => {
    let api: TsbApi;
    let facade: TsbFacade;

    beforeEach(() => {
        facade = new TsbFacade('//gateway', null);
        api = facade['api'];
    });

    describe('findById', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findById').mockImplementation();

            facade.findById(1);

            expect(api.findById).toBeCalledWith(1);
        });
    });

    describe('update', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const tsb: Tsb = {
                id: 1,
                active: true,
                documentFile: { id: 2 },
                externalLink: 'link',
                name: 'tsb',
                serviceCategory: { id: 1 },
                version: 0,
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

            facade.save(tsb);

            expect(api.save).toBeCalledWith(tsb);
        });
    });

    describe('add', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const tsb: Tsb = {
                id: null,
                active: true,
                documentFile: {
                    id: null,
                    fileName: 'New File.pdf',
                    document: 'encoded-document',
                    mimeType: 'application/pdf',
                },
                externalLink: 'link',
                name: 'tsb',
                serviceCategory: { id: 1 },
                vehicles: [
                    {
                        id: null,
                        yearStart: 2000,
                        yearEnd: 2005,
                        makeId: 1,
                        modelId: 2,
                        engineConfigId: 3,
                        attributes: [{ type: { id: 1 }, key: 2 }],
                    },
                ],
            };

            facade.save(tsb);

            expect(api.save).toBeCalledWith(tsb);
        });
    });

    describe('search', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'query').mockImplementation();

            const column = Column.of({
                name: 'Test',
                type: 'string',
                apiFieldPath: 'test',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.notBlank).toQueryRestriction()],
                sort: new QuerySort(column),
                page: new QueryPage(0, 20),
            };

            facade.search(querySearch);

            // verify that it delegated to api;
            expect(api.query).toBeCalledWith(querySearch);
        });
    });

    describe('dataSync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            facade.activate([1, 2]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([1, 2]);
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            facade.activate([1, 2]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([1, 2]);
        });
    });

    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            facade.deactivate([1, 2]);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith([1, 2]);
        });
    });
});
