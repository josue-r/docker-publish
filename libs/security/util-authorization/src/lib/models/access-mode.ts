/**
 * Indicates whether or not something is in view mode, edit mode or new mode.
 */
export class AccessMode {
    static ADD = new AccessMode('add', '_ADD');
    static EDIT = new AccessMode('edit', '_UPDATE');
    static VIEW = new AccessMode('view', '_READ');
    static ADD_LIKE = new AccessMode('add-like', '_ADD');

    private constructor(
        /**
         * The URL key that this access mode corresponds to when using standard url paths (`/:accessMode/foo/bar`).
         */
        public readonly urlSegement: string,
        /** The default role suffix matching this access mode */
        public readonly defaultRoleSuffix: string
    ) {}

    static of(urlSegement: string): AccessMode {
        if (!urlSegement) {
            throw Error('No urlSegement passed!');
        }
        switch (urlSegement.toUpperCase()) {
            case 'ADD':
            case 'EDIT':
            case 'VIEW':
            case 'ADD-LIKE':
                // AccessMode of segment uppercased with any '-' chars replaced with '_' (ex: add-like -> ADD_LIKE)
                return AccessMode[urlSegement.toUpperCase().replace(/-/g, '_')];
            default:
                throw Error(`Access mode not defined for "${urlSegement.toUpperCase()}"`);
        }
    }

    get isAdd() {
        return this === AccessMode.ADD;
    }
    get isEdit() {
        return this === AccessMode.EDIT;
    }
    get isView() {
        return this === AccessMode.VIEW;
    }
    get isAddLike() {
        return this === AccessMode.ADD_LIKE;
    }
}
