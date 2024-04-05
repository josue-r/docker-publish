/**
 * Standard wrapper for a minimal entity with a code and description.
 * Intended to be used for things such as store, common-code, etc.
 *
 * @export
 * @interface Described
 */
export class Described {
    id?: any = null;
    code?: string = null;
    description?: string = null;
    version?: number = null;

    static readonly idMapper = (d: Described) => d.id;
    static readonly codeMapper = (d: Described) => d.code;
    static readonly descriptionMapper = (d: Described) => d.description;
    static readonly codeAndDescriptionMapper = (d: Described) => `${d.code} - ${d.description}`;
    static idEquals = (v1: Described, v2: Described) => v1 && v2 && v1.id === v2.id;
    static descriptionComparator = (v1: Described, v2: Described) => v1.description.localeCompare(v2.description);
    static codeComparator = (v1: Described, v2: Described) => v1.code.localeCompare(v2.code);

    /** Creates an array of `Described` objects with the specified codes.  No field will be set other than code. */
    static fromCodes(...codes: string[]): Described[] {
        return codes.map((code) => ({ code }));
    }
}
