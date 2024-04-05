import {
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Fix found from blog: https://stackoverflow.com/questions/50798383/button-directive-to-bind-disable-attribute-via-input-in-angular
 * and blog: https://codereview.stackexchange.com/questions/200757/angular-directive-to-disable-a-button-when-clicked-allowing-re-enabling-as-need
 * with some slight modifications for our use.
 *
 * This directive provides support for buttons to limit the number of clicks that are
 * allowed. This directive should be applied directly to a button.
 * The HostListener intercepts keyboard events and prevents a button from registering a click more than once,
 * so even if a user clicks two, three, four, etc. times the button only does the intended action once.
 * By default the button will be disbaled upon click and re-enabled after 500 milliseconds.
 *
 */
@Directive({
    selector: '[disableButtonClick]',
})
export class DisableButtonClickDirective implements OnInit, OnDestroy {
    @Input('debounceTime') debounceTime = 100; // time in milliseconds

    @Input('reenableButton') reenableButton: EventEmitter<boolean>;

    @Output() disableClick = new EventEmitter();

    private clicks = new Subject();

    private clickSubscription: Subscription;

    constructor(private renderer: Renderer2, private element: ElementRef) {}

    ngOnInit() {
        this.clickSubscription = this.clicks.pipe(debounceTime(this.debounceTime)).subscribe((e) => {
            this.disableClick.emit(e);
            setTimeout(() => {
                // re-enable button afetr 500 milliseconds
                this.renderer.setProperty(this.element.nativeElement, 'disabled', false);
            }, 500);
        });
    }

    ngOnDestroy() {
        this.clickSubscription.unsubscribe();
    }

    @HostListener('click', ['$event']) clickEvent(event) {
        // set to true to disable button after click
        this.renderer.setProperty(this.element.nativeElement, 'disabled', true);
        event.preventDefault();
        this.clicks.next(event);
    }
}
