import { Component, DebugElement, EventEmitter, Renderer2, Type, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DisableButtonClickDirective } from './disable-button-click.directive';

describe('DisableButtonClickDirective', () => {
    @Component({
        template:
            '<button mat-raised-button id="test-disabled" disableButtonClick [reenableButton]="reenableButton" (disableClick)="test()">TEST</button>',
    })
    class DisableButtonClickComponent {
        @ViewChild(DisableButtonClickDirective) directive: DisableButtonClickDirective;

        reenableButton = new EventEmitter<boolean>(false);

        test(): void {
            this.reenableButton.emit(false);
        }
    }

    let fixture: ComponentFixture<DisableButtonClickComponent>;
    let component: DisableButtonClickComponent;
    let renderer: Renderer2;
    let disabledButton: DebugElement;
    const firstCall = 1; // call to render button

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DisableButtonClickComponent, DisableButtonClickDirective],
            providers: [Renderer2, EventEmitter],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DisableButtonClickComponent);
        component = fixture.componentInstance;
        renderer = fixture.componentRef.injector.get<Renderer2>(Renderer2 as Type<Renderer2>);
        disabledButton = fixture.debugElement.query(By.css('#test-disabled'));
        jest.spyOn(renderer, 'setProperty');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should preventDefault', fakeAsync(() => {
        const click = disabledButton.nativeElement.click();
        const event = new Event('click', click);
        jest.spyOn(event, 'preventDefault');
        component.directive.ngOnInit();
        disabledButton.triggerEventHandler('click', event);
        tick(600); // accounts for debounceTime and timeout to re-enable button
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
    }));

    it('should disable the button on click, then re-enable it', fakeAsync(() => {
        const click = disabledButton.nativeElement.click();
        const clickEvent = new Event('click', click);
        jest.spyOn(component, 'test');
        component.directive.ngOnInit();
        // click event
        disabledButton.triggerEventHandler('click', clickEvent);
        tick(600); // accounts for debounceTime and timeout to re-enable button
        fixture.detectChanges();
        expect(component.test).toHaveBeenCalled();
        // first call is to disable the button
        expect(renderer.setProperty).toHaveBeenNthCalledWith(firstCall, disabledButton.nativeElement, 'disabled', true);
        // last call is to re-enable the button
        expect(renderer.setProperty).toHaveBeenLastCalledWith(disabledButton.nativeElement, 'disabled', false);
        expect(disabledButton.nativeElement.disabled).toBeFalsy();
    }));
});
