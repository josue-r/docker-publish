import { TypedFormGroupSelectionModel } from './typed-form-group-selection-model';
import { SelectionModel } from '@angular/cdk/collections';

// Test class to pass as T to TypedFormGroupSelectionModel
class TestModel {
    id?: number = null;
    foo?: string = null;
    bar?: string = null;
}

it('should create TypedFormGroupSelectionModel', () => {
    const typedFormGroupSelectionModel = new TypedFormGroupSelectionModel<TestModel>(false, false, 'foo');
    expect(typedFormGroupSelectionModel).toBeTruthy();
    expect(typedFormGroupSelectionModel).toBeInstanceOf(SelectionModel);
});
