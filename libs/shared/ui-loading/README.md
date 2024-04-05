# ui-loading

This library was generated with [Nx](https://nx.dev).

## Loading Directive

Directive and component that will display a `mat-spinner` on the screen the directive `viocAngularLoading=true`.

### Example

    <div *viocAngularLoading="dataLoaded; class: 'testClass'"></div>

## Loading Overlay

Components that will disable screen interactions by placing an overlay over the screens content when
the loading input is `true`.

### Example

    <vioc-angular-loading-overlay [loading]="isLoading">
        <form>
            <button>Save</button>
            <input matInput placeholder="Retail Price" type="number"/>
        </form>
    </vioc-angular-loading-overlay>

## Running unit tests

Run `nx test ui-loading` to execute the unit tests.
