import { SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

/** Copied from:  https://github.com/nrwl/nx/blob/master/packages/angular/src/utils/ast-utils.ts*/
export function getTsSourceFile(host: Tree, path: string): ts.SourceFile {
    const buffer = host.read(path);
    if (!buffer) {
        throw new SchematicsException(`Could not read TS file (${path}).`);
    }
    const content = buffer.toString();
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);

    return source;
}
