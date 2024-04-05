import { FormGroup } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { FormFactoryOptions } from './form-factory-options';
import { TypedFormGroup } from './typed-form-group';

/** Creates a FormGroup or TypedForm group for a particular model. */
export type FormCreator<T> = (
    model: T,
    componentDestroyed: ReplaySubject<any>,
    opts: FormFactoryOptions
) => FormGroup | TypedFormGroup<T>;
