import { normalize, strings } from '@angular-devkit/core';
import {
    apply,
    applyTemplates,
    chain,
    externalSchematic,
    mergeWith,
    move,
    noop,
    Rule,
    SchematicContext,
    Tree,
    url,
} from '@angular-devkit/schematics';
import { findNodes, insert, InsertChange } from '@nx/workspace/src/utils/ast-utils';
import * as _ from 'lodash';
import * as ts from 'typescript';
import { getTsSourceFile } from '../utils/get-ts-source-file';
import { Schema } from './schema';

function removeModule(schema: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const srcPath = `libs/${schema.project}/${schema.group}/data-access-${schema.domain}/src`;
        const moduleBaseName = `${srcPath}/lib/data-access-${schema.domain}.module`;
        // delete the module files
        tree.delete(`${moduleBaseName}.ts`);
        tree.delete(`${moduleBaseName}.spec.ts`);

        // Clear the index.ts.  The only thing it so far is is the module export
        const indexTs = `${srcPath}/index.ts`;
        tree.overwrite(indexTs, '');
        return tree;
    };
}

function generateLibrary(schema: Schema): Rule {
    return externalSchematic('@nx/angular', 'lib', {
        project: schema.project,
        name: `data-access-${schema.domain}`,
        directory: `${schema.project}/${schema.group}`,
        routing: false,
        simpleModuleName: true,
        tags: 'scope:central-ui,type:data-access',
        style: 'sass',
    });
}

function commonTemplateVariables(schema: Schema) {
    return {
        // template values
        domain: schema.domain,
        group: schema.group,
        createState: schema.createState,
        // template function to convert FooBar into 'foo-bar' in file name and template
        dasherize: strings.dasherize,
        // template function to convert "foo-bar" into 'FooBar' in file name and template
        classify: strings.classify,
        // template function to convert "foo-bar" into 'fooBar' in file name and template
        camelize: strings.camelize,
        startCase: _.startCase,
    };
}

function applyDirectoryTemplate(schema: Schema, directory: string) {
    const modulePath = `libs/${schema.project}/${schema.group}/data-access-${schema.domain}/src/lib/${directory}/`;
    return () => {
        const componentTemplateSource = apply(url(`./files/${directory}`), [
            applyTemplates(commonTemplateVariables(schema)),
            move(normalize(modulePath)),
        ]);
        return mergeWith(componentTemplateSource);
    };
}

function addLibraryExports(schema: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const indexTsPath = `libs/${schema.project}/${schema.group}/data-access-${schema.domain}/src/index.ts`;

        const endOfFile = findNodes(getTsSourceFile(tree, indexTsPath), ts.SyntaxKind.EndOfFileToken).pop();

        const modelName = strings.classify(schema.domain);
        const modelIdName = `${strings.classify(schema.domain)}Id`;
        const facadeName = `${strings.classify(schema.domain)}Facade`;
        const exportStatements = [
            `export { ${modelName}, ${modelIdName} } from './lib/model/${strings.dasherize(schema.domain)}.model'\r\n`,
            `export { ${facadeName} } from './lib/facade/${strings.dasherize(schema.domain)}.facade'\r\n`,
        ];
        const changes = exportStatements.map((stmt) => new InsertChange(indexTsPath, endOfFile.pos, stmt));
        insert(tree, indexTsPath, changes);
        return tree;
    };
}

export default function (schema: Schema): Rule {
    normalizeSchema(schema);
    return chain([
        generateLibrary(schema),
        removeModule(schema),
        applyDirectoryTemplate(schema, 'model'),
        applyDirectoryTemplate(schema, 'api'),
        schema.createState ? applyDirectoryTemplate(schema, 'state') : noop,
        applyDirectoryTemplate(schema, 'facade'),
        addLibraryExports(schema),
    ]);
}

/** Cleans the user input and add properties to pass on to @nx/angular:lib  */
function normalizeSchema(schema: Schema) {
    schema.group = strings.dasherize(schema.group);
    schema.domain = strings.dasherize(schema.domain);
    schema.createState = schema.createState || false;
    schema.project = schema.project || 'central-ui';
}
