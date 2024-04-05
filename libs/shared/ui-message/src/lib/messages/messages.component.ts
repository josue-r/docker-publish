import { Component, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageListComponent } from '../message/message-list.component';

/**
 * This is a wrapper element for the message list. It contains the logic that controls when the MatSnackBar opens.
 */
@Component({
    selector: 'vioc-angular-messages',
    template: '',
})
export class MessagesComponent implements OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    currentMessageCount = 0;

    constructor(messageFacade: MessageFacade, snackBar: MatSnackBar) {
        messageFacade
            .getMessages()
            .pipe(takeUntil(this._destroyed))
            .subscribe((v) => {
                if (v.length >= 1 && this.currentMessageCount === 0) {
                    snackBar.openFromComponent(MessageListComponent, {
                        panelClass: 'error-snackbar',
                        verticalPosition: 'top',
                    });
                }
                this.currentMessageCount = v.length;
            });
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
