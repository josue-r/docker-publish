import { NgModule } from '@angular/core';
import { enableJestInputExtension } from './jest/input-extension';

@NgModule({
    declarations: [],
    imports: [],
})
export class TestModule {
    constructor() {
        enableJestInputExtension();
    }
}
