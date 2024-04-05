import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { MockAddRemoveButtonComponent } from '@vioc-angular/shared/ui-add-remove-button';
import {
    booleanColumn,
    Column,
    Comparators,
    decimalColumn,
    integerColumn,
    notSearchableColumn,
    stringColumn,
} from '@vioc-angular/shared/util-column';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { SearchChip } from '../models/search-chip';
import { SearchFilterComponent } from './search-filter.component';

describe('SearchFilterComponent', () => {
    @Component({
        selector: 'vioc-angular-search-line',
        template: '',
    })
    class MockSearchLineComponent {
        @Input() searchableColumns: Column[];
        @Input() searchLineForm: AbstractControl;
    }

    let component: SearchFilterComponent;
    let fixture: ComponentFixture<SearchFilterComponent>;

    const buildForm = (lines: SearchLine[] = []): TypedFormGroup<{ lines: SearchLine[] }> => {
        const formFactory = TestBed.inject(FormFactory);
        return formFactory.searchFilter(lines);
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatChipsModule,
                MatExpansionModule,
                MatIconModule,
                MatTooltipModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
            ],
            declarations: [SearchFilterComponent, MockAddRemoveButtonComponent, MockSearchLineComponent],
            providers: [FormFactory],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchFilterComponent);
        component = fixture.componentInstance;
        component.columns = [integerColumn];
        component.searchForm = buildForm();
        fixture.detectChanges();
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('inputs', () => {
        it('should update searchableColumns when the columns change', () => {
            component.columns = [integerColumn, booleanColumn, stringColumn, notSearchableColumn];
            // notSearchableColumn should get filtered out
            expect(component.searchableColumns).toEqual([integerColumn, booleanColumn, stringColumn]);
        });
        it('should update the displayed search lines', () => {
            const newSearchLines = [new SearchLine(), new SearchLine(), new SearchLine(), new SearchLine()];
            component.searchForm = buildForm(newSearchLines);
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.directive(MockSearchLineComponent))).toHaveLength(
                newSearchLines.length
            );
        });
        it('should update the displayed chips', () => {
            const newSearchChips = [
                new SearchChip(new SearchLine(integerColumn, Comparators.equalTo, 2)),
                new SearchChip(new SearchLine(booleanColumn, Comparators.true)),
            ];
            component.chips = newSearchChips;
            fixture.detectChanges();
            const displayedChips = fixture.debugElement.queryAll(By.directive(MatChip));
            expect(displayedChips).toHaveLength(newSearchChips.length);
            displayedChips
                .map((chip) => chip.query(By.css('span.chip-content-overflow')).nativeElement.innerHTML.trim())
                .forEach((chipContent) => expect(['Id equal to 2', 'Boolean is Y']).toContain(chipContent));
        });
    });

    describe('outputs', () => {
        describe.each`
            output           | event           | matcher
            ${'clearFilter'} | ${'click'}      | ${By.css('.clear-filter')}
            ${'resetFilter'} | ${'click'}      | ${By.css('.reset-filter')}
            ${'search'}      | ${'click'}      | ${By.css('.search')}
            ${'addLine'}     | ${'addItem'}    | ${By.directive(MockAddRemoveButtonComponent)}
            ${'removeLine'}  | ${'removeItem'} | ${By.directive(MockAddRemoveButtonComponent)}
        `('buttons', ({ output, event, matcher }) => {
            it(`should emit ${output} when after a(n) ${event} event`, () => {
                const outputSpy = jest.spyOn(component[output], 'emit');
                fixture.debugElement.query(matcher).triggerEventHandler(event, {});
                expect(outputSpy).toHaveBeenCalled();
            });
        });
    });

    describe('addRemoveButton display logic', () => {
        beforeEach(() => {
            component.columns = [integerColumn, booleanColumn, stringColumn, decimalColumn];
            // column configuration results in 2 search lines being displayed (booleanColumn and stringColumn)
            component.searchForm = buildForm(SearchLine.defaults(component.searchableColumns));
        });

        describe.each`
            index | expectedResult
            ${0}  | ${false}
            ${1}  | ${true}
        `('isAddLineButtonDisplayed', ({ index, expectedResult }) => {
            it(`should be ${expectedResult} for index ${index}`, () => {
                expect(component.isAddLineButtonDisplayed(index)).toEqual(expectedResult);
            });
        });

        describe.each`
            selectedColumn   | expectedResult
            ${null}          | ${true}
            ${integerColumn} | ${false}
        `('isAddLineButtonDisabled', ({ selectedColumn, expectedResult }) => {
            it(`should be ${expectedResult} when the column is ${selectedColumn ? 'selected' : 'empty'}`, () => {
                const searchLine = component.searchForm.getArray('lines').controls[1];
                searchLine.get('column').setValue(selectedColumn);
                expect(component.isAddLineButtonDisabled(searchLine)).toEqual(expectedResult);
            });
        });

        describe.each`
            removable | lineCount | expectedResult
            ${true}   | ${2}      | ${true}
            ${false}  | ${2}      | ${false}
            ${true}   | ${1}      | ${false}
            ${false}  | ${1}      | ${false}
        `('isRemoveLineButtonDisplayed', ({ removable, lineCount, expectedResult }) => {
            it(`should be ${expectedResult} if lineCount is ${lineCount} and removable is ${removable}`, () => {
                component.searchForm = buildForm(new Array(lineCount).fill(new SearchLine(), 0, lineCount));
                const line = component.searchForm.getArray('lines').controls[0];
                line.get('removable').setValue(removable);
                expect(component.isRemoveLineButtonDisplayed(line)).toEqual(expectedResult);
            });
        });
    });

    describe('open', () => {
        it('should open the expansion panel', () => {
            jest.spyOn(component.expansionPanel, 'open');
            component.open();
            expect(component.expansionPanel.open).toHaveBeenCalled();
        });
    });
});
