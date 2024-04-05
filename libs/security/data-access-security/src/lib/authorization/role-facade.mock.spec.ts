import { fakeAsync, flush } from '@angular/core/testing';
import { RoleFacadeMock } from './role-facade.mock';

describe('RoleFacadeMock', () => {
    let roleFacade: RoleFacadeMock;
    beforeEach(() => {
        roleFacade = new RoleFacadeMock();
    });
    describe('getMyRoles', () => {
        it('should return empty if not initialized', fakeAsync(() => {
            roleFacade.getMyRoles().subscribe((r) => expect(r).toEqual([]));
            flush();
        }));
        it('should return roles from state', fakeAsync(() => {
            const roles = ['ROLE1', 'ROLE2'];
            roleFacade.setRoles(roles);

            roleFacade.getMyRoles().subscribe((r) => expect(r).toEqual(roles));
            flush();
        }));

        describe('loadMyRoles', () => {
            it('should throw an error', () => {
                expect(() => roleFacade.loadMyRoles()).toThrowError();
            });
        });
    });
});
