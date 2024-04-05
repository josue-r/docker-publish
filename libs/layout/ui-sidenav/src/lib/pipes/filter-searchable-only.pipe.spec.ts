// TODO: 05/11/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MenuItem } from '@vioc-angular/central-ui/data-access-menu';
import { FilterSearchableOnlyPipe } from './filter-searchable-only.pipe';

describe('FilterSearchableOnlyPipe', () => {
    const pipe = new FilterSearchableOnlyPipe();
    const testMenuItem1 = { name: 'test1', path: '/test1' } as MenuItem;
    const testMenuItem2 = { name: 'test2', path: '/test2' } as MenuItem;
    const testMenuItem3 = { name: 'test3', path: '/test3', searchableOnly: true } as MenuItem;

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it.each`
        menuItems                                        | expectedResults
        ${[testMenuItem1]}                               | ${[testMenuItem1]}
        ${[testMenuItem1, testMenuItem2]}                | ${[testMenuItem1, testMenuItem2]}
        ${[testMenuItem1, testMenuItem2, testMenuItem3]} | ${[testMenuItem1, testMenuItem2]}
        ${[testMenuItem3]}                               | ${[]}
        ${[]}                                            | ${[]}
    `('expectedResults=$expectedResults when menuItems=$menuItems', ({ menuItems, expectedResults }) => {
        expect(pipe.transform(menuItems)).toEqual(expectedResults);
    });
});
