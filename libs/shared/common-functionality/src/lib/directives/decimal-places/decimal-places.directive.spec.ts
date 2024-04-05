import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DecimalPlacesDirective } from './decimal-places.directive';

describe('DecimalPlacesDirective', () => {
    @Component({
        template: '<input viocAngularDecimalPlaces />',
    })
    class DecimalPlacesComponent {
        @ViewChild(DecimalPlacesDirective) directive: DecimalPlacesDirective;
    }

    let fixture: ComponentFixture<DecimalPlacesComponent>;
    let component: DecimalPlacesComponent;
    let input: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DecimalPlacesComponent, DecimalPlacesDirective],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DecimalPlacesComponent);
        component = fixture.componentInstance;
        input = fixture.debugElement.query(By.css('input'));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    const shouldAllow = (key: string, ctrlKey = false) => {
        const event = new KeyboardEvent('keydown', { key, ctrlKey });
        jest.spyOn(event, 'preventDefault');

        input.triggerEventHandler('keydown', event);

        expect(event.preventDefault).not.toHaveBeenCalled();
    };

    const shouldNotAllow = (key: string, ctrlKey = false) => {
        const event = new KeyboardEvent('keydown', { key, ctrlKey });
        jest.spyOn(event, 'preventDefault');

        input.triggerEventHandler('keydown', event);

        expect(event.preventDefault).toHaveBeenCalled();
    };

    describe('with empty value', () => {
        beforeEach(() => {
            input.nativeElement.value = '';
        });

        it.each`
            value           | ctrlKey
            ${'1'}          | ${false}
            ${'.'}          | ${false}
            ${'Backspace'}  | ${false}
            ${'Tab'}        | ${false}
            ${'End'}        | ${false}
            ${'Home'}       | ${false}
            ${'ArrowLeft'}  | ${false}
            ${'ArrowRight'} | ${false}
            ${'ArrowUp'}    | ${false}
            ${'ArrowDown'}  | ${false}
            ${'Delete'}     | ${false}
            ${'a'}          | ${true}
            ${'c'}          | ${true}
            ${'v'}          | ${true}
            ${'x'}          | ${true}
        `('should allow allowed input value=$value ctrlKey=$ctrlKey', ({ value, ctrlKey }) => {
            shouldAllow(value, ctrlKey);
        });

        it('should not allow alpha characters', () => {
            shouldNotAllow('a');
        });
    });

    it('should support different decimalPlaces', () => {
        component.directive.decimalPlaces = 1;
        component.directive.ngOnInit();
        input.nativeElement.value = '11.1';
        input.nativeElement.selectionStart = 4;
        input.nativeElement.selectionEnd = 5;
        shouldNotAllow('1');
    });

    describe('with two decimals', () => {
        beforeEach(() => {
            input.nativeElement.value = '11.11';
        });

        it('should not allow adding additional decimal', () => {
            shouldNotAllow('.');
        });

        it('should allow appending before decimal', () => {
            input.nativeElement.selectionStart = 0;
            input.nativeElement.selectionEnd = 0;
            shouldAllow('1');
        });

        it('should allow replacing one of the decimals', () => {
            input.nativeElement.selectionStart = 4;
            input.nativeElement.selectionEnd = 5;
            shouldAllow('1');
        });

        it('should allow replacing before the decimals', () => {
            input.nativeElement.selectionStart = 0;
            input.nativeElement.selectionEnd = 2;
            shouldAllow('1');
        });
    });

    it('should pad inital value with 0s', () => {
        input.nativeElement.value = 1;

        component.directive.ngOnInit();

        expect(input.nativeElement.value).toEqual('1.00');
    });

    it('should not pad initial if it is empty', () => {
        input.nativeElement.value = '';

        component.directive.ngOnInit();

        expect(input.nativeElement.value).toEqual('');
    });

    it.each`
        event       | value     | expected
        ${'change'} | ${1.23}   | ${1.23}
        ${'input'}  | ${1.23}   | ${1.23}
        ${'change'} | ${'1.23'} | ${1.23}
        ${'input'}  | ${'1.23'} | ${1.23}
        ${'change'} | ${''}     | ${null}
        ${'input'}  | ${''}     | ${null}
        ${'change'} | ${-1.23}  | ${-1.23}
        ${'input'}  | ${-1.23}  | ${-1.23}
    `(
        'should call the registered change function when $event occurs value=$value expected=$expected',
        ({ event, value, expected }) => {
            const onChange = jest.fn();
            component.directive.registerOnChange(onChange);

            input.triggerEventHandler(event, { target: { value } });

            expect(onChange).toHaveBeenCalledWith(expected);
        }
    );

    it('should call the registered touch function when blur occurs', () => {
        const onTouch = jest.fn();
        component.directive.registerOnTouched(onTouch);

        input.triggerEventHandler('blur', {});

        expect(onTouch).toHaveBeenCalled();
    });

    it.each`
        initial  | value
        ${true}  | ${false}
        ${true}  | ${true}
        ${false} | ${true}
        ${false} | ${false}
    `(
        'should update input disabled attribute on setDisabledState initial=$initial value=$value',
        ({ initial, value }) => {
            input.nativeElement.disabled = initial;

            component.directive.setDisabledState(value);

            expect(input.nativeElement.disabled).toEqual(value);
        }
    );

    it.each`
        initial | value    | expected
        ${1.23} | ${4.56}  | ${'4.56'}
        ${1.23} | ${1}     | ${'1.00'}
        ${1.23} | ${null}  | ${''}
        ${1.23} | ${0.12}  | ${'0.12'}
        ${1.23} | ${-4.56} | ${'-4.56'}
    `(
        'should update element value on writeValue initial=$initial value=$value expected=$expected',
        ({ initial, value, expected }) => {
            input.nativeElement.value = initial;

            component.directive.writeValue(value);

            expect(input.nativeElement.value).toEqual(expected);
        }
    );
});
