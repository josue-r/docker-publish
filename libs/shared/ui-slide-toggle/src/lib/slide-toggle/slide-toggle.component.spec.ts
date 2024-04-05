import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { By } from '@angular/platform-browser';
import { SlideToggleComponent } from './slide-toggle.component';
describe('SlideToggleComponent', () => {
    let component: SlideToggleComponent;
    let fixture: ComponentFixture<SlideToggleComponent>;

    @Component({
        selector: 'vioc-angular-slide-toggle-test',
        template: `
            <vioc-angular-slide-toggle
                [label]="label"
                [innerLabel]="innerLabel"
                [toggled]="toggled"
                [disabled]="disabled"
            >
            </vioc-angular-slide-toggle>
        `,
    })
    class SlideToggleTestComponent {
        @Input() label: string;
        @Input() innerLabel: string;
        @Input() toggled: boolean;
        @Input() disabled: boolean;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatSlideToggleModule],
            declarations: [SlideToggleComponent, SlideToggleTestComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SlideToggleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('slide toggle button', () => {
        it('should trigger emitEvent on toggle', fakeAsync(() => {
            const componentDebug = fixture.debugElement;
            const slider = componentDebug.query(By.directive(MatSlideToggle));
            jest.spyOn(component, 'emitEvent');
            slider.triggerEventHandler('change', null);
            fixture.detectChanges();
            expect(component.emitEvent).toHaveBeenCalled();
        }));

        describe('inputs', () => {
            let testFixture: ComponentFixture<SlideToggleTestComponent>;
            let testComponent: SlideToggleTestComponent;

            const getSlideToggleComponent = (): SlideToggleComponent => {
                return testFixture.debugElement.query(By.directive(SlideToggleComponent)).componentInstance;
            };

            beforeEach(() => {
                testFixture = TestBed.createComponent(SlideToggleTestComponent);
                testComponent = testFixture.componentInstance;
                testFixture.detectChanges();
            });

            it('should accept the label input', () => {
                expect(component.label).toBeUndefined();
                testComponent.label = 'Label Test';
                testFixture.detectChanges();
                expect(getSlideToggleComponent().label).toEqual('Label Test');
            });

            it('should accept the innerLabel input', () => {
                expect(component.innerLabel).toBeUndefined();
                testComponent.innerLabel = 'Inner Label Test';
                testFixture.detectChanges();
                expect(getSlideToggleComponent().innerLabel).toEqual('Inner Label Test');
            });

            it('should accept the toggled input', () => {
                expect(component.toggled).toBeUndefined();
                testComponent.toggled = true;
                testFixture.detectChanges();
                expect(getSlideToggleComponent().toggled).toEqual(true);
            });

            it('should accept the disabled input', () => {
                expect(component.disabled).toEqual(false);
                testComponent.disabled = true;
                testFixture.detectChanges();
                expect(getSlideToggleComponent().disabled).toEqual(true);
            });
        });
    });
});
