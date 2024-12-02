"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIMediatorLink = void 0;
const path_1 = require("path");
const CIBase_1 = require("./CIBase");
class CIMediatorLink extends CIBase_1.CIBase {
    async readyToInject() {
        if (!this._CIItemData.lpath)
            return;
        this.sourceFile.addImportDeclaration({
            moduleSpecifier: this.sourceFile.getRelativePathTo((0, path_1.join)(Editor.Project.path, this._CIItemData.lpath.replace('.ts', ''))),
            namedImports: [{ name: (0, path_1.basename)(this._CIItemData.lpath).replace('.ts', '') }]
        });
    }
}
exports.CIMediatorLink = CIMediatorLink;
