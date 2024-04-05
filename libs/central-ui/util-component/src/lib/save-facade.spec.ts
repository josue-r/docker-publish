import { fakeAsync, flush } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { Described } from '@vioc-angular/shared/common-functionality';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, Subject } from 'rxjs';
import { SaveFacade } from './save-facade';

describe('SaveFacade', () => {
    let routerService: RouterService;
    let messageFacade: MessageFacade;
    let saver: { save: () => Observable<any> };
    let saveFacade: SaveFacade<any>;
    let loader: { setLoading: (value: boolean) => void };
    const fb = new FormBuilder();
    const mockRoute = ({
        parent: jest.fn(),
    } as unknown) as ActivatedRoute;
    const model: Described = { id: 1, code: 'old', description: null, other: 'foo' } as Described;
    const form = new TypedFormGroup<Described>(fb.group({ id: 1, code: 'new', description: 'desc' }));

    beforeEach(() => {
        routerService = { navigateToSearchPage: () => undefined } as any;
        jest.spyOn(routerService, 'navigateToSearchPage');
        messageFacade = { addMessage: () => undefined } as any;
        jest.spyOn(messageFacade, 'addMessage');
        saver = { save: () => of({}) };
        jest.spyOn(saver, 'save');
        loader = { setLoading: (value: boolean) => {} };
        saveFacade = new SaveFacade(routerService, messageFacade, saver.save, () => 'Saved!', loader.setLoading);
        form.markAsDirty();
    });

    it('should create an instance', () => {
        expect(
            new SaveFacade(routerService, messageFacade, saver.save, () => 'Saved!', loader.setLoading)
        ).toBeTruthy();
    });

    describe('save', () => {
        it('should save, add a message, reset the form and navigate to previous screen', async () => {
            await saveFacade.save(form, model, mockRoute).toPromise();

            expect(saver.save).toHaveBeenCalledWith({ id: 1, code: 'new', description: 'desc', other: 'foo' });
            expect(routerService.navigateToSearchPage).toHaveBeenCalled();
            expect(messageFacade.addMessage).toHaveBeenCalledWith({ message: 'Saved!', severity: 'info' });
        });

        it('should allow overriding the default navigation after save', async () => {
            const mockFunction = jest.fn();
            await saveFacade.save(form, model, mockRoute, mockFunction).toPromise();

            expect(mockFunction).toHaveBeenCalled();
        });

        it('should modify loading', fakeAsync(() => {
            const saveSubject = new Subject();
            saver.save = () => saveSubject;
            const loadingSpy = jest.spyOn(loader, 'setLoading');
            saveFacade = new SaveFacade(routerService, messageFacade, saver.save, () => 'Saved!', loader.setLoading);

            saveFacade.save(form, model, mockRoute).subscribe(() => {
                expect(loadingSpy).toHaveBeenCalledWith(false);
            });

            expect(loadingSpy).toHaveBeenCalledWith(true);
            loadingSpy.mockClear();

            saveSubject.next(null);
            flush();
        }));

        it('should modify loading if error', fakeAsync(() => {
            const saveSubject = new Subject();
            saver.save = () => saveSubject;
            const loadingSpy = jest.spyOn(loader, 'setLoading');
            saveFacade = new SaveFacade(routerService, messageFacade, saver.save, () => 'Saved!', loader.setLoading);

            saveFacade.save(form, model, mockRoute).subscribe(() => {
                expect(loadingSpy).toHaveBeenCalledWith(false);
            });

            expect(loadingSpy).toHaveBeenCalledWith(true);
            loadingSpy.mockClear();

            saveSubject.error('An error occurred');
            expect(() => flush()).toThrow();
        }));
    });

    describe('apply', () => {
        it('should save, add a message and reload the component', async () => {
            const reloader = { reload: () => {} };
            jest.spyOn(reloader, 'reload');

            await saveFacade.apply(form, model, reloader.reload).toPromise();

            expect(saver.save).toHaveBeenCalledWith({ id: 1, code: 'new', description: 'desc', other: 'foo' });
            expect(routerService.navigateToSearchPage).not.toHaveBeenCalled(); // no routing
            expect(messageFacade.addMessage).toHaveBeenCalledWith({ message: 'Saved!', severity: 'info' });
            expect(reloader.reload).toHaveBeenCalled();
        });

        it('should mark the form as pristine', async () => {
            expect(form.dirty).toBeTruthy();
            const reloader = { reload: () => {} };
            jest.spyOn(reloader, 'reload');

            await saveFacade.apply(form, model, reloader.reload).toPromise();

            expect(form.dirty).toBeFalsy();
        });

        it('should modify loading', fakeAsync(() => {
            const applySubject = new Subject();
            saver.save = () => applySubject;
            const loadingSpy = jest.spyOn(loader, 'setLoading');
            saveFacade = new SaveFacade(routerService, messageFacade, saver.save, () => 'Saved!', loader.setLoading);

            saveFacade
                .apply(form, model, () => {})
                .subscribe(() => {
                    expect(loadingSpy).toHaveBeenCalledWith(false);
                });

            expect(loadingSpy).toHaveBeenCalledWith(true);
            loadingSpy.mockClear();

            applySubject.next(null);
            flush();
        }));

        it('should modify loading if error', fakeAsync(() => {
            const applySubject = new Subject();
            saver.save = () => applySubject;
            const loadingSpy = jest.spyOn(loader, 'setLoading');
            saveFacade = new SaveFacade(routerService, messageFacade, saver.save, () => 'Saved!', loader.setLoading);

            saveFacade
                .apply(form, model, () => {})
                .subscribe(() => {
                    expect(loadingSpy).toHaveBeenCalledWith(false);
                });

            expect(loadingSpy).toHaveBeenCalledWith(true);
            loadingSpy.mockClear();

            applySubject.error('An error occurred');
            expect(() => flush()).toThrow();
        }));
    });
});
