import { fakeAsync, flush, inject } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { MessageFacade } from './message.facade';
import { MessageState } from './message.state';
import { UserMessage } from './models/user-message';

describe('MessageFacade', () => {
    let messageFacade: MessageFacade;
    let state: MessageState;

    beforeEach(() => {
        state = new MessageState();
        messageFacade = new MessageFacade(state);
    });

    it('should be created', inject([MessageFacade], (service: MessageFacade) => {
        expect(service).toBeTruthy();
    }));

    it('add , remove and get message successfully', fakeAsync(() => {
        const userMessage1: UserMessage = { message: `Test Message1`, severity: 'info' };
        const userMessage2: UserMessage = { message: `Test Message2`, severity: 'warn' };

        messageFacade.addMessage(userMessage1);
        messageFacade.addMessage(userMessage2);

        // initially should conatin both messages
        messageFacade
            .getMessages() //
            .pipe(take(1)) // Important to have.  If you don't have this, the expectation will happen again after the remove
            .subscribe((value) => {
                expect(value.map((v) => v.message)).toEqual([`Test Message1`, `Test Message2`]);
            });
        flush();

        // Remove message2, should contain message1
        messageFacade.removeMessage(userMessage2);
        messageFacade
            .getMessages() //
            .pipe(take(1)) //
            .subscribe((value) => expect(value).toEqual([userMessage1]));
        flush();
    }));

    describe('clear', () => {
        const infoMessage: UserMessage = { message: 'info', severity: 'info' };
        const successMessage: UserMessage = { message: 'success', severity: 'success' };
        const warnMessage: UserMessage = { message: 'warn', severity: 'warn' };
        const errorMessage: UserMessage = { message: 'error', severity: 'error' };

        it('should clear all messages if no severities are passed', () => {
            state.messages.next([infoMessage, successMessage, warnMessage, errorMessage]);

            messageFacade.clear();

            expect(state.messages.value).toEqual([]);
        });

        it('should clear only messages with passed severities', () => {
            state.messages.next([infoMessage, successMessage, warnMessage, errorMessage]);

            messageFacade.clear('info', 'success', 'error');

            expect(state.messages.value).toEqual([warnMessage]);
        });
    });
});
