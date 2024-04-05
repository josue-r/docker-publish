import { SelectionModel } from '@angular/cdk/collections';
import { CdkTableModule } from '@angular/cdk/table';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { TableHeaderComponent } from './table-header.component';

describe('TableHeaderComponent', () => {
    let component: TableHeaderComponent;
    let fixture: ComponentFixture<TableHeaderComponent>;

    const row = { code: 'Code', description: 'Description' };

    @Component({
        template: `
            <vioc-angular-table-header
                [selection]="selection"
                [actionsTemplate]="tableHeaderActions"
                [selectionActionsTemplate]="tableHeaderSelectionActions"
                [menuItemsTemplate]="tableHeaderMenuItems"
            >
                <ng-template #tableHeaderActions>
                    <button id="action">Action Button</button>
                </ng-template>
                <ng-template #tableHeaderSelectionActions>
                    <button id="selection-action">Selection Action Button</button>
                </ng-template>
                <ng-template #tableHeaderMenuItems>
                    <button id="menu-action" mat-menu-item>Menu Button</button>
                </ng-template>
            </vioc-angular-table-header>
        `,
    })
    class TestTableHeaderComponent {
        selection = new SelectionModel<any>(true, [], true);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CdkTableModule, MatMenuModule, MatIconModule, MatDividerModule],
            declarations: [TableHeaderComponent, TestTableHeaderComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TableHeaderComponent);
        component = fixture.componentInstance;
        component.selection = new SelectionModel<any>(true, [], true);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should apply the selected class when there are selections', () => {
        // select something and the class should be added
        component.selection.select(row);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.selected'))).toBeTruthy();

        // clear the selection and the class should be removed
        component.selection.clear();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.select'))).toBeFalsy();
    });

    it('should render the selection count when there are selections', () => {
        // select something and the header should display the number of items selected
        component.selection.select(row);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.items-selected-text')).nativeElement.innerHTML).toEqual(
            '1 item(s) selected'
        );

        // clear the selection and the count should be removed
        component.selection.clear();
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.items-selected-text'))).toBeNull();
    });

    describe('table header actions', () => {
        let mockTableHeaderComponent: TestTableHeaderComponent;
        let mockTableHeaderFixture: ComponentFixture<TestTableHeaderComponent>;

        beforeEach(() => {
            mockTableHeaderFixture = TestBed.createComponent(TestTableHeaderComponent);
            mockTableHeaderComponent = mockTableHeaderFixture.componentInstance;
        });

        it('should render if there are no selections', () => {
            // with nothing selected the action button should be added
            mockTableHeaderFixture.detectChanges();
            expect(mockTableHeaderFixture.debugElement.query(By.css('#action')).nativeElement.innerHTML).toEqual(
                'Action Button'
            );

            // with something selected the action button should be removed
            mockTableHeaderComponent.selection.select(row);
            mockTableHeaderFixture.detectChanges();
            expect(mockTableHeaderFixture.debugElement.query(By.css('#action'))).toBeNull();
        });

        it('should render if there are selections', () => {
            // with something selected the selection action button should be added
            mockTableHeaderComponent.selection.select(row);
            mockTableHeaderFixture.detectChanges();
            expect(
                mockTableHeaderFixture.debugElement.query(By.css('#selection-action')).nativeElement.innerHTML
            ).toEqual('Selection Action Button');

            // with nothing selected the selection action button should be removed
            mockTableHeaderComponent.selection.clear();
            mockTableHeaderFixture.detectChanges();
            expect(mockTableHeaderFixture.debugElement.query(By.css('#selection-action'))).toBeNull();
        });
    });
});
