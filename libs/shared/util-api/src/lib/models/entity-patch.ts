/**
 * Facilitates doing a partial update of entities. The entities corresponding to the list of  <code>ids</code> have every field in the
 * <code>fields</code> collection updated with their  corresponding values in <code>updateValues</code>.
 */
export interface EntityPatch<ID> {
    id: ID;
    updateValues: any;
    fields: string[];
}
