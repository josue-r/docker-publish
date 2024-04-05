/** Maps `AccessMode`s to roles. */
export class AccessModeRoleMapping {
    /** The roles corresponding to AccessMode.ADD*/
    add?: string | string[];
    /** The roles corresponding to AccessMode.EDIT*/
    edit?: string | string[];
    /** The roles corresponding to AccessMode.VIEW*/
    view?: string | string[];
}
