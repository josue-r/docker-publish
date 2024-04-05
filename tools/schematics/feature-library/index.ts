import { normalize, strings } from '@angular-devkit/core';
import {
    apply,
    applyTemplates,
    chain,
    externalSchematic,
    mergeWith,
    move,
    Rule,
    url,
} from '@angular-devkit/schematics';
import {} from '@nx/workspace/src/utils/ast-utils';
import * as _ from 'lodash';
import { Schema } from './schema';

function generateLibraryAndModule(schema: Schema): Rule[] {
    const name = `feature-${schema.domain}`;
    const generateModule = externalSchematic('@nx/angular', 'lib', {
        project: schema.project,
        componentPrefix: 'vioc-angular',
        name,
        directory: `${schema.project}/${schema.group}`,
        // skip router configuration. Will replace module file
        routing: false,
        // Keep the module name simple (when using --directory)
        simpleModuleName: true,
        tags: 'scope:central-ui,type:feature',
        style: 'sass',
    });

    // copy the module and form files
    const modulePath = `libs/${schema.project}/${schema.group}/${name}/src/lib`;
    const updateModuleFiles: Rule = (tree) =>
        chain([
            // delete the original file
            () => tree.delete(`${modulePath}/feature-${schema.domain}.module.ts`),
            // apply our changes
            mergeWith(
                apply(url('./files/root'), [
                    applyTemplates(commonTemplateVariables(schema)),
                    move(normalize(modulePath)),
                ])
            ),
        ]);

    return [generateModule, updateModuleFiles];
}

function commonTemplateVariables(schema: Schema) {
    return {
        // template values
        domain: schema.domain,
        group: schema.group,
        rolePrefix: 'ROLE_' + strings.underscore(schema.domain).toUpperCase(),
        // template function to convert FooBar into 'foo-bar' in file name and template
        dasherize: strings.dasherize,
        // template function to convert "foo-bar" into 'FooBar' in file name and template
        classify: strings.classify,
        // template function to convert "foo-bar" into 'fooBar' in file name and template
        camelize: strings.camelize,
        startCase: _.startCase,
    };
}

function generateViewEditComponent(schema: Schema): Rule {
    const modulePath = `libs/${schema.project}/${schema.group}/feature-${schema.domain}`;
    const componentPath = `${modulePath}/src/lib/${strings.dasherize(schema.domain)}`;
    return () => {
        const componentTemplateSource = apply(url('./files/component'), [
            applyTemplates(commonTemplateVariables(schema)),
            move(normalize(componentPath)),
        ]);
        return mergeWith(componentTemplateSource);
    };
}

function generateSearchComponent(schema: Schema): Rule {
    const modulePath = `libs/${schema.project}/${schema.group}/feature-${schema.domain}`;
    const componentPath = `${modulePath}/src/lib/${strings.dasherize(schema.domain)}-search`;
    // replace the html with our file
    return () => {
        const componentTemplateSource = apply(url('./files/search'), [
            applyTemplates(commonTemplateVariables(schema)),
            move(normalize(componentPath)),
        ]);
        return mergeWith(componentTemplateSource);
    };
}

export default function (schema: Schema): Rule {
    updateSchema(schema);
    return chain([
        ...generateLibraryAndModule(schema), //
        // createForms(schema),
        // addModuleImports(schema),
        generateViewEditComponent(schema),
        generateSearchComponent(schema),
    ]);
}

/** Cleans the user input and add properties to pass on to @nx/angular:lib  */
function updateSchema(schema: Schema) {
    // local to this schematic
    schema.domain = strings.dasherize(schema.domain);
    schema.group = strings.dasherize(schema.group);
    schema.project = 'central-ui'; // TODO: Make this an input
}
