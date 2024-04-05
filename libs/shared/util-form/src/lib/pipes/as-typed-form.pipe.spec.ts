import { FormGroup } from '@angular/forms';
import { TypedFormGroup } from '../form/typed-form-group';
import { AsTypedFormPipe } from './as-typed-form.pipe';

describe('AsTypedFormPipe', () => {
    it('create an instance', () => {
        const pipe = new AsTypedFormPipe();
        expect(pipe).toBeTruthy();
    });
    it('should cast', () => {
        const group: FormGroup = new TypedFormGroup(new FormGroup({}));

        const typed = new AsTypedFormPipe().transform(group);
        expect(typed).toBeInstanceOf(TypedFormGroup);
    });
});
