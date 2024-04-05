import { AnimationTriggerMetadata, animate, style, transition, trigger } from '@angular/animations';

// Minimize and fade away the removed item
export const itemRemoval: AnimationTriggerMetadata = trigger('itemRemoval', [
    transition(':leave', [
        style({
            height: '*',
            'padding-top': '*',
            'padding-bottom': '*',
            opacity: '*',
        }),
        animate(
            '100ms ease-out',
            style({
                height: '0',
                'padding-top': '0',
                'padding-bottom': '0',
                opacity: '0',
            })
        ),
    ]),
]);

// Grow and fade in the new item
export const itemAddition: AnimationTriggerMetadata = trigger('itemAddition', [
    transition(':enter', [
        style({
            height: '0',
            'padding-top': '0',
            'padding-bottom': '0',
            opacity: '0',
        }),
        animate(
            '100ms ease-out',
            style({
                height: '*',
                'padding-top': '*',
                'padding-bottom': '*',
                opacity: '*',
            })
        ),
    ]),
]);
