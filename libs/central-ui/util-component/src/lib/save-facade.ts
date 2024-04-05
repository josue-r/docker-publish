import { ActivatedRoute } from '@angular/router';
import { RouterService } from '@vioc-angular/central-ui/util-router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export class SaveFacade<T> {
    /**
     *Creates an instance of SaveFacade.
     * @param {RouterService} routerService
     * @param {MessageFacade} messageFacade
     * @param {(model: T) => Observable<any>} saveOperation The function that does the save.  In general for entity `Foo`, this will be `model => fooFacade.update(model)`.
     * @param {(model: T) => string} modelToMessage Converts the updated model to a message that is sent to the `MessageFacade`.
     * @param {(isLoading: boolean) => string} modifyLoading Used to set a loading variable in the component to display a loading overlay
     * @param {*} [buildRequestObject=(form: TypedFormGroup<T>, model: T) =>
     *             Object.assign({ ...model }, form.value)] How the form is mapped to the request object is built.  Usually the default is good enough.
     * @memberof SaveFacade
     */
    constructor(
        private readonly routerService: RouterService,
        private readonly messageFacade: MessageFacade,
        private readonly saveOperation: (model: T) => Observable<any>,
        private readonly modelToMessage: (model: T) => string,
        private readonly modifyLoading: (isLoading: boolean) => void,
        private readonly buildRequestObject = (form: TypedFormGroup<T>, model: T) =>
            Object.assign({ ...model }, form.value)
    ) {}

    /**
     * Copies the form to the model, executes a save and calls the navigation function if successful. Default navigation
     * will return to the previous screen.
     */
    save(
        form: TypedFormGroup<T>,
        model: T,
        route: ActivatedRoute,
        navigate = () => this.routerService.navigateToSearchPage(route)
    ): Observable<any> {
        return this.saveAndAddMessage(form, model) //
            .pipe(
                tap(() => form.markAsPristine()),
                tap(() => navigate())
            );
    }

    /**
     * Copies the form to the model, executes a save and reloads the screen if successful.
     */
    apply(form: TypedFormGroup<T>, model: T, reloadComponent: () => void): Observable<any> {
        return this.saveAndAddMessage(form, model) //
            .pipe(
                tap(() => form.markAsPristine()), // reload could potentially navigate so mark form as pristine
                tap(() => reloadComponent())
            );
    }

    private saveAndAddMessage(form: TypedFormGroup<T>, model: T) {
        this.modifyLoading(true);
        const updatedModel = this.buildRequestObject(form, model);
        return this.saveOperation(updatedModel) //
            .pipe(
                catchError((err) => {
                    this.modifyLoading(false);
                    return throwError(err);
                }),
                tap(() => {
                    this.messageFacade.addMessage({
                        message: this.modelToMessage(updatedModel), // Use updatedModel for 'add' support
                        severity: 'info',
                    });
                }),
                tap(() => this.modifyLoading(false))
            );
    }
}
