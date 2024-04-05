import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AfterIfDirective } from './after-if.directive';

describe('AfterIfDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AfterIfDirective, TestHostComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
    });

    it('should create an instance', () => {
        const directive = new AfterIfDirective();
        expect(directive).toBeTruthy();
    });

    it('it does stuff after rendered', fakeAsync(() => {
        const spy = jest.spyOn(fixture.componentInstance, 'doStuff');
        fixture.detectChanges();
        flush();
        expect(spy).toHaveBeenCalled();
    }));

    @Component({
        // tslint:disable-next-line: component-selector
        selector: `host-component`,
        template: ` <div (viocAngularAfterIf)="doStuff()"></div> `,
    })
    /** A wrapper component to enable easy input testing of the HeaderComponent */
    class TestHostComponent {
        doStuff() {}
    }
});
