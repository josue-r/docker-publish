import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './login-error.component.html',
})
export class LoginErrorComponent {
    error: string;
    errorDescription: string;

    constructor(readonly route: ActivatedRoute) {
        this.error = this.route.snapshot.queryParamMap.get('error');
        this.errorDescription = this.route.snapshot.queryParamMap.get('error_description');
    }
}
