import { ResourceApi } from './resource-api';

describe('ResourceApi', () => {
    const api = new ResourceApi(null, { http: undefined });

    const verifyGetCall = (resource: string, httpParams?: { [param: string]: string }) => {
        expect(api.get).toHaveBeenLastCalledWith([resource], httpParams, { 'Content-Type': 'application/json' });
    };

    beforeEach(() => (api.get = jest.fn()));

    it('should create an instance', () => {
        expect(api).toBeTruthy();
    });

    describe('findResourcesByRoles', () => {
        const testRoles = ['TEST_ROLE1', 'TEST_ROLE2'];
        const storeCriteria = { criteria: 'VAL' };
        const storeCriteria2 = { criteria: 'AAX' };

        describe.each`
            fnName                    | roles            | filter        | resource     | loadParents | resourceFilterCriteria             | httpParams
            ${'findCompaniesByRoles'} | ${testRoles}     | ${'ACTIVE'}   | ${'company'} | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'false', resourceFilterCriteria: [], sort: 'code,asc' }}
            ${'findCompaniesByRoles'} | ${testRoles}     | ${'INACTIVE'} | ${'company'} | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'INACTIVE', loadParents: 'false', resourceFilterCriteria: [], sort: 'code,asc' }}
            ${'findCompaniesByRoles'} | ${testRoles}     | ${'ALL'}      | ${'company'} | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ALL', loadParents: 'false', resourceFilterCriteria: [], sort: 'code,asc' }}
            ${'findCompaniesByRoles'} | ${['TEST_ROLE']} | ${'ALL'}      | ${'company'} | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE', activeFilter: 'ALL', loadParents: 'false', resourceFilterCriteria: [], sort: 'code,asc' }}
            ${'findRegionsByRoles'}   | ${testRoles}     | ${'ACTIVE'}   | ${'region'}  | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'false', resourceFilterCriteria: [], sort: 'description,id,asc' }}
            ${'findMarketsByRoles'}   | ${testRoles}     | ${'ACTIVE'}   | ${'market'}  | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'false', resourceFilterCriteria: [], sort: 'description,id,asc' }}
            ${'findAreasByRoles'}     | ${testRoles}     | ${'ACTIVE'}   | ${'area'}    | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'false', resourceFilterCriteria: [], sort: 'description,id,asc' }}
            ${'findStoresByRoles'}    | ${testRoles}     | ${'ACTIVE'}   | ${'store'}   | ${false}    | ${[]}                              | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'false', resourceFilterCriteria: '', sort: 'code,asc' }}
            ${'findStoresByRoles'}    | ${testRoles}     | ${'ACTIVE'}   | ${'store'}   | ${false}    | ${[storeCriteria]}                 | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'false', resourceFilterCriteria: 'VAL', sort: 'code,asc' }}
            ${'findStoresByRoles'}    | ${testRoles}     | ${'ACTIVE'}   | ${'store'}   | ${true}     | ${[storeCriteria]}                 | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'true', resourceFilterCriteria: 'VAL', sort: 'code,asc' }}
            ${'findStoresByRoles'}    | ${testRoles}     | ${'ACTIVE'}   | ${'store'}   | ${true}     | ${[storeCriteria, storeCriteria2]} | ${{ roles: 'TEST_ROLE1,TEST_ROLE2', activeFilter: 'ACTIVE', loadParents: 'true', resourceFilterCriteria: 'VAL,AAX', sort: 'code,asc' }}
        `(
            '$fnName given roles=$roles and filter=$filter',
            ({ fnName, roles, filter, resource, httpParams, loadParents, resourceFilterCriteria }) => {
                it(`should call get for ${resource} with params: ${JSON.stringify(httpParams)}`, () => {
                    // only the findStoresByRoles supports loading parents for now
                    if (fnName === 'findStoresByRoles') {
                        api[fnName](roles, filter, loadParents, resourceFilterCriteria);
                    } else {
                        api[fnName](roles, filter);
                    }
                    verifyGetCall(resource, httpParams);
                });
            }
        );
    });
});
