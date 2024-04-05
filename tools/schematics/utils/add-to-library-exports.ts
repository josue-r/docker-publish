import { Tree } from '@angular-devkit/schematics';

export function addToLibraryExports(tree: Tree, schema: { sourceDir: string }, relativePath: string) {
    const indexPath = `${schema.sourceDir}\index.ts`;
    const indexContent = tree.get(indexPath).content.toString();
    const exportLine = `export * from './lib/${relativePath}';\r\n`;
    tree.overwrite(indexPath, `${indexContent}${exportLine}`);
}
