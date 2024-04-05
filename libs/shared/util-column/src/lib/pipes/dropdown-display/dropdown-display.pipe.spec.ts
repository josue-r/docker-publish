import { of } from 'rxjs';
import { DynamicDropdownColumn } from '../../models/dropdown-column';
import { DropdownDisplayPipe } from './dropdown-display.pipe';

describe('DropdownDisplayPipe', () => {
    let pipe: DropdownDisplayPipe;
    let dynamicDropdownColumn: DynamicDropdownColumn<any>;

    const value1 = { desc: 'value1', id: 1 };
    const value2 = { desc: 'value2', id: 2 };
    const value3 = { desc: 'value3', id: 3 };

    const createDynamicDropdownColumn = (): DynamicDropdownColumn<any> => {
        return DynamicDropdownColumn.of({
            name: 'Test Entity',
            apiFieldPath: 'test',
            apiSortPath: 'test.id',
            type: { entityType: 'TestEntity' },
            fetchData: () => of([value1, value2, value3]),
            hint: 'Test Entity Values',
            mapToKey: (value) => value.id,
            mapToDropdownDisplay: (value) => `${value.id} - ${value.desc}`,
            mapToFilterDisplay: (value) => value.desc,
            mapToTableDisplay: (value) => value.desc,
        });
    };

    beforeEach(() => {
        pipe = new DropdownDisplayPipe();
        dynamicDropdownColumn = createDynamicDropdownColumn();
    });

    it('should transform a value into its correct display value', () => {
        expect(pipe.transform(value1, dynamicDropdownColumn)).toBe('1 - value1');
        expect(pipe.transform(value2, dynamicDropdownColumn)).toBe('2 - value2');
        expect(pipe.transform(value3, dynamicDropdownColumn)).toBe('3 - value3');
    });
});
