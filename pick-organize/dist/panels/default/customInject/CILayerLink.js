"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CILayerLink = void 0;
const ts_morph_1 = require("ts-morph");
const CIBase_1 = require("./CIBase");
const path_1 = require("path");
class CILayerLink extends CIBase_1.CIBase {
    readyToInject() {
        if (!this._CIItemData.opath)
            return;
        let extName = (0, path_1.extname)(this._CIItemData.opath);
        let fileName = (0, path_1.basename)(this._CIItemData.opath).replace(extName, '');
        let _class = this.sourceFile.getClass(fileName);
        if (!_class)
            return;
        let _extends = _class.getExtends();
        if (!_extends)
            return;
        let baseClassName = fileName.replace('Layer', '');
        let interfaceName = baseClassName + 'Data';
        this.sourceFile.insertInterface(_class.getChildIndex(), {
            kind: ts_morph_1.StructureKind.Interface,
            name: interfaceName,
            properties: [],
            extends: ['BaseUIData']
        });
        _extends.addTypeArgument(interfaceName);
        this.sourceFile.addImportDeclaration({
            moduleSpecifier: this.sourceFile.getRelativePathTo(this._CIItemData.lpath.replace('.ts', '')),
            namedImports: [{ name: 'BaseUIData' }]
        });
        let method = _class.getMethod('onInit');
        if (!method)
            return;
        let data = method.getParameter('data');
        if (!data)
            return;
        data.setType(interfaceName);
    }
}
exports.CILayerLink = CILayerLink;
