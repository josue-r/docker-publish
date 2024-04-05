import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ViewContainerRef } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MessageFacade, Severity, UserMessage } from '@vioc-angular/shared/data-access-message';
import { BehaviorSubject } from 'rxjs';
import { MessageListComponent } from './message-list.component';

@Component({
    selector: 'vioc-angular-view-container-component',
    template: ``,
})
class ViewContainerComponent {
    constructor(public viewContainerRef: ViewContainerRef) {}
}

describe('MessageListComponent', () => {
    let snackBar: MatSnackBar;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let viewContainerFixture: ComponentFixture<ViewContainerComponent>;
    let messageFacade: MessageFacade;
    let messages: BehaviorSubject<UserMessage[]>;
    const testMessage = 'Test Message';

    messages = new BehaviorSubject<UserMessage[]>([]);
    const viocUiServiceStub = {
        getMessages: () => messages,
        removeMessage: () => {},
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatIconModule, NoopAnimationsModule, MatSnackBarModule],
            declarations: [MessageListComponent, ViewContainerComponent],
            providers: [
                {
                    provide: MessageFacade,
                    useValue: viocUiServiceStub,
                },
            ],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: { bootstrap: [ViewContainerComponent, MessageListComponent] },
            })
            .compileComponents();
    });

    beforeEach(() => {
        inject([OverlayContainer, MatSnackBar], (oc: OverlayContainer, sb: MatSnackBar) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
            snackBar = sb;
        })();
        messages = new BehaviorSubject<UserMessage[]>([]);
        viewContainerFixture = TestBed.createComponent(ViewContainerComponent);
        messageFacade = TestBed.inject(MessageFacade);
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should create', () => {
        const messageSnackBar = snackBar.openFromComponent(MessageListComponent);
        expect(messageSnackBar.instance instanceof MessageListComponent).toEqual(true);
    });

    it('should display message', () => {
        snackBar.openFromComponent(MessageListComponent);
        viewContainerFixture.detectChanges();
        messages.next([{ message: testMessage, severity: 'error' }]);
        viewContainerFixture.detectChanges();
        const message: HTMLElement = overlayContainerElement.querySelector('.snackbar-message > p');
        expect(message.innerHTML.trim()).toEqual(testMessage);
    });

    it('should remove snackbar on last message dismissal', fakeAsync(() => {
        const messageSnackBar = snackBar.openFromComponent(MessageListComponent);
        jest.spyOn(messageSnackBar, 'dismiss');
        viewContainerFixture.detectChanges();
        messages.next([{ message: testMessage, severity: 'error' }]);
        viewContainerFixture.detectChanges();
        messages.next([]);
        viewContainerFixture.detectChanges();
        flush();
        expect(messageSnackBar.dismiss).toHaveBeenCalled();
    }));

    it('should keep remaining messages if one is dismissed', fakeAsync(() => {
        snackBar.openFromComponent(MessageListComponent);
        viewContainerFixture.detectChanges();
        messages.next([
            { message: testMessage, severity: 'error' },
            { message: 'Test Message 2', severity: 'error' },
        ]);
        viewContainerFixture.detectChanges();
        const snackbarMessages = overlayContainerElement.querySelectorAll('.snackbar-message');
        expect(snackbarMessages.length).toEqual(2);
        messages.next([{ message: testMessage, severity: 'error' }]);
        viewContainerFixture.detectChanges();
        flush();
        snackBar.openFromComponent(MessageListComponent);
        viewContainerFixture.detectChanges();
        flush();
        const newSnackbarMessages = overlayContainerElement.querySelectorAll('.snackbar-message');
        expect(newSnackbarMessages.length).toEqual(1);
    }));

    describe.each`
        severity     | shouldClose | hasTimeout | timeout  | useCase
        ${'success'} | ${true}     | ${false}   | ${5000}  | ${'should use the default timeout time for success messages'}
        ${'success'} | ${true}     | ${true}    | ${5000}  | ${'should still use the default timeout time for success messages with hasTimeout override'}
        ${'info'}    | ${true}     | ${false}   | ${5000}  | ${'should use the default timeout time for info messages'}
        ${'info'}    | ${true}     | ${true}    | ${5000}  | ${'should still use the default timeout time for success messages with hasTimeout override'}
        ${'warn'}    | ${false}    | ${false}   | ${0}     | ${'should not automatically close without override'}
        ${'warn'}    | ${true}     | ${true}    | ${10000} | ${'should automatically close with override'}
        ${'error'}   | ${false}    | ${false}   | ${0}     | ${'should not automatically close without override'}
        ${'error'}   | ${true}     | ${true}    | ${10000} | ${'should automatically close with override'}
    `('$severity message', ({ severity, shouldClose, hasTimeout, timeout }) => {
        it(`should ${
            shouldClose ? '' : 'not '
        }automatically close ${severity} messages after ${timeout} miliseconds`, fakeAsync(() => {
            testAutoClose(severity, shouldClose, hasTimeout, timeout);
        }));
    });

    function testAutoClose(messageType: Severity, shouldClose: boolean, hasTimeout: boolean, timeout: number) {
        snackBar.openFromComponent(MessageListComponent);
        const timeoutSpy = jest.spyOn(MessageListComponent.prototype, 'configureTimeout');
        jest.spyOn(messageFacade, 'removeMessage');
        viewContainerFixture.detectChanges();
        messages.next([{ message: testMessage, severity: messageType, hasTimeout }]);
        viewContainerFixture.detectChanges();
        flush();
        const userMessage = {
            message: testMessage,
            severity: messageType,
            hasTimeout,
        };
        if (shouldClose) {
            expect(timeoutSpy).toHaveBeenCalledWith(userMessage, timeout);
            expect(messageFacade.removeMessage).toHaveBeenCalledWith(userMessage);
        } else {
            expect(timeoutSpy).not.toHaveBeenCalledWith(userMessage, timeout);
            expect(messageFacade.removeMessage).not.toHaveBeenCalledWith(userMessage);
        }
    }
});
