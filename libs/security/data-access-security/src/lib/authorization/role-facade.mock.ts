import { RoleFacade } from './role-facade';
import { RoleState } from './role-state';

/** Mock of `RoleFacade` supporting configuring state for testing. */
export class RoleFacadeMock extends RoleFacade {
    constructor() {
        super('//mockGateway/', null, new RoleState());
    }

    /** @override */
    loadMyRoles(): Promise<string[]> {
        throw new Error('Loading roles not supported here.  Call "setState(...)" instead');
    }

    setRoles(roles: string[]): void {
        this.state.updateMyRoles(roles);
    }
}
