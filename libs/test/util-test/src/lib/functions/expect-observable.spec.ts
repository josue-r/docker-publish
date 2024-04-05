import { fakeAsync, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { expectObservable } from './expect-observable';

describe('expectObservable', () => {
    describe('in a fakeAsync zone', () => {
        it('should verify the observable value', fakeAsync(() => {
            expectObservable(of('foo')).toEqual('foo');
        }));
    });
    describe('in a async zone', () => {
        it(
            'should verify the observable value',
            waitForAsync(() => {
                expect(() => expectObservable(of('foo'))).toThrowError();
            })
        );
    });
    describe('not in a async or fakeAsync zone', () => {
        it('should verify the observable value', () => {
            expect(() => expectObservable(of('foo'))).toThrowError();
        });
    });
});
