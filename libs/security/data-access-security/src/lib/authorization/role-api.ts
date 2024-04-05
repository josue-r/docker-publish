import { Inject } from '@angular/core';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';

export class RoleApi extends Api<void, void> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}security/v1/roles`, config);
        // super(`http://localhost:9016/v1/roles`, config);
    }

    /** Returns all role names that are assigned to the current authenticated user. */
    myRoles() {
        return this.get<string[]>([]);
    }
}
