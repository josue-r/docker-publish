import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Column } from '@vioc-angular/shared/util-column';
import { EMPTY, of } from 'rxjs';
import { Api } from './api';
import { ApiConfig } from './models/api-config';

class TestAPI extends Api<{ id: number }, number> {
    public addSingle = super.addSingle;
    public update = super.update;
    constructor(config: ApiConfig) {
        super('http://localhost', config);
    }
}

describe('Api', () => {
    let api: TestAPI;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });

        api = new TestAPI({ http: {} as HttpClient });
    });

    describe('query', () => {
        const buildSort = (apiFieldPath: string, direction: 'asc' | 'desc') =>
            new QuerySort(Column.of({ apiFieldPath, name: 'test', type: 'string' }), direction);
        const qr = { fieldPath: 'foo', dataType: 'type', operator: '<', values: [5] } as QueryRestriction;
        const querySearch: QuerySearch = {
            additionalParams: { foo: 'bar' },
            page: new QueryPage(3, 10),
            queryRestrictions: [qr],
            sort: buildSort('id', 'asc'),
        };
        const content = [{ id: 1 }, { id: 2 }];
        const page = { totalElements: 175 };
        const verifyQuery = (response, expectedPath, expectedSort = ['id,asc']) => {
            expect(api.post) //
                .toHaveBeenCalledWith(
                    [expectedPath], // url
                    [qr], // queryRestrictions
                    { foo: 'bar', page: '3', size: '10', sort: expectedSort }, // params
                    { 'Content-Type': 'application/json' } // headers
                );
            expect(response.content).toEqual(content);
            expect(response.totalElements).toEqual(175);
        };

        beforeEach(() => jest.spyOn(api, 'post').mockReturnValue(of({ content, page })));

        it('should send a POST to the /search endpoint ', async () => {
            const response = await api.query(querySearch).toPromise();
            verifyQuery(response, 'search');
        });

        it('should send a POST to a specified endpoint', async () => {
            const specificQueryPath = 'secondary-search';
            const response = await api.query(querySearch, [specificQueryPath]).toPromise();
            verifyQuery(response, specificQueryPath);
        });

        describe.each`
            expectedSortParam                        | initialSort                 | defaultSorts
            ${['id,asc']}                            | ${buildSort('id', 'asc')}   | ${null}
            ${['id,asc']}                            | ${buildSort('id', 'asc')}   | ${undefined}
            ${['id,asc']}                            | ${buildSort('id', 'asc')}   | ${[]}
            ${['id,asc']}                            | ${buildSort('id', 'asc')}   | ${[buildSort('id', 'asc')]}
            ${['id,asc', 'code,desc']}               | ${buildSort('id', 'asc')}   | ${[buildSort('id', 'asc'), buildSort('code', 'desc')]}
            ${['id,asc', 'code,desc']}               | ${buildSort('id', 'asc')}   | ${[buildSort('id', 'asc'), buildSort('code', 'desc')]}
            ${['id,asc', 'active,asc', 'code,desc']} | ${buildSort('id', 'asc')}   | ${[buildSort('active', 'asc'), buildSort('code', 'desc')]}
            ${['code,asc', 'id,asc']}                | ${buildSort('code', 'asc')} | ${[buildSort('id', 'asc'), buildSort('code', 'desc')]}
        `('defaultSorts', ({ expectedSortParam, initialSort, defaultSorts }) => {
            it(`should sort by ${expectedSortParam} with initialSort=${initialSort} and defaultSorts=${defaultSorts}`, async () => {
                querySearch.sort = initialSort;
                querySearch.defaultSorts = defaultSorts;
                const response = await api.query(querySearch).toPromise();
                verifyQuery(response, 'search', expectedSortParam);
            });
        });
    });

    describe('save', () => {
        it('should call post if id is undefined', () => {
            jest.spyOn(api, 'post').mockReturnValueOnce(EMPTY);
            const entity = { id: undefined };

            api.save(entity);

            expect(api.post).toHaveBeenCalledWith([], entity);
        });
        it('should call post id is null', () => {
            jest.spyOn(api, 'post').mockReturnValueOnce(EMPTY);
            const entity = { id: null };

            api.save(entity);

            expect(api.post).toHaveBeenCalledWith([], entity);
        });
        it('should call put if id has a value', () => {
            jest.spyOn(api, 'put').mockReturnValueOnce(EMPTY);
            const entity = { id: 1 };

            api.save(entity);

            expect(api.put).toHaveBeenCalledWith([], entity, { 'Content-Type': 'application/json' });
        });
        it('should throw an error if no "id" property', () => {
            expect(() => api.save({} as any)).toThrowError();
        });
    });

    describe('addSingle', () => {
        it('should call post ', () => {
            jest.spyOn(api, 'post').mockReturnValueOnce(EMPTY);
            const entity = { id: 1 };

            api.addSingle(entity);

            expect(api.post).toHaveBeenCalledWith([], entity);
        });
    });

    describe('update', () => {
        it('should call put ', () => {
            jest.spyOn(api, 'put').mockReturnValueOnce(EMPTY);
            const entity = { id: 1 };

            api.update(entity);

            expect(api.put).toHaveBeenCalledWith([], entity, { 'Content-Type': 'application/json' });
        });
    });

    describe('entityPatch', () => {
        const patch = { id: 1, updateValues: { id: 1, field: 2 }, fields: ['field'] };
        it('should send a patch request for array', () => {
            const patch2 = { id: 2, updateValues: { id: 2, field: 3 }, fields: ['field'] };
            jest.spyOn(api, 'patch').mockReturnValueOnce(EMPTY);

            api.entityPatch(['patch'], patch, patch2);

            expect(api.patch).toHaveBeenCalledWith(['patch'], [patch, patch2]);
        });
        it('should send a patch request for single', () => {
            jest.spyOn(api, 'patch').mockReturnValueOnce(EMPTY);

            api.entityPatch(['patch'], patch);

            expect(api.patch).toHaveBeenCalledWith(['patch'], [patch]);
        });

        it("should error if an id isn't specified", () => {
            api.entityPatch(['patch'], { ...patch, id: undefined }).subscribe(
                () => fail('Should have throw error'),
                (e: Error) => expect(e.message).toContain(`EntityPatch.id must be set`)
            );
        });

        it('should send a patch request for specified path', () => {
            jest.spyOn(api, 'patch').mockReturnValueOnce(EMPTY);

            api.entityPatch(['test/patch'], patch);

            expect(api.patch).toHaveBeenCalledWith(['test/patch'], [patch]);
        });
    });

    describe('activate', () => {
        const ids = [1, 2];
        it('should send a patch request', () => {
            jest.spyOn(api, 'patch').mockReturnValueOnce(EMPTY);

            api.activate(ids);

            expect(api.patch).toHaveBeenCalledWith(['activate'], ids);
        });
    });

    describe('deactivate', () => {
        const ids = [1, 2];
        it('should send a patch request', () => {
            jest.spyOn(api, 'patch').mockReturnValueOnce(EMPTY);

            api.deactivate(ids);

            expect(api.patch).toHaveBeenCalledWith(['deactivate'], ids);
        });
    });

    describe('dataSync', () => {
        const ids = [1, 2];
        it('should send a post request', () => {
            jest.spyOn(api, 'post').mockReturnValueOnce(EMPTY);

            api.dataSync(ids);

            expect(api.post).toHaveBeenCalledWith(['datasync'], ids);
        });
    });

    describe('add', () => {
        it('should delegate to the post method', async () => {
            jest.spyOn(api, 'post').mockReturnValueOnce(EMPTY);
            const test: Described = { id: 1, code: 'S1', description: 'Store 1' };
            const contentType = { 'Content-Type': 'application/json' };
            api.add(test, []);
            expect(api.post).toHaveBeenCalledWith([], test, contentType);
        });
    });

    describe('convertPagedResourceToResponseEntity', () => {
        it('should return the response in the desired structure', async () => {
            const content = [{ code: 1 }, { code: 2 }];
            const pagedResource = of({
                content: content,
                page: {
                    size: 10,
                    totalElements: 2,
                    totalPages: 1,
                    number: 0,
                },
            });

            api.convertPagedResourceToResponseEntity(pagedResource)
                .toPromise()
                .then((response) => {
                    expect(response.content).toEqual(content);
                    expect(response.totalElements).toEqual(2);
                });
        });
    });

    describe('buildHttpParams', () => {
        it('should return an object in the desired structure', async () => {
            const sort = new QuerySort(Column.of({ apiFieldPath: 'code', name: 'test', type: 'string' }), 'asc');
            const qr = { fieldPath: 'foo', dataType: 'type', operator: '<', values: [5] } as QueryRestriction;
            const querySearch: QuerySearch = {
                additionalParams: { foo: 'bar' },
                page: new QueryPage(3, 10),
                queryRestrictions: [qr],
                sort: sort,
            };

            const response = api.buildHttpParams(querySearch);
            expect(response).toEqual({ foo: 'bar', page: '3', size: '10', sort: ['code,asc'] });
        });
    });
});
