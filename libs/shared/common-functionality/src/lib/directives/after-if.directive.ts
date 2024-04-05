import { AfterContentInit, Directive, EventEmitter, Output } from '@angular/core';
@Directive({
    selector: '[viocAngularAfterIf]',
})
/**
 * Fires an event off after an element renders. Useful for situations that require work after an ngIf.
 */
export class AfterIfDirective implements AfterContentInit {
    // Using the selector name as the output to simplify useage to only require one attribute
    @Output() viocAngularAfterIf = new EventEmitter();

    ngAfterContentInit(): void {
        setTimeout(() => {
            // timeout helps prevent unexpected change errors by queueing the task until the UI thread is available
            this.viocAngularAfterIf.emit();
        });
    }
}
