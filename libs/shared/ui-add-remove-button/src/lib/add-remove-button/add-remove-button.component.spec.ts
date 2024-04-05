import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { AddRemoveButtonComponent } from './add-remove-button.component';

describe('AddRemoveButtonComponent', () => {
    let component: AddRemoveButtonComponent;
    let fixture: ComponentFixture<AddRemoveButtonComponent>;
    let debugElement: DebugElement;

    const getAddButton = () => debugElement.query(By.css('.add-button'));
    const getRemoveButton = () => debugElement.query(By.css('.remove-button'));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatIconModule],
            declarations: [AddRemoveButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AddRemoveButtonComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be able to show add button', () => {
        component.addButtonDisplayed = true;
        fixture.detectChanges();
        expect(getAddButton().classes.hidden).toBeFalsy();
    });

    it('should be able to hide add button', () => {
        component.addButtonDisplayed = false;
        fixture.detectChanges();
        expect(getAddButton().classes.hidden).toEqual(true);
    });

    it('should hide add button if no input is provided', () => {
        expect(component.addButtonDisplayed).toBeUndefined();
        expect(getAddButton().classes.hidden).toEqual(true);
    });

    it('should be able to show remove button', () => {
        component.removeButtonDisplayed = true;
        fixture.detectChanges();
        expect(getRemoveButton().classes.hidden).toBeFalsy();
    });

    it('should be able to hide remove button', () => {
        component.removeButtonDisplayed = false;
        fixture.detectChanges();
        expect(getRemoveButton().classes.hidden).toEqual(true);
    });

    it('should hide remove button if no input is provided', () => {
        expect(component.removeButtonDisplayed).toBeUndefined();
        expect(getRemoveButton().classes.hidden).toEqual(true);
    });

    it('should be able to disable the add button', () => {
        component.addButtonDisplayed = true;
        component.addButtonDisabled = true;
        fixture.detectChanges();
        expect(getAddButton().nativeElement.disabled).toEqual(true);
    });

    it('should not disable the add button by default', () => {
        component.addButtonDisplayed = true;
        fixture.detectChanges();
        expect(getAddButton().nativeElement.disabled).toEqual(false);
    });

    describe('when add button is showing', () => {
        beforeEach(() => {
            component.addButtonDisplayed = true;
            fixture.detectChanges();
        });

        it('should be able to add item', () => {
            jest.spyOn(component.addItem, 'emit');
            const addButton = getAddButton().nativeElement;
            addButton.click();
            expect(component.addItem.emit).toHaveBeenCalled();
        });
    });

    describe('when remove button is showing', () => {
        beforeEach(() => {
            component.removeButtonDisplayed = true;
            fixture.detectChanges();
        });

        it('should be able to remove item', () => {
            jest.spyOn(component.removeItem, 'emit');
            const removeButton = getRemoveButton().nativeElement;
            removeButton.click();
            expect(component.removeItem.emit).toHaveBeenCalled();
        });
    });

    it('should generate unique ids', () => {
        // expect componentId to have been incremented from 0 after creating the component
        expect(AddRemoveButtonComponent.componentId).toBeGreaterThan(0);
        const currentComponentId = AddRemoveButtonComponent.componentId - 1;
        expect(component.id).toEqual(`add-remove-button-${currentComponentId}`);
        expect(fixture.debugElement.query(By.css(`#add-button-${currentComponentId}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#remove-button-${currentComponentId}`))).not.toBeNull();
    });
});
