import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { QueryPage, QuerySort } from '@vioc-angular/shared/common-api-models';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { Column } from '@vioc-angular/shared/util-column';
import { of } from 'rxjs';
import { SearchSelection } from './search-selection';

@Component({
    template: `
        <vioc-angular-search
            #search
            [columns]="columns"
            [searchFn]="searchFn"
            [sort]="sort"
            [page]="page"
            [selectable]="true"
            [previousSearchEnabled]="false"
            (rowSelect)="selectRow($event)"
        >
        </vioc-angular-search>
    `,
})
class TestSelectionComponent extends SearchSelection<Object> {
    columns = { code: Column.of({ apiFieldPath: 'code', name: 'Code', type: 'string' }) };
    sort = new QuerySort(this.columns.code);
    page = new QueryPage(0, 20);
    searchFn = () => of({ content: [], totalElements: 0 });
}

describe('SearchSelection', () => {
    let fixture: ComponentFixture<TestSelectionComponent>;
    let component: TestSelectionComponent;

    const testObj = { id: 1, code: 'CODE1', description: 'Desc 1' };
    const testObj2 = { id: 2, code: 'CODE2', description: 'Desc 2' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestSelectionComponent],
            imports: [FeatureSearchMockModule],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestSelectionComponent);
        component = fixture.componentInstance;
        component.control = new FormControl([]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        describe('input checks', () => {
            it('should verify control is set', () => {
                component.control = undefined;
                expect(() => component.ngOnInit()).toThrowError('The "control" input must be set');
            });
        });

        describe('selection change subscription', () => {
            it('should update control value as selections change', () => {
                component.searchComponent.selection.select(testObj);
                expect(component.control.value).toEqual([testObj]);
                component.searchComponent.selection.deselect(testObj);
                expect(component.control.value).toEqual([]);
            });
        });
    });

    describe.each`
        multiSelect | hasExistingValue | expectedResult
        ${true}     | ${true}          | ${[testObj, testObj2]}
        ${true}     | ${false}         | ${[testObj2]}
        ${false}    | ${true}          | ${[testObj2]}
        ${false}    | ${false}         | ${[testObj2]}
    `('selectRow', ({ multiSelect, hasExistingValue, expectedResult }) => {
        it(`should result in ${expectedResult} if multi is ${multiSelect} and selection is ${
            hasExistingValue ? 'not ' : ''
        } empty`, () => {
            component.multiple = multiSelect;
            if (hasExistingValue) {
                component.searchComponent.selection.select(testObj);
                component.selectRow(testObj2);
                expect(component.searchComponent.selection.selected).toEqual(expectedResult);
                expect(component.control.value).toEqual(expectedResult);
            }
        });
    });

    describe('clear', () => {
        it('should tell the search component to clear', () => {
            jest.spyOn(component.searchComponent, 'clear');
            component.clear();
            expect(component.searchComponent.clear).toHaveBeenCalled();
        });
    });

    describe('unsavedChanges', () => {
        it('should check the dirty state of the control', () => {
            expect(component.unsavedChanges).toBeFalsy();
            component.control.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        });
    });
});
