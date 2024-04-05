/**
 * Content and content details that will be returned from a query search.
 */
export interface ResponseEntity<T> {
    content: T[];
    totalElements: number;
}
