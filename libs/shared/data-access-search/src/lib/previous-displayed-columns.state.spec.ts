import { fakeAsync, flush } from '@angular/core/testing';
import { PreviousDisplayedColumnsState } from './previous-displayed-columns.state';

const displayedColumns = ['code', 'description'];

describe('PreviousDisplayedColumnsState', () => {
    it('should track state', fakeAsync(() => {
        const state = new PreviousDisplayedColumnsState();

        let previousColumns: string[];
        state.getPreviousDisplayedColumns().subscribe((pc) => (previousColumns = pc));
        expect(previousColumns).toEqual([]);

        state.updatePreviousDisplayedColumns(displayedColumns);
        flush();
        state.getPreviousDisplayedColumns().subscribe((pc) => (previousColumns = pc));
        expect(previousColumns).toEqual(displayedColumns);

        displayedColumns.push('active');
        state.updatePreviousDisplayedColumns(displayedColumns);
        flush();
        state.getPreviousDisplayedColumns().subscribe((pc) => (previousColumns = pc));
        expect(previousColumns).toEqual(['code', 'description', 'active']);
    }));
});
