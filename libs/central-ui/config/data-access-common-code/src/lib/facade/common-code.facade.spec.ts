import { fakeAsync, flush } from '@angular/core/testing';
import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch } from '@vioc-angular/shared/util-api';
import { Column, Comparators, DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { of } from 'rxjs';
import { CommonCodeApi } from '../api/common-code.api';
import { CommonCodeFacade, CommonCodeSearchConfig } from '../facade/common-code.facade';
import { CommonCode, CommonCodeId } from '../model/common-code.model';
import { CommonCodeState } from '../state/common-code.state';

describe('CommonCodeFacade', () => {
    let api: CommonCodeApi;
    let facade: CommonCodeFacade;
    let state: CommonCodeState;

    beforeEach(() => {
        state = new CommonCodeState();
        facade = new CommonCodeFacade('//gateway', null, state);
        api = facade['api'];
    });

    describe('search', () => {
        it('should just delegate to API', () => {
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

    describe('entityPatch', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();

            const patch: EntityPatch<CommonCodeId> = { id: null, fields: ['foo'], updateValues: ['bar'] };

            facade.entityPatch([patch]);

            // verify that it delegated to api;
            expect(api.entityPatch).toBeCalledWith(['patch'], patch);
        });
    });

    describe('dataSync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();

            const ids: CommonCodeId[] = [1, 2];

            facade.dataSync(ids);

            // verify that it delegated to api;
            expect(api.dataSync).toBeCalledWith(ids);
        });
    });

    describe('save', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const toSave: CommonCode = { ...new CommonCode(), id: 1 };

            facade.save(toSave);

            // verify that it delegated to api;
            expect(api.save).toBeCalledWith(toSave);
        });

        it('should verify CommonCode.id is initialized', () => {
            const toSave: CommonCode = { ...new CommonCode() };

            expect(() => facade.save(toSave)).not.toThrowError(`Could not find field named 'id' in ${toSave}`);
        });
    });

    describe('findByTypeAndCode', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByTypeAndCode').mockImplementation();

            facade.findByTypeAndCode('TESTTYPE', 'CODE');

            // verify that it delegated to api;
            expect(api.findByTypeAndCode).toBeCalledWith('TESTTYPE', 'CODE');
        });
    });

    describe('findByType', () => {
        const testCommonCodes = [{ id: 1, code: 'Test' }];
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByType').mockReturnValueOnce(of(testCommonCodes));

            facade.findByType('TESTTYPE', true, { field: 'code', direction: 'asc' });

            // verify that it delegated to api;
            expect(api.findByType).toBeCalledWith('TESTTYPE', true, ['code,asc']);
        });

        it('should use what is in the state if cached', async () => {
            jest.spyOn(api, 'findByType').mockImplementation();

            state.cacheByType('TESTTYPE', of(testCommonCodes), true);

            const result = await facade.findByType('TESTTYPE', true, { field: 'code', direction: 'asc' }).toPromise();

            expect(result).toEqual(testCommonCodes);
            // verify that it does not delegated to api;
            expect(api.findByType).not.toHaveBeenCalled();
        });
    });

    describe('dropdowns', () => {
        const config: CommonCodeSearchConfig = {
            type: 'TEST',
            name: 'Test Code',
            apiFieldPath: 'testCodePath',
            entityType: 'entityType',
        };
        const describedFooBar: Described = { code: 'foo', description: 'bar' };
        const commonCodeA = { code: 'Test', description: 'Test Code B' };
        const commonCodeB = { code: 'Test1', description: 'Test Code A' };
        const commonCodeC = { code: 'Test2', description: 'Test Code C' };
        const commonCodes: Described[] = [commonCodeB, commonCodeC, commonCodeA];
        beforeEach(() => {
            jest.spyOn(facade, 'findByType').mockReturnValue(of(commonCodes));
        });

        describe('codeDropdown', () => {
            it('should create', async () => {
                const dropdown = facade.searchColumns.codeDropdown(config);
                expect(dropdown.name).toEqual(config.name);
                expect(dropdown.apiFieldPath).toEqual(config.apiFieldPath);
                expect(dropdown.type).toEqual({ entityType: config.entityType });
                expect(await dropdown.fetchData('test').toPromise()).toEqual([commonCodeB, commonCodeC, commonCodeA]);
                expect(facade.findByType).toHaveBeenCalledWith(config.type, true, { field: 'code', direction: 'asc' });
            });

            it('should set defaults', () => {
                const dropdown = facade.searchColumns.codeDropdown(config);
                expect(dropdown.mapToTableDisplay(describedFooBar)).toEqual('foo');
            });
        });

        describe('codeAndDescriptionDropdown', () => {
            it('should create', async () => {
                const dropdown = facade.searchColumns.codeAndDescriptionDropdown(config);
                expect(dropdown.name).toEqual(config.name);
                expect(dropdown.apiFieldPath).toEqual(config.apiFieldPath);
                expect(dropdown.type).toEqual({ entityType: config.entityType });
                expect(await dropdown.fetchData('test').toPromise()).toEqual([commonCodeB, commonCodeC, commonCodeA]);
                expect(facade.findByType).toHaveBeenCalledWith(config.type, true, { field: 'code', direction: 'asc' });
            });

            it('should set defaults', () => {
                const dropdown = facade.searchColumns.codeAndDescriptionDropdown(config);
                expect(dropdown.mapToTableDisplay(describedFooBar)).toEqual('foo - bar');
            });
        });

        describe('descriptionDropdown', () => {
            it('should create', async () => {
                const dropdown = facade.searchColumns.descriptionDropdown(config);
                expect(dropdown.name).toEqual(config.name);
                expect(dropdown.apiFieldPath).toEqual(config.apiFieldPath);
                expect(dropdown.type).toEqual({ entityType: config.entityType });
                expect(await dropdown.fetchData('test').toPromise()).toEqual([commonCodeB, commonCodeC, commonCodeA]);
                expect(facade.findByType).toHaveBeenCalledWith(config.type, true, {
                    field: 'description',
                    direction: 'asc',
                });
            });

            it('should set defaults', () => {
                const dropdown = facade.searchColumns.descriptionDropdown(config);
                expect(dropdown.mapToTableDisplay(describedFooBar)).toEqual('bar');
            });
        });
        it.each`
            statusDescValue | entityType                   | expectedResults                                                                                                                                                                                                                                                                         | filter
            ${'INVSTATUS'}  | ${'inventoryStatus'}         | ${[{ description: 'Finalized', code: 'FINALIZED', active: true, id: 2488 }, { description: 'Open', code: 'OPEN', active: true, id: 2486 }]}                                                                                                                                             | ${(v) => v.code !== 'CANCELLED' && v.code !== 'CLOSED'}
            ${'TRNSSTATUS'} | ${'inventoryTransferStatus'} | ${[{ description: 'Cancelled', code: 'CANCELLED', active: true, id: 2532 }, { description: 'Closed', code: 'CLOSED', active: true, id: 2487 }, { description: 'Finalized', code: 'FINALIZED', active: true, id: 2488 }, { description: 'Open', code: 'OPEN', active: true, id: 2486 }]} | ${undefined}
        `(
            'should not contain cancelled & closed statuses in dropdown $statusDescValue statusDescValue',
            fakeAsync(({ statusDescValue, entityType, expectedResults, filter }) => {
                let statusDropdown;
                if (filter) {
                    statusDropdown = facade.searchColumns.codeDropdown(
                        {
                            type: statusDescValue,
                            name: 'Status',
                            apiFieldPath: 'status',
                            entityType: entityType,
                        },
                        { searchable: { defaultSearch: true } },
                        filter
                    );
                } else {
                    statusDropdown = facade.searchColumns.codeDropdown(
                        {
                            type: statusDescValue,
                            name: 'Status',
                            apiFieldPath: 'status',
                            entityType: entityType,
                        },
                        { searchable: { defaultSearch: true } }
                    );
                }
                const mockedStatuses = [
                    { description: 'Cancelled', code: 'CANCELLED', active: true, id: 2532 },
                    { description: 'Closed', code: 'CLOSED', active: true, id: 2487 },
                    { description: 'Finalized', code: 'FINALIZED', active: true, id: 2488 },
                    { description: 'Open', code: 'OPEN', active: true, id: 2486 },
                ];
                expect(statusDropdown.type.entityType).toEqual(entityType);
                jest.spyOn(facade, 'findByType').mockReturnValueOnce(of(mockedStatuses));
                (statusDropdown as DynamicDropdownColumn<Described>).fetchData('').subscribe((data: []) => {
                    expect(data).toEqual(expectedResults);
                });
                flush();
                expect.assertions(2);
            })
        );
    });
});
