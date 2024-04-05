/**
 * A mock entity model to tie to columns defined in column.mocks.ts
 */
export interface TestEntity {
    name: string;
    active: boolean;
    id: number;
    decimal: number;
    currency: number;
    date: string;
    simpleString: string;
    simpleObject: {
        id: number;
        desc: string;
    };
    dynamicString: string;
    errorString: string;
    searchableOnly: number;
    parent: {
        child: {
            category: {
                id: number;
                desc: string;
            };
        };
    };
}
