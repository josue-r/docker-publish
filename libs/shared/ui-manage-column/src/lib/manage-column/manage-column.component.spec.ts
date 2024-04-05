import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { DropListItem } from '@vioc-angular/shared/ui-drop-list';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Column, SimpleDropdownColumn } from '@vioc-angular/shared/util-column';
import { ManageColumnComponent } from './manage-column.component';

describe('ManageColumnComponent', () => {
    let component: ManageColumnComponent;
    let fixture: ComponentFixture<ManageColumnComponent>;
    const displayedByDefaultColumn = Column.of({
        name: 'column1',
        type: 'string',
        apiFieldPath: 'column1',
        displayedByDefault: true,
    });
    const defaultColumn = Column.of({
        name: 'column2',
        type: 'string',
        apiFieldPath: 'column2',
        displayedByDefault: false,
    });
    const defaultColumn2 = Column.of({
        name: 'column3',
        type: 'string',
        apiFieldPath: 'column3',
        displayedByDefault: false,
    });
    const dropdown: SimpleDropdownColumn<{ id: any; value: any }> = SimpleDropdownColumn.of({
        name: 'dropdown1',
        type: { entityType: 'testEntity' },
        apiFieldPath: 'testDropdown1',
        mapToKey: (entity) => entity.id,
        mapToFilterDisplay: (entity) => entity.value,
        values: [{ id: 'testid', value: 'testvalue' }],
        hint: 'test dropdown 1',
        apiSortPath: 'testDropdown1',
        displayedByDefault: true,
    });

    @Component({
        selector: 'vioc-angular-drop-list',
        template: '',
    })
    class MockDropListComponent {
        @Input() name: string;

        @Input() data: DropListItem[];

        @Input() connectedDropLists: string[];

        @Input() displayItemsTemplate: TemplateRef<any>;

        @Input() listId: string;

        @Input() sortingDisabled = false;

        @Output() selectItem = new EventEmitter<any>();

        @Output() moveItem = new EventEmitter<{ item: DropListItem; index?: number }>();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatExpansionModule, MatIconModule, UiDialogMockModule],
            declarations: [ManageColumnComponent, MockDropListComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ManageColumnComponent);
        component = fixture.componentInstance;
        component.columns = { displayedByDefaultColumn, defaultColumn, defaultColumn2, dropdown };
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with displayed columns', () => {
        jest.spyOn(component.apply, 'emit');
        jest.spyOn(component, 'closeDialog').mockImplementation();
        component.displayedColumns = [defaultColumn.name];
        component.ngOnInit();
        component.applyChanges();
        expect(component.apply.emit).toHaveBeenCalledWith([defaultColumn.name]);
    });

    it('should update with new displayed columns', () => {
        jest.spyOn(component.apply, 'emit');
        jest.spyOn(component, 'closeDialog').mockImplementation();
        component.displayedColumns = [displayedByDefaultColumn.name, defaultColumn2.name];
        component.ngOnInit();

        component.displayedColumns = [defaultColumn.name];
        component.applyChanges();
        expect(component.apply.emit).toHaveBeenCalledWith([defaultColumn.name]);
    });

    it('should close the dialog when applying changes', () => {
        fixture.detectChanges();

        jest.spyOn(component.apply, 'emit');
        jest.spyOn(component, 'closeDialog').mockImplementation();
        component.applyChanges();
        expect(component.apply.emit).toHaveBeenCalledWith(component.managedColumns.displayedColumnNames);
        expect(component.closeDialog).toHaveBeenCalled();
    });

    describe('select', () => {
        it('should update the selected mnanagedColumn', () => {
            fixture.detectChanges();

            // selected starts as default false
            expect(
                component.managedColumns.all.find((column) => column.name === displayedByDefaultColumn.name).selected
            ).toEqual(false);
            component.select({ name: displayedByDefaultColumn.name, selected: false });
            // after being selected, the value should be true
            expect(
                component.managedColumns.all.find((column) => column.name === displayedByDefaultColumn.name).selected
            ).toEqual(true);
        });
    });

    describe('getGroupName', () => {
        it('should return names in start case', () => {
            expect(component.getGroupName('testNamingChange')).toEqual('Test Naming Change');
        });
    });

    describe('toDropListId', () => {
        it('should create a displayed id when the column is in the displayed list', () => {
            expect(component.toDropListId('storeNumber', true)).toEqual('displayed-store-number-columns');
        });

        it('should create an available id when the column is in the available list', () => {
            expect(component.toDropListId('storeNumber', false)).toEqual('available-store-number-columns');
        });
    });
});
