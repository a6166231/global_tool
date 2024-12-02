import { basename, dirname, join } from "path";
import { CIBase } from "./CIBase";

export class CIMediatorLink extends CIBase {

    async readyToInject() {
        if (!this._CIItemData.lpath) return

        this.sourceFile.addImportDeclaration({
            moduleSpecifier: this.sourceFile.getRelativePathTo(join(Editor.Project.path, this._CIItemData.lpath!.replace('.ts', ''))),
            namedImports: [{ name: basename(this._CIItemData.lpath).replace('.ts', '') }]
        })
    }
}