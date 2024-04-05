/**
 * Iterface used to display the implications of deactivating a resource at the `Company` and/or `Store` levels.
 */
export interface AssignmentCount {
    id: any;
    /**
     * The description of the entity being deactivated.
     */
    description: string;
    /**
     * Number of affected `Company` resources when deactivating.
     */
    companyResourceCount?: number;
    /**
     * Number of affected `Store` resources when deactivating.
     */
    storeResourceCount?: number;
}
