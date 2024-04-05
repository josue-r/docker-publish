import { fakeAsync, flush } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MessageFacade, UserMessage } from '@vioc-angular/shared/data-access-message';
import { BehaviorSubject } from 'rxjs';
import { MessagesComponent } from './messages.component';

describe('MessagesComponent', () => {
    let component: MessagesComponent;
    let mockMessages: BehaviorSubject<UserMessage[]>;
    const messageFacade = ({ getMessages: () => mockMessages } as unknown) as MessageFacade;
    const snackBar = ({ openFromComponent: jest.fn() } as unknown) as MatSnackBar;

    beforeEach(() => {
        mockMessages = new BehaviorSubject<UserMessage[]>([]);
        component = new MessagesComponent(messageFacade, snackBar);
        jest.clearAllMocks();
    });

    it('should create', () => expect(component).toBeTruthy());

    describe.each`
        currentMessageCount | messages                                   | snackBarShouldOpen
        ${0}                | ${[{ message: 'test', severity: 'info' }]} | ${true}
        ${2}                | ${[{ message: 'test', severity: 'info' }]} | ${false}
        ${0}                | ${[]}                                      | ${false}
        ${2}                | ${[]}                                      | ${false}
    `('conditionally opens a snackBar', ({ currentMessageCount, messages, snackBarShouldOpen }) => {
        it(`currentMessageCount=${currentMessageCount}, messages=${messages}, snackBarShouldOpen=${snackBarShouldOpen}`, fakeAsync(() => {
            component.currentMessageCount = currentMessageCount;
            mockMessages.next(messages);
            flush();
            if (snackBarShouldOpen) {
                expect(snackBar.openFromComponent).toHaveBeenCalled();
            } else {
                expect(snackBar.openFromComponent).not.toHaveBeenCalled();
            }
        }));
    });
});
