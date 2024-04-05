import { Component, Input } from '@angular/core';

@Component({
    selector: 'vioc-angular-stepper-navigation',
    template: ` <ng-content></ng-content> `,
})
export class MockStepperNavigationComponent {
    @Input() stepper: any;
}
