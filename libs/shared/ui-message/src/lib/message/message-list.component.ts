import { Component, OnDestroy } from '@angular/core';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import {
    flipMinimizeButton,
    itemAddition,
    itemRemoval,
    minimizeContent,
} from '@vioc-angular/shared/common-functionality';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MessageFacade, UserMessage } from '@vioc-angular/shared/data-access-message';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * This component becomes the content of the MatSnackBar. It controls how the messages get displayed as a list.
 */
@Component({
    selector: 'vioc-angular-message-list',
    templateUrl: './message-list.component.html',
    styleUrls: ['./message-list.component.scss'],
    animations: [minimizeContent, flipMinimizeButton, itemRemoval, itemAddition],
})
export class MessageListComponent implements OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    minimizedState = 'maximized';

    messages: Observable<UserMessage[]>;

    constructor(
        private readonly snackBarRef: MatSnackBarRef<MessageListComponent>,
        private readonly messageFacade: MessageFacade
    ) {
        this.messages = this.messageFacade.getMessages();
        this.messages.pipe(takeUntil(this._destroyed)).subscribe((messages) => {
            if (messages.length < 1) {
                // Close the snackbar if there's no messages
                this.snackBarRef.dismiss();
            } else {
                // Expand the message list
                this.minimizedState = 'maximized';
            }
            // Set up timers to automatically dismiss 'info' and 'success' messages
            for (const message of messages) {
                if (message.severity === 'info' || message.severity === 'success') {
                    this.configureTimeout(message, 5000);
                } else if (message.hasTimeout) {
                    this.configureTimeout(message, 10000);
                }
            }
        });
    }

    configureTimeout(message: UserMessage, timeout: number): void {
        setTimeout(() => this.removeMessage(message), timeout);
    }

    dismiss(message: UserMessage) {
        this.removeMessage(message);
    }

    removeMessage(message: UserMessage) {
        this.messageFacade.removeMessage(message);
    }

    toggleMinimized() {
        this.minimizedState = this.minimizedState === 'maximized' ? 'minimized' : 'maximized';
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
