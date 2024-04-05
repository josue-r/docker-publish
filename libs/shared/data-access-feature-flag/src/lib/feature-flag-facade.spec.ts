import { fakeAsync, flush } from '@angular/core/testing';
import { AuthenticationFacade, User } from '@vioc-angular/security/data-access-security';
import { expectObservable } from '@vioc-angular/test/util-test';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { FeatureFlagFacade } from './feature-flag-facade';
import { FeatureFlagState } from './feature-flag-state';
import { DefaultOverride } from './models/default-override.enum';
import { FeatureStatus } from './models/feature-status';

describe('FeatureFlagFacade', () => {
    const statuses: string[] = [];
    statuses[FeatureStatus.ENABLED] = 'ENABLED';
    statuses[FeatureStatus.DISABLED] = 'DISABLED';
    statuses[FeatureStatus.UNSPECIFIED] = 'UNSPECIFIED';

    let authFacadeStub: AuthenticationFacade;
    let state: FeatureFlagState;
    let facade: FeatureFlagFacade = beforeEach(() => {
        authFacadeStub = {
            getUser: () => throwError('getUser not mocked') as Observable<User>,
        } as AuthenticationFacade;
        state = new FeatureFlagState(EMPTY);
        facade = new FeatureFlagFacade(state, authFacadeStub);
    });

    describe('isEnabled', () => {
        it('should pass user on to state if user present', fakeAsync(() => {
            jest.spyOn(state, 'getStatus').mockReturnValue(EMPTY); // does not matter
            jest.spyOn(authFacadeStub, 'getUser').mockReturnValue(of({ id: 'anyone' } as User));

            facade.isEnabled('a.b.c').subscribe();
            flush();

            expect(state.getStatus).toHaveBeenCalledWith('a.b.c', 'anyone');
        }));
        it('should not pass user on to state if user not present', fakeAsync(() => {
            jest.spyOn(state, 'getStatus').mockReturnValue(EMPTY); // does not matter
            jest.spyOn(authFacadeStub, 'getUser').mockReturnValue(EMPTY);

            facade.isEnabled('a.b.c').subscribe();
            flush();

            expect(state.getStatus).toHaveBeenCalledWith('a.b.c', null);
        }));
        it('should handle default override', fakeAsync(() => {
            jest.spyOn(state, 'getStatus').mockReturnValue(of(FeatureStatus.UNSPECIFIED));
            jest.spyOn(state, 'getDefault');
            jest.spyOn(authFacadeStub, 'getUser').mockReturnValue(EMPTY); // does not matter

            facade.overrideDefault = DefaultOverride.ENABLED; // state defaults to false
            expectObservable(facade.isEnabled('a.b.c')).toBe(true);

            expect(state.getDefault).not.toHaveBeenCalled();
            expect(state.getStatus).toHaveBeenCalledWith('a.b.c', null);
        }));
    });

    describe.each`
        statusFromState              | defaultFromState | expected
        ${FeatureStatus.ENABLED}     | ${true}          | ${true}
        ${FeatureStatus.ENABLED}     | ${false}         | ${true}
        ${FeatureStatus.DISABLED}    | ${true}          | ${false}
        ${FeatureStatus.DISABLED}    | ${false}         | ${false}
        ${FeatureStatus.UNSPECIFIED} | ${true}          | ${true}
        ${FeatureStatus.UNSPECIFIED} | ${false}         | ${false}
    `('isEnabled', ({ statusFromState, defaultFromState, expected }) => {
        const statusString = statuses[statusFromState as FeatureStatus];
        it(`should return ${expected} if status=${statusString} and default=${defaultFromState}`, fakeAsync(() => {
            jest.spyOn(authFacadeStub, 'getUser').mockReturnValue(of({ id: 'anyone' } as User));
            jest.spyOn(state, 'getStatus').mockReturnValue(of(statusFromState));
            jest.spyOn(state, 'getDefault').mockReturnValue(of(defaultFromState));

            expectObservable(facade.isEnabled('a.b.c')).toBe(expected);
        }));
    });
});
