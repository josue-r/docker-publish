import { animate, animateChild, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';

/**
 * An animation to have a newly rendered sidebar item expand. This assumes overflow will be visible after the animation
 * completes. The initial width should match the sass var "$side-nav-width", but unfortunately we can't access sass vars
 * in type script at the moment. So, 105px is being hardcoded.
 */
export const expandSideBarItem: AnimationTriggerMetadata = trigger('expandSideBarItem', [
    transition(':enter', [
        style({
            width: '105px',
            overflow: 'hidden',
        }),
        animate(
            '100ms ease-in',
            style({
                width: '*',
            })
        ),
        animateChild(),
    ]),
]);
