import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { DropListItem } from '../models/drop-list-item';
import { DropListComponent } from './drop-list.component';

describe('DropListComponent', () => {
    let fixture: ComponentFixture<DropListComponent>;
    let component: DropListComponent;

    const data: DropListItem[] = [
        { name: 'Column 1', selected: false },
        { name: 'Column 2', selected: false },
        { name: 'Column 3', selected: false },
        { name: 'Column 4', selected: false },
    ];

    @Component({
        template: `
            <vioc-angular-drop-list
                #availableDropList
                [listId]="'available-list'"
                [name]="'Available List'"
                [data]="availableList"
                [connectedDropLists]="['displayed-list']"
                [sortingDisabled]="true"
                (selectItem)="select($event)"
                (moveItem)="add($event)"
            >
            </vioc-angular-drop-list>
            <vioc-angular-drop-list
                #displayedDropList
                [listId]="'displayed-list'"
                [name]="'Displayed List'"
                [data]="displayedList"
                [connectedDropLists]="['available-list']"
                (selectItem)="select($event)"
                (moveitem)="remove($event)"
            >
            </vioc-angular-drop-list>
        `,
    })
    class TestDropListComponent {
        @ViewChild('availableDropList') readonly availableDropList: DropListComponent;

        @ViewChild('displayedDropList') readonly displayedDropList: DropListComponent;

        list: DropListItem[] = [];

        availableList: DropListItem[] = [];
        displayedList: DropListItem[] = [];

        select(item: DropListItem): void {
            this.list.find((listItem) => listItem.name === item.name).selected = !item.selected;
        }

        add(item: DropListItem): void {
            this.availableList.splice(this.list.indexOf(item), 1);
            this.displayedList.push(item);
        }

        remove(item: DropListItem): void {
            this.displayedList.splice(this.list.indexOf(item), 1);
            this.availableList.push(item);
        }
    }

    @Component({
        template: `
            <ng-template #reorderedItems let-item="templateItem">
                <mat-icon>reorder</mat-icon>
                <span>{{ item.name }}</span>
            </ng-template>
        `,
    })
    class TestTemplateComponent {
        @ViewChild('reorderedItems', { static: true }) reorderedItems: TemplateRef<any>;

        item: DropListItem;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DragDropModule, MatIconModule, MatRippleModule],
            declarations: [DropListComponent, TestDropListComponent, TestTemplateComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DropListComponent);
        component = fixture.componentInstance;
        component.name = 'Test Drop List';
        component.listId = 'test-drop-list';
        component.data = data;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the list name', () => {
        expect(fixture.debugElement.query(By.css('h4')).nativeElement.textContent).toEqual('Test Drop List');
    });

    it('should hide the list name if not provided', () => {
        component.name = undefined;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('h4'))).toBeNull();
    });

    it('should set an id for the list', () => {
        expect(fixture.debugElement.query(By.css('#test-drop-list'))).toBeTruthy();
    });

    it('should set an id from the name if the listId is not provided', fakeAsync(() => {
        component.listId = undefined;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#test-drop-list'))).toBeTruthy();
    }));

    it('should have an undefined listId if the listId and the name are not provided', fakeAsync(() => {
        component.listId = undefined;
        component.name = undefined;
        fixture.detectChanges();
        expect(component.listId).toBeUndefined();
    }));

    it('should display data', () => {
        const dropListItems = fixture.debugElement.queryAll(By.css('.item'));

        // the same number of items should be displayed as in the data list
        expect(dropListItems.length).toEqual(data.length);
        // each value from data should be displayed
        const displayValues = data.map((item) => item.name);
        dropListItems.forEach((item) => {
            expect(displayValues).toContain(item.nativeElement.textContent.trim());
        });
    });

    it('should allow item selection', () => {
        // select the first item in the list
        jest.spyOn(component, 'select');
        jest.spyOn(component.selectItem, 'emit');
        const dropListItem = fixture.debugElement.query(By.css('.item'));
        dropListItem.nativeElement.click();
        fixture.detectChanges();

        const selectedItem = data.find((item) => item.name === dropListItem.nativeElement.textContent.trim());

        expect(component.select).toHaveBeenCalledWith(selectedItem);
        expect(component.selectItem.emit).toHaveBeenCalledWith(selectedItem);
    });

    describe('template injection', () => {
        let testTemplateFixture: ComponentFixture<TestTemplateComponent>;
        let reorderedItems: TemplateRef<any>;

        beforeEach(() => {
            testTemplateFixture = TestBed.createComponent(TestTemplateComponent);
            reorderedItems = testTemplateFixture.componentInstance.reorderedItems;
            component.displayItemsTemplate = reorderedItems;
            fixture.detectChanges();
        });

        it('should allow a template to be passed as an input', () => {
            // get the first list item
            const dropListItem = fixture.debugElement.query(By.css('.item'));

            // check that the custom template elements appear
            expect(dropListItem.query(By.css('mat-icon')).nativeElement.innerHTML).toEqual('reorder');
            expect(dropListItem.query(By.css('span')).nativeElement.innerHTML).toEqual('Column 1');
        });
    });

    describe('linked lists', () => {
        let testDropListFixture: ComponentFixture<TestDropListComponent>;
        let testDropListComponent: TestDropListComponent;

        beforeEach(() => {
            testDropListFixture = TestBed.createComponent(TestDropListComponent);
            testDropListComponent = testDropListFixture.componentInstance;
            testDropListComponent.list = [...data];
            testDropListComponent.availableList = [...data];
            testDropListFixture.detectChanges();
        });

        it('should connect lists', () => {
            expect(testDropListComponent.availableDropList.connectedDropLists).toContain('displayed-list');
            expect(testDropListComponent.displayedDropList.connectedDropLists).toContain('available-list');
        });

        it('should allow an item to be moved', () => {
            expect(testDropListComponent.availableList).toEqual(data);
            expect(testDropListComponent.displayedList).toEqual([]);

            // select the first item in the available list and move it into the displayed list
            jest.spyOn(testDropListComponent, 'add');
            const dropListItem = testDropListFixture.debugElement.query(By.css('#available-list > div.item'));
            dropListItem.triggerEventHandler('dblclick', new MouseEvent('dblclick'));
            fixture.detectChanges();

            const movedItem = data.find((item) => item.name === dropListItem.nativeElement.textContent.trim());

            expect(testDropListComponent.add).toHaveBeenCalledWith(movedItem);
            expect(testDropListComponent.availableList).toEqual([data[1], data[2], data[3]]);
            expect(testDropListComponent.displayedList).toEqual([data[0]]);
        });
    });
});
