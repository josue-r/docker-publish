import { Component, OnDestroy, ViewChild } from '@angular/core';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const LOGGER = Loggers.get('ui-logout-when-idle', 'LogoutWhenIdleComponent');

/**
 * If the user is idle for `idleSecondsBeforeWarning` seconds, a warning is shown that the user will be logged out due to inactivity.
 *
 * If no further action is taken, the use is logged out.
 *
 * @export
 * @class LogoutWhenIdleComponent
 * @implements {OnDestroy}
 */
@Component({
    selector: 'vioc-angular-logout-when-idle',
    templateUrl: './logout-when-idle.component.html',
})
export class LogoutWhenIdleComponent implements OnDestroy {
    /** The number of seconds before a prompt is displayed asking if you want to remain logged in */
    private readonly idleSecondsBeforeWarning = 60 * 29; // 30 minutes total timeout
    /**  After the warning shows up, the number of seconds to wait before logging out. */
    private readonly countdownSeconds = 60;
    protected readonly _destroyed = new ReplaySubject(1);

    @ViewChild(DialogComponent, { static: true }) private readonly dialog: DialogComponent;

    expiresIn: number;

    constructor(idle: Idle, authenticationFacade: AuthenticationFacade) {
        // Show the prompt after this many seconds
        idle.setIdle(this.idleSecondsBeforeWarning);
        // After becoming idle, mark as timed out after this many seconds.
        idle.setTimeout(this.countdownSeconds);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        idle.onTimeoutWarning //
            .pipe(takeUntil(this._destroyed))
            .subscribe((countdown) => {
                this.expiresIn = countdown;
                LOGGER.debug(`You will be logged out in ${countdown} seconds!`);
            });

        idle.onTimeout //
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => {
                LOGGER.debug('You are being logged out!');
                this.dialog.close();
                authenticationFacade.logout();
            });

        idle.onIdleEnd //
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => {
                LOGGER.debug('No longer idle!');
                this.dialog.close();
                this.expiresIn = this.countdownSeconds;
            });

        this.expiresIn = this.countdownSeconds;
        idle.onIdleStart //
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => {
                LOGGER.debug('You are idle!');
                this.dialog.open();
            });

        LOGGER.debug('Starting idle watch');
        idle.watch();
    }

    ngOnDestroy() {
        this._destroyed.next();
    }
}
