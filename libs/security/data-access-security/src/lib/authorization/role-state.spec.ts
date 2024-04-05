import { fakeAsync, flush } from '@angular/core/testing';
import { RoleState } from './role-state';

describe('RoleState', () => {
    it('should create an instance', () => {
        expect(new RoleState()).toBeTruthy();
    });

    let state: RoleState;

    beforeEach(() => {
        state = new RoleState();
    });

    describe('updateMyRoles', () => {
        it('should emit to role observable and update cached roles', fakeAsync(() => {
            let myUpdatedRoles: string[] = [];
            state.myRoles.subscribe((updatedRoles) => (myUpdatedRoles = updatedRoles));
            expect(state.myCachedRoles).toEqual([]);

            const expected = ['Role1', 'Role2'];
            state.updateMyRoles(expected);
            flush();

            expect(myUpdatedRoles).toEqual(expected);
            expect(state.myCachedRoles).toEqual(expected);
        }));
    });

    describe('clearMyRoles', () => {
        it('should emit to role observable and clear cached roles', fakeAsync(() => {
            // set initial roles
            const initialRoles = ['Role1', 'Role2'];
            state.updateMyRoles(initialRoles);
            flush();
            expect(state.myCachedRoles).toEqual(initialRoles);

            // execute the clear
            let myUpdatedRoles: string[] = [];
            state.myRoles.subscribe((updatedRoles) => (myUpdatedRoles = updatedRoles));
            state.clearMyRoles();
            flush();

            // verify that myCachedRoles were updated and observable emitted
            expect(myUpdatedRoles).toEqual([]);
            expect(state.myCachedRoles).toEqual([]);
        }));
    });
});
