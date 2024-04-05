import { of } from 'rxjs';
import { RoleFacade } from './role-facade';
import { RoleState } from './role-state';

describe('RoleFacade', () => {
    describe('getMyRoles', () => {
        it('should return roles from state', async () => {
            const mockState = {
                myRoles: of([]),
            } as RoleState;
            const roleFacade = new RoleFacade('//gateway', undefined, mockState);

            const myRoles: string[] = await roleFacade.getMyRoles().toPromise();

            expect(myRoles).toEqual([]);
        });
    });

    describe('loadMyRoles', () => {
        it('should load roles from api and save in state', async () => {
            const state = new RoleState();
            const roleFacade = new RoleFacade('//gateway', undefined, state);
            const api = roleFacade['api'];

            // mock api to return expected roles
            const expected = ['Role1'];
            jest.spyOn(api, 'myRoles').mockReturnValue(of(expected));
            // mock state.updateMyRoles
            jest.spyOn(state, 'updateMyRoles').mockImplementation();

            await roleFacade.loadMyRoles();

            expect(api.myRoles).toHaveBeenCalled();
            expect(state.updateMyRoles).toHaveBeenCalledWith(expected);
        });
    });

    describe('clear', () => {
        it('should clear roles in state', () => {
            const state = new RoleState();
            const roleFacade = new RoleFacade('//gateway', undefined, state);
            jest.spyOn(state, 'clearMyRoles').mockImplementation();

            roleFacade.clearMyRoles();

            expect(state.clearMyRoles).toHaveBeenCalled();
        });
    });

    describe('hasAnyRole', () => {
        let roleFacade: RoleFacade;
        beforeEach(() => {
            const mockState = {
                myRoles: of(['ROLE1', 'ROLE2', 'ROLE3']),
            } as RoleState;
            roleFacade = new RoleFacade('//gateway', undefined, mockState);
        });
        it('should emit true if role is present', async () => {
            expect(await roleFacade.hasAnyRole(['ROLE1']).toPromise()).toEqual(true);
            expect(await roleFacade.hasAnyRole(['FOO', 'ROLE1', 'BAR']).toPromise()).toEqual(true);
        });
        it('should emit false if passed an empty array', async () => {
            expect(await roleFacade.hasAnyRole([]).toPromise()).toEqual(false);
        });
        it('should emit false if passed a role that is not present', async () => {
            expect(await roleFacade.hasAnyRole(['FOO']).toPromise()).toEqual(false);
        });
        it('should emit false if passed a role that is present but incorrect case', async () => {
            expect(await roleFacade.hasAnyRole(['role1']).toPromise()).toEqual(false);
        });
        it('should emit false if passed an array containing undefined', async () => {
            expect(await roleFacade.hasAnyRole([undefined]).toPromise()).toEqual(false);
        });
        it('should emit false if passed an array containing null', async () => {
            expect(await roleFacade.hasAnyRole([null]).toPromise()).toEqual(false);
        });
    });
});
