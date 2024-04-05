import { QueryRestriction, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described, DynamicDropdownOptions } from '@vioc-angular/shared/util-column';
import { EMPTY, of } from 'rxjs';
import { ResourceFilterCriteria } from '../model/resource-filter-criteria';
import { ResourceState } from '../state/resource-state';
import { contextToRoles, ResourceFacade, ResourceSearchColumns } from './resource-facade';

describe('ResourceFacade', () => {
    let state: ResourceState;
    let facade: ResourceFacade;

    beforeEach(() => {
        state = new ResourceState();
        facade = new ResourceFacade('//gateway', null, state);
    });

    describe('adding resourceFilterCriteria resourceFacade', () => {
        it('should use what is in state if cached with criteria included for region', async () => {
            jest.spyOn(facade['api'], 'findRegionsByRoles').mockImplementation();
            // put in state and verify that state is used
            state.cacheResoucesByType(
                'region',
                'ACTIVE',
                ['ROLE1'],
                of({
                    resources: [{ id: 0 }, { id: 1 }],
                    allCompanies: false,
                }),
                false,
                [ResourceFilterCriteria.byCompany('VAL')]
            );

            const actual = await facade['findRegionsByRolesAndCompany'](['ROLE1'], 'VAL').toPromise();
            expect(actual).toEqual({
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            });
            expect(facade['api']['findRegionsByRoles']).not.toHaveBeenCalled();
        });

        it('should use what is in state if cached with criteria included for market', async () => {
            jest.spyOn(facade['api'], 'findMarketsByRoles').mockImplementation();
            // put in state and verify that state is used
            state.cacheResoucesByType(
                'market',
                'ACTIVE',
                ['ROLE1'],
                of({
                    resources: [{ id: 0 }, { id: 1 }],
                    allCompanies: false,
                }),
                false,
                [ResourceFilterCriteria.byCompany('VAL')]
            );

            const actual = await facade['findMarketsByRolesAndCompany'](['ROLE1'], 'VAL').toPromise();
            expect(actual).toEqual({
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            });
            expect(facade['api']['findMarketsByRoles']).not.toHaveBeenCalled();
        });

        it('should use what is in state if cached with criteria included for market', async () => {
            jest.spyOn(facade['api'], 'findMarketsByRoles').mockImplementation();
            // put in state and verify that state is used
            state.cacheResoucesByType(
                'market',
                'ACTIVE',
                ['ROLE1'],
                of({
                    resources: [{ id: 0 }, { id: 1 }],
                    allCompanies: false,
                }),
                false,
                [ResourceFilterCriteria.byRegion('VAL', '100')]
            );

            const actual = await facade['findMarketsByRolesAndCompanyAndRegion'](['ROLE1'], 'VAL', '100').toPromise();
            expect(actual).toEqual({
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            });
            expect(facade['api']['findMarketsByRoles']).not.toHaveBeenCalled();
        });
    });

    describe.each`
        type         | facadeMethod              | apiMethod
        ${'company'} | ${'findCompaniesByRoles'} | ${'findCompaniesByRoles'}
        ${'region'}  | ${'findRegionsByRoles'}   | ${'findRegionsByRoles'}
        ${'market'}  | ${'findMarketsByRoles'}   | ${'findMarketsByRoles'}
        ${'area'}    | ${'findAreasByRoles'}     | ${'findAreasByRoles'}
        ${'store'}   | ${'findStoresByRoles'}    | ${'findStoresByRoles'}
    `(`$facadeMethod`, ({ type, facadeMethod, apiMethod }) => {
        it('should use what is in state if cached', async () => {
            jest.spyOn(facade['api'], apiMethod).mockImplementation();
            // put in state and verify that state is used
            state.cacheResoucesByType(
                type,
                'ACTIVE',
                ['ROLE1'],
                of({
                    resources: [{ id: 0 }, { id: 1 }],
                    allCompanies: false,
                })
            );

            const actual = await facade[facadeMethod](['ROLE1']).toPromise();
            expect(actual).toEqual({
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            });
            expect(facade['api'][apiMethod]).not.toHaveBeenCalled();
        });

        it('should fetch from API and cache if not cached', async () => {
            // put in another type in state
            const resources = {
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            };
            state.cacheResoucesByType(type, 'ACTIVE', ['ROLE1'], of(resources));

            const resources2 = {
                resources: [{ id: 2 }, { id: 3 }],
                allCompanies: true,
            };
            jest.spyOn(facade['api'], apiMethod).mockImplementationOnce(() => of(resources2));

            const actual = await facade[facadeMethod](['ROLE2']).toPromise();
            expect(actual).toEqual(resources2);
            expect(facade['api'][apiMethod]).toHaveBeenCalledTimes(1);
            // call again and verify API was not called as second time
            await facade[facadeMethod](['ROLE2']).toPromise();
            expect(facade['api'][apiMethod]).toHaveBeenCalledTimes(1);
        });

        it.each`
            activeFilter
            ${'ACTIVE'}
            ${'INACTIVE'}
            ${'ALL'}
        `(`should accept $activeFilter activeFilter`, async ({ activeFilter }) => {
            const resources = {
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            };
            jest.spyOn(facade['api'], apiMethod).mockImplementationOnce(() => of(resources));

            await facade[facadeMethod](['ROLE1'], activeFilter).toPromise();

            // only the findStoresByRoles method supports passing loadParents and resourceFilterCriteria
            if (facadeMethod === 'findStoresByRoles') {
                expect(facade['api'][apiMethod]).toHaveBeenCalledWith(['ROLE1'], activeFilter, false, undefined);
            } else {
                expect(facade['api'][apiMethod]).toHaveBeenCalledWith(['ROLE1'], activeFilter);
            }
        });
    });

    describe('findStoresByRoles', () => {
        it.each`
            loadParents | resourceFilterCriteria
            ${false}    | ${[]}
            ${false}    | ${[{ criteria: 'VAL' }]}
            ${true}     | ${[{ criteria: 'VAL' }]}
        `(
            'should accept loadParents $loadParents and resourceFilterCriteria $resourceFilterCriteria',
            async ({ loadParents, resourceFilterCriteria }) => {
                const resources = {
                    resources: [{ id: 0 }, { id: 1 }],
                    allCompanies: false,
                };
                jest.spyOn(facade['api'], 'findStoresByRoles').mockImplementationOnce(() => of(resources));
                await facade['findStoresByRoles'](['ROLE1'], 'ACTIVE', loadParents, resourceFilterCriteria).toPromise();
                expect(facade['api']['findStoresByRoles']).toHaveBeenCalledWith(
                    ['ROLE1'],
                    'ACTIVE',
                    loadParents,
                    resourceFilterCriteria
                );
            }
        );
    });

    describe('searchStoresByRoles', () => {
        let querySpy: jest.SpyInstance;
        const querySearch = {
            queryRestrictions: [{ fieldPath: 'test' } as unknown as QueryRestriction],
        } as unknown as QuerySearch;
        const roles = ['test_role'];
        const paths = ['store', 'search'];
        beforeEach(() => (querySpy = jest.spyOn(facade['api'], 'query').mockImplementation()));
        it('should delegate to the api with a default minmal projection', () => {
            facade.searchStoresByRoles(querySearch, roles);
            expect(querySpy).toHaveBeenCalledWith(
                { ...querySearch, additionalParams: { roles, projection: 'MINIMAL' } },
                paths
            );
        });
        it('should delegate to the api with a specified projection', () => {
            facade.searchStoresByRoles(querySearch, roles, 'FULL');
            expect(querySpy).toHaveBeenCalledWith(
                { ...querySearch, additionalParams: { roles, projection: 'FULL' } },
                paths
            );
        });
        it('should delegate to the api with the given additionalParams', () => {
            const additionalParam = { testParam: 'value' };
            facade.searchStoresByRoles({ ...querySearch, additionalParams: additionalParam }, roles);
            expect(querySpy).toHaveBeenCalledWith(
                { ...querySearch, additionalParams: { ...additionalParam, roles, projection: 'MINIMAL' } },
                paths
            );
        });
    });

    describe('contextToRoles', () => {
        it('should map to roles', () => {
            const roles = contextToRoles('FOO', ['READ', 'UPDATE', 'DELETE']);
            expect(roles).toEqual(['ROLE_FOO_READ', 'ROLE_FOO_UPDATE', 'ROLE_FOO_DELETE']);
        });
    });

    describe('ResourceSearchColumns', () => {
        describe('contextDropdown', () => {
            it('should delegate to rolesDropdown with computed roles', () => {
                const resourceSearchColumns = new ResourceSearchColumns('Foo', () => EMPTY);
                jest.spyOn(resourceSearchColumns, 'rolesDropdown').mockImplementation();

                resourceSearchColumns.contextDropdown('FOO', 'ACTIVE', { nullable: true });

                expect(resourceSearchColumns.rolesDropdown).toHaveBeenCalledWith(
                    ['ROLE_FOO_READ', 'ROLE_FOO_UPDATE'],
                    'ACTIVE',
                    { nullable: true }
                );
            });
        });

        describe('rolesDropdown', () => {
            it('should set properties with defaults', () => {
                const dropdown = new ResourceSearchColumns('Foo', () => EMPTY).rolesDropdown([]);

                expect(dropdown).toMatchObject({
                    name: 'Foo',
                    apiFieldPath: 'foo',
                    type: { entityType: 'foo' },
                    hint: 'Foo Code',
                    displayable: true,
                    apiSortPath: 'foo.code',
                    fetchData: expect.any(Function),
                });
            });
            it('should allow overrides of defaults', () => {
                const overrides: DynamicDropdownOptions<Described> = {
                    name: 'Bar', // does not make sense to override since passed in constructor
                    apiFieldPath: 'bar',
                    hint: 'Foo Bar',
                    apiSortPath: 'bar.code',
                    type: { entityType: 'Bar' },
                    nullable: true,
                };
                const dropdown = new ResourceSearchColumns('Foo', () => EMPTY, overrides).rolesDropdown([]);

                expect(dropdown).toMatchObject({
                    name: 'Foo', // does not make sense to override since passed in constructor
                    apiFieldPath: 'bar',
                    hint: 'Foo Bar',
                    displayable: true,
                    apiSortPath: 'bar.code',
                    type: { entityType: 'Bar' },
                    nullable: true,
                    fetchData: expect.any(Function),
                });
            });
        });
    });
});
