import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export const mockSearchResults = [
    'AB0001',
    'AB0002',
    'AB0003',
    'AB1001',
    'AB1002',
    'AB1003',
    '040001',
    '040002',
    '040003',
];

/**
 * Mock searching service used for testing
 */
export class MockSearchService {
    static searchDelay = 500;

    constructor() {}

    searchStrings(searchText: string) {
        console.log(`Mocking searching of '${searchText}'`);
        return of(mockSearchResults).pipe(
            map((array) => array.filter((s) => s.startsWith(searchText))),
            delay(MockSearchService.searchDelay) // Simulate network delay
        );
    }
}
