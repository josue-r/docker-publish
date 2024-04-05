import { AnimationTriggerMetadata, animate, state, style, transition, trigger } from '@angular/animations';

export const minimizeContent: AnimationTriggerMetadata = trigger('minimizeContent', [
    state(
        'maximized',
        style({
            height: '*',
            'padding-top': '*',
            'padding-bottom': '*',
        })
    ),
    state(
        'minimized',
        style({
            height: '0',
            'padding-top': '0',
            'padding-bottom': '0',
            overflow: 'hidden',
        })
    ),
    transition('maximized <=> minimized', animate('150ms ease-in-out')),
]);

export const flipMinimizeButton: AnimationTriggerMetadata = trigger('flipMinimizeButton', [
    state(
        'maximized',
        style({
            transform: 'rotateX(180deg)',
        })
    ),
    state(
        'minimized',
        style({
            transform: 'rotateX(0)',
        })
    ),
    transition('maximized <=> minimized', animate('150ms ease-in-out')),
]);
